
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

  let error;
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

  if (error) throw new Error(error.message);

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
