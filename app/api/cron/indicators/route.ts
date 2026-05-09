import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Cron job: Actualiza indicadores económicos desde mindicador.cl
 * GET /api/cron/indicators
 * 
 * Ejecutar diariamente (Vercel Cron o similar)
 * Autenticado con CRON_SECRET para evitar acceso no autorizado
 * 
 * TODO(env): CRON_SECRET — Secret para autenticar llamadas a endpoints cron
 */
export async function GET(request: NextRequest) {
  // Verificar autenticación del cron
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || cronSecret.startsWith("placeholder")) {
    console.warn("TODO(env): CRON_SECRET no configurada — endpoint expuesto en desarrollo");
  } else if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const hoy = new Date().toISOString().split("T")[0] ?? "";
    const resultados: Record<string, number | null> = { uf: null, ipc: null, utm: null };

    // ── UF ─────────────────────────────────────────────────────
    try {
      const resUF = await fetch("https://mindicador.cl/api/uf", {
        next: { revalidate: 3600 },
      });
      if (resUF.ok) {
        const dataUF = await resUF.json() as { serie?: Array<{ valor?: number }> };
        resultados["uf"] = dataUF?.serie?.[0]?.valor ?? null;
      }
    } catch {
      console.error("Error obteniendo UF desde mindicador.cl");
    }

    // ── IPC ────────────────────────────────────────────────────
    try {
      const resIPC = await fetch("https://mindicador.cl/api/ipc", {
        next: { revalidate: 3600 },
      });
      if (resIPC.ok) {
        const dataIPC = await resIPC.json() as { serie?: Array<{ valor?: number }> };
        resultados["ipc"] = dataIPC?.serie?.[0]?.valor ?? null;
      }
    } catch {
      console.error("Error obteniendo IPC desde mindicador.cl");
    }

    // ── UTM ────────────────────────────────────────────────────
    try {
      const resUTM = await fetch("https://mindicador.cl/api/utm", {
        next: { revalidate: 3600 },
      });
      if (resUTM.ok) {
        const dataUTM = await resUTM.json() as { serie?: Array<{ valor?: number }> };
        resultados["utm"] = dataUTM?.serie?.[0]?.valor ?? null;
      }
    } catch {
      console.error("Error obteniendo UTM desde mindicador.cl");
    }

    // Verificar que obtuvimos datos
    if (!resultados["uf"] || !resultados["ipc"] || !resultados["utm"]) {
      return NextResponse.json(
        { error: "No se pudieron obtener todos los indicadores", resultados },
        { status: 502 }
      );
    }

    // ── Guardar en base de datos ───────────────────────────────
    const supabase = await createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("economic_indicators").upsert(
      {
        fecha: hoy,
        uf: Number(resultados["uf"]),
        ipc: Number(resultados["ipc"]),
        utm: Number(resultados["utm"]),
      },
      { onConflict: "fecha" }
    );

    if (error) {
      console.error("Error guardando indicadores:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      fecha: hoy,
      indicadores: resultados,
    });
  } catch (err) {
    console.error("Error en cron indicators:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
