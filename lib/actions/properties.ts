
"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function savePropertyAction(formData: FormData) {
  const supabase = await createAdminClient();

  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  const moneda = formData.get("moneda_seleccionada") as string;
  const valorRaw = Number(formData.get("valor_arriendo_numeric"));
  
  // Si es CLP, convertimos a UF (valor aproximado para demo/consistencia)
  // En producción esto debería consultar una API de indicadores diarios
  let valorUF = valorRaw;
  if (moneda === "CLP") {
    const VALOR_UF_ESTIMADO = 37500; 
    valorUF = Number((valorRaw / VALOR_UF_ESTIMADO).toFixed(2));
  }

  const body = {
    owner_id: user.id,
    tipo: formData.get("tipo") as string,
    direccion: formData.get("direccion") as string,
    numero: formData.get("numero") as string || null,
    depto: formData.get("depto") as string || null,
    comuna: formData.get("comuna") as string,
    region: formData.get("region") as string,
    metros_cuadrados: formData.get("metros") ? Number(formData.get("metros")) : null,
    dormitorios: formData.get("dormitorios") ? Number(formData.get("dormitorios")) : null,
    banos: formData.get("banos") ? Number(formData.get("banos")) : null,
    amoblada: formData.get("amoblada") === "on",
    valor_uf: valorUF,
    valor_arriendo: valorRaw, // Valor original ingresado
    moneda: moneda,           // UF o CLP
    rol_avaluo: formData.get("rol_avaluo") as string || null,
    descripcion: formData.get("descripcion") as string || null,
    tiene_agua: formData.get("tiene_agua") === "on",
    tiene_luz: formData.get("tiene_luz") === "on",
    tiene_gas: formData.get("tiene_gas") === "on",
    activa: true,
  };

  try {
    const { error } = await (supabase as any).from("properties").insert(body);
    if (error) return { success: false, error: error.message };

    revalidatePath("/propietario/propiedades");
    revalidatePath("/propietario/servicios");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
