
import { consultarDeudaUnired } from "../lib/servicios/unired";

async function test() {
  console.log("Iniciando prueba de Unired...");
  
  // Usamos los datos reales de tu captura para validar
  const resultado = await consultarDeudaUnired("agua", "Aguas Andinas", "2.712.299-k");
  
  console.log("Resultado de la consulta:");
  console.log(JSON.stringify(resultado, null, 2));

  if (resultado.monto === 20870) {
    console.log("✅ ÉXITO: El monto coincide con la captura!");
  } else {
    console.log("❌ ERROR: El monto no coincide.");
  }
}

test().catch(console.error);
