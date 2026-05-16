/**
 * Consulta Unired a través de nuestro proxy Edge (/api/proxy/unired).
 * El proxy corre en Cloudflare Edge (IPs distintas a Lambda), lo que evita
 * el bloqueo de Unired a IPs de data center de AWS.
 */

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

async function uniredProxy(endpoint: string, payload: unknown) {
  const res = await fetch("/api/proxy/unired", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint, payload }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
}

export async function consultarDeudaUniredClient(
  proveedor: string,
  numeroCliente: string
): Promise<ResultadoDeuda> {
  const prov = PROVEEDORES_IDS[proveedor];
  if (!prov) throw new Error(`Proveedor '${proveedor}' no configurado.`);

  // Paso 1: Obtener IdCuenta
  const data1 = await uniredProxy(
    "/apiAgregaCuentaExpress/GeneraConsultaPagoCuentasExpressHome",
    [{
      NombreServicio: prov.nombre,
      IdEmpresaRubro: prov.id,
      IdEmpresaRubroPadre: -10,
      IdConsultaBoleta: -1,
      DetalleIdentificadores: [{
        ValorIdentificador: numeroCliente,
        DescIdentificador: "Número de Cuenta",
        NombreIdentificador: "NUMCLI",
      }],
    }]
  );

  const idCuenta        = data1.body?.[0]?.IdCuenta;
  const claveConsulta   = data1.body?.[0]?.ClaveConsultaBoleta;
  const claveCuentaToken = data1.body?.[0]?.ClaveCuenta;

  if (!idCuenta) throw new Error("No se obtuvo IdCuenta de Unired.");

  // Paso 2: Activar consulta
  await uniredProxy("/api/ConsultaBoletaHome", {
    idConsulta: claveConsulta,
    idCuenta: claveCuentaToken,
    isMobile: false,
  });

  // Paso 3: Obtener deuda
  const data3 = await uniredProxy("/api/ObtieneConsultaXcash", {
    idCanal: 1,
    idCuenta,
  });

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
