import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { consultarDeudaUnired } from "@/lib/servicios/unired";

/**
 * Sincroniza las deudas de servicios básicos de todas las propiedades.
 * Se espera que este endpoint sea llamado por un Cron Job (Vercel Cron).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (process.env.NODE_ENV === "production" && secret !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = await createAdminClient();

  try {
    console.log("[Cron] Iniciando sincronización de servicios...");
    
    // 1. Obtener todas las cuentas de servicios
    const { data: cuentas } = await supabase.from("utility_accounts").select("*");
    
    if (!cuentas) return NextResponse.json({ success: true, procesados: 0 });

    const resultados = [];

    // 2. Procesar cada cuenta
    for (const cuenta of (cuentas as any[])) {
      try {
        const data = await consultarDeudaUnired(
          cuenta.tipo,
          cuenta.proveedor,
          cuenta.numero_cliente
        );

        // 3. Actualizar la base de datos
        await supabase
          .from("utility_accounts")
          .update({
            monto_deuda: data.monto.toString(),
            fecha_vencimiento: data.vencimiento,
            ultima_consulta: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", cuenta.id);

        resultados.push({
          id: cuenta.id,
          success: !data.error,
          monto: data.monto,
        });
      } catch (err) {
        console.error(`[Cron] Error procesando cuenta ${cuenta.id}:`, err);
        resultados.push({ id: cuenta.id, success: false, error: String(err) });
      }
    }

    return NextResponse.json({
      success: true,
      procesados: resultados.length,
      detalles: resultados,
    });

  } catch (error) {
    console.error("[Cron] Error fatal en sincronización de servicios:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
