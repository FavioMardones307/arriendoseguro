/**
 * Consulta Unired desde el browser del usuario.
 * Esto evita el bloqueo de IPs de Vercel (data center) — las IPs residenciales
 * de los usuarios no están bloqueadas por Unired.
 */

const UNIRED_AUTH = "Basic OSUyYIRGeWpHWzZFOMHFYcHVBCfg3JTJmdFZMOTFVa21KZHB2SkxQZHRmcjIYOVpqNjc3ZnR1NTDSWXNscWVDeFg=";

export const PROVEEDORES_IDS: Record<string, { id: number; nombre: string }> = {
  "Aguas Andinas":    { id: 75,  nombre: "Aguas Andinas" },
  "Aguas Cordillera": { id: 60,  nombre: "Aguas Cordillera" },
  "Aguas Manquehue":  { id: 60,  nombre: "Aguas Manquehue" },
  "Essbio":           { id: 70,  nombre: "Essbio" },
  "Esval":            { id: 80,  nombre: "Esval" },
  "Aguas del Valle":  { id: 90,  nombre: "Aguas del Valle" },
  "Enel":             { id: 25,  nombre: "Enel" },
  "CGE S.A.":         { id: 15,  nombre: "CGE S.A." },
  "Chilquinta":       { id: 35,  nombre: "Chilquinta" },
  "Saesa":            { id: 45,  nombre: "Saesa" },
  "Frontel":          { id: 55,  nombre: "Frontel" },
  "Luz del Sur":      { id: 65,  nombre: "Luz del Sur" },
  "Metrogas":         { id: 50,  nombre: "Metrogas" },
  "Lipigas":          { id: 140, nombre: "Lipigas" },
  "Abastible":        { id: 150, nombre: "Abastible" },
  "Gasco":            { id: 160, nombre: "Gasco" },
};

export interface ResultadoDeuda {
  monto: number;
  vencimiento: string | null;
  saldo_anterior: number;
}

export async function consultarDeudaUniredClient(
  proveedor: string,
  numeroCliente: string
): Promise<ResultadoDeuda> {
  const prov = PROVEEDORES_IDS[proveedor];
  if (!prov) throw new Error(`Proveedor '${proveedor}' no configurado.`);

  const headers = {
    Authorization: UNIRED_AUTH,
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
    Origin: "https://www.unired.cl",
    Referer: "https://www.unired.cl/",
  };

  // Paso 1: Obtener IdCuenta
  const resp1 = await fetch(
    "https://apiportal.unired.cl/api/Consulta/GeneraConsultaPagoCuentasExpressHome",
    {
      method: "POST",
      headers,
      body: JSON.stringify([{
        NombreServicio: prov.nombre,
        IdEmpresaRubro: prov.id,
        IdEmpresaRubroPadre: -10,
        IdConsultaBoleta: -1,
        DetalleIdentificadores: [{
          ValorIdentificador: numeroCliente,
          DescIdentificador: "Número de Cuenta",
          NombreIdentificador: "NUMCLI",
        }],
      }]),
    }
  );

  if (!resp1.ok) throw new Error(`Unired respondió ${resp1.status}`);
  const data1 = await resp1.json();
  const idCuenta       = data1.body?.[0]?.IdCuenta;
  const claveConsulta  = data1.body?.[0]?.ClaveConsultaBoleta;
  const claveCuentaToken = data1.body?.[0]?.ClaveCuenta;

  if (!idCuenta) throw new Error("No se obtuvo IdCuenta de Unired.");

  // Paso 2: Activar consulta
  await fetch("https://apiportal.unired.cl/api/Consulta/ConsultaBoletaHome", {
    method: "POST",
    headers,
    body: JSON.stringify({ idConsulta: claveConsulta, idCuenta: claveCuentaToken, isMobile: false }),
  });

  // Paso 3: Obtener deuda
  const resp3 = await fetch("https://apiportal.unired.cl/api/ObtieneConsultaXcash", {
    method: "POST",
    headers,
    body: JSON.stringify({ idCanal: 1, idCuenta }),
  });

  if (!resp3.ok) throw new Error(`Unired respondió ${resp3.status} en paso 3`);
  const data3 = await resp3.json();
  const gruposCuotas = data3.body?.cuenta?.gruposCuotas || [];
  const cuota = gruposCuotas[0]?.cuotas?.[0];

  if (!cuota) return { monto: 0, vencimiento: null, saldo_anterior: 0 };

  let vencimiento: string | null = null;
  if (cuota.fechaVencimiento) {
    const [d, m, y] = cuota.fechaVencimiento.split("-");
    if (d && m && y) vencimiento = `${y}-${m}-${d}`;
  }

  const saldo_anterior =
    cuota.saldoAnterior ||
    cuota.montoSaldoAnterior ||
    gruposCuotas[0]?.cuotas?.[1]?.monto ||
    0;

  return { monto: cuota.monto || 0, vencimiento, saldo_anterior };
}
