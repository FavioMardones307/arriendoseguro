import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { accountId, monto, vencimiento, saldo_anterior } = await req.json();
    if (!accountId || monto === undefined) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Verificar que la cuenta pertenece al usuario
    const { data: account } = await supabase
      .from("utility_accounts")
      .select("id, property_id, properties(owner_id)")
      .eq("id", accountId)
      .single();

    if (!account || (account.properties as any)?.owner_id !== user.id) {
      return NextResponse.json({ error: "Cuenta no autorizada" }, { status: 403 });
    }

    const { error } = await supabase
      .from("utility_accounts")
      .update({
        monto_deuda: monto,
        saldo_anterior: saldo_anterior ?? 0,
        fecha_vencimiento: vencimiento ?? null,
        ultima_consulta: new Date().toISOString(),
      })
      .eq("id", accountId);

    if (error) throw error;

    revalidatePath("/propietario/servicios");
    revalidatePath("/propietario");

    return NextResponse.json({ success: true, monto });
  } catch (err: any) {
    console.error("[SyncUtility API]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
