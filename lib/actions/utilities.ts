
"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveUtilityAccount(formData: {
  property_id: string;
  tipo: string;
  proveedor: string;
  numero_cliente: string;
  id?: string;
}) {
  const supabase = await createAdminClient();

  const data = {
    property_id: formData.property_id,
    tipo: formData.tipo,
    proveedor: formData.proveedor,
    numero_cliente: formData.numero_cliente,
    updated_at: new Date().toISOString(),
  };

  // Validación para IDs de prueba (Mocks)
  if (["1", "2", "3"].includes(formData.property_id)) {
    throw new Error("Esta es una propiedad de demostración. Por favor, registra una propiedad real en la sección 'Propiedades' para activar el monitoreo de servicios.");
  }

  let error;
  try {
    if (formData.id) {
      // Update
      const { error: err } = await supabase
        .from("utility_accounts")
        .update(data)
        .eq("id", formData.id);
      error = err;
    } else {
      // Insert
      const { error: err } = await supabase
        .from("utility_accounts")
        .insert([data]);
      error = err;
    }
  } catch (e: any) {
    throw new Error("Error de conexión con la base de datos: " + e.message);
  }

  if (error) {
    console.error("Supabase Error:", error);
    throw new Error(error.message || "Error al guardar en la base de datos");
  }

  revalidatePath("/propietario/servicios");
  revalidatePath("/propietario");
  return { success: true };
}

export async function deleteUtilityAccount(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("utility_accounts")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/propietario/servicios");
  revalidatePath("/propietario");
  return { success: true };
}

/**
 * Sincroniza la deuda de una cuenta específica con Unired.cl
 */
export async function syncUtilityDebtAction(accountId: string) {
  const supabase = await createAdminClient();
  const { consultarDeudaUnired } = await import("@/lib/servicios/unired");

  try {
    // 1. Obtener datos de la cuenta
    const { data: account, error: fetchError } = await supabase
      .from("utility_accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (fetchError || !account) throw new Error("Cuenta no encontrada");

    // 2. Consultar Unired
    const result = await consultarDeudaUnired(
      account.tipo,
      account.proveedor,
      account.numero_cliente
    );

    if (result.error) throw new Error(result.error);

    // 3. Actualizar base de datos
    const { error: updateError } = await supabase
      .from("utility_accounts")
      .update({
        monto_deuda: result.monto,
        fecha_vencimiento: result.vencimiento,
        ultimo_sincro: new Date().toISOString()
      })
      .eq("id", accountId);

    if (updateError) throw updateError;

    revalidatePath("/propietario");
    revalidatePath(`/propietario/propiedades/${account.property_id}`);
    
    return { 
      success: true, 
      monto: result.monto,
      vencimiento: result.vencimiento
    };
  } catch (error: any) {
    console.error("[SyncAction] Error:", error.message);
    return { success: false, error: error.message };
  }
}
