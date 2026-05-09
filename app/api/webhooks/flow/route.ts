import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * Webhook de confirmación de pagos Flow.cl
 * POST /api/webhooks/flow
 * 
 * Flow envía: token, status, amount, commerce_order
 * Debemos verificar la firma HMAC-SHA256 con FLOW_SECRET_KEY
 * 
 * TODO(env): FLOW_SECRET_KEY — Secret key de Flow.cl para verificar webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);

    // ── Verificar firma de Flow ───────────────────────────────
    const flowSecret = process.env.FLOW_SECRET_KEY;
    if (!flowSecret || flowSecret.startsWith("placeholder")) {
      console.warn("TODO(env): FLOW_SECRET_KEY no configurada — saltando verificación en desarrollo");
    } else {
      const receivedSign = params.get("s") ?? "";
      // Ordenar parámetros alfabéticamente excepto 's'
      const paramsToSign = [...params.entries()]
        .filter(([k]) => k !== "s")
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}${v}`)
        .join("");

      const expectedSign = crypto
        .createHmac("sha256", flowSecret)
        .update(paramsToSign)
        .digest("hex");

      if (receivedSign !== expectedSign) {
        return NextResponse.json(
          { error: "Firma inválida" },
          { status: 401 }
        );
      }
    }

    // ── Procesar pago ─────────────────────────────────────────
    const token = params.get("token");
    const status = params.get("status"); // 2=pagado, 3=rechazado, 4=anulado
    const amount = params.get("amount");
    const commerceOrder = params.get("commerceOrder"); // Nuestro payment.id

    if (!token || !status || !commerceOrder) {
      return NextResponse.json(
        { error: "Parámetros faltantes" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    if (status === "2") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: payment, error: paymentError } = await (supabase as any)
        .from("payments")
        .update({
          estado: "pagado",
          flow_token: token,
          monto_pagado: amount ? parseFloat(amount) : undefined,
          fecha_pago: new Date().toISOString(),
          metodo: "flow",
          dias_atraso: 0,
        })
        .eq("id", commerceOrder)
        .select()
        .single();

      if (paymentError || !payment) {
        console.error("Error actualizando pago:", paymentError);
        return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("audit_log").insert({
        accion: "pago_confirmado_flow",
        entidad: "payments",
        entidad_id: commerceOrder,
        meta: { token, amount, status },
        ip: request.headers.get("x-forwarded-for") ?? undefined,
      });

      // TODO: Disparar recálculo de ArriendoScore (evento pago_puntual)
      // TODO: Generar comprobante PDF y enviarlo por email

    } else if (status === "3" || status === "4") {
      // Pago rechazado o anulado
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("payments")
        .update({ flow_token: token })
        .eq("id", commerceOrder);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en webhook Flow:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
