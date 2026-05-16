/**
 * Consulta Unired a través de nuestro proxy Edge (/api/proxy/unired).
 * El proxy corre en Cloudflare Edge (IPs distintas a Lambda), lo que evita
 * el bloqueo de Unired a IPs de data center de AWS.
 */

interface ProveedorConfig {
  nombre: string;
  id: number;
  idIdentificador: number;
  idTipoMetaDato: number;
  largo: number;
  correlativo: string;
  urlImg: string;
  descIdentificador: string;
}

export const PROVEEDORES_IDS: Record<string, ProveedorConfig> = {
  // AGUA
  "Aguas Andinas":    { nombre: "Aguas Andinas",   id: 60,  idIdentificador: 75,  idTipoMetaDato: 3, largo: 11, correlativo: "0", urlImg: "AGAANDNUMCLI.jpg", descIdentificador: "Número de Cuenta" },
  "Aguas Cordillera": { nombre: "Aguas Cordillera", id: 61,  idIdentificador: 76,  idTipoMetaDato: 3, largo: 11, correlativo: "0", urlImg: "AGACORNUMCLI.jpg", descIdentificador: "Número de Cuenta" },
  "Aguas Manquehue":  { nombre: "Aguas Manquehue",  id: 62,  idIdentificador: 77,  idTipoMetaDato: 3, largo: 11, correlativo: "0", urlImg: "AGAMANNUMCLI.jpg", descIdentificador: "Número de Cuenta" },
  "Essbio":           { nombre: "Essbio",           id: 16,  idIdentificador: 16,  idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "ESSBIOIDSERV.jpg", descIdentificador: "Número de Cuenta" },
  "Esval":            { nombre: "Esval",            id: 4,   idIdentificador: 4,   idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "PAGESVNUMSUM.jpg", descIdentificador: "Número de Cuenta" },
  "Aguas del Valle":  { nombre: "Aguas del Valle",  id: 5,   idIdentificador: 5,   idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "PAGVALNUMSUM.jpg", descIdentificador: "Número de Cuenta" },
  // ELECTRICIDAD
  "Enel":             { nombre: "Enel",             id: 238, idIdentificador: 345, idTipoMetaDato: 3, largo: 10, correlativo: "0", urlImg: "PAENENNUMCLI.jpg", descIdentificador: "Numero Cliente" },
  "CGE S.A.":         { nombre: "CGE S.A.",         id: 107, idIdentificador: 125, idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "CGECGENUMCLI.jpg", descIdentificador: "Número de Cuenta" },
  "Chilquinta":       { nombre: "Chilquinta",       id: 49,  idIdentificador: 64,  idTipoMetaDato: 3, largo: 10, correlativo: "0", urlImg: "BOLCHINIS.jpg",    descIdentificador: "Número de Cuenta" },
  "Saesa":            { nombre: "Saesa",            id: 162, idIdentificador: 240, idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "SAESANUMSRV.jpg",  descIdentificador: "Número de Cuenta" },
  "Frontel":          { nombre: "Frontel",          id: 160, idIdentificador: 238, idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "SAEFRTNUMSRV.jpg", descIdentificador: "Número de Cuenta" },
  // GAS
  "Metrogas":         { nombre: "Metrogas",         id: 186, idIdentificador: 268, idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "PAGMTGNUMCLI.jpg", descIdentificador: "Número de Cuenta" },
  "Gasco":            { nombre: "Gasco",            id: 204, idIdentificador: 289, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "GASMEDNUMCLI.jpg", descIdentificador: "Número de Cuenta" },
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

  // Paso 1: Generar consulta
  const data1 = await uniredProxy(
    "/apiAgregaCuentaExpress/GeneraConsultaPagoCuentasExpressHome",
    [{
      NombreServicio: prov.nombre,
      IdEmpresaRubro: prov.id,
      IdEmpresaRubroPadre: -10,
      IdConsultaBoleta: -1,
      DetalleIdentificadores: [{
        ValorIdentificador: numeroCliente,
        DescIdentificador: prov.descIdentificador,
        IdTipoMetaDato: prov.idTipoMetaDato,
        Correlativo: prov.correlativo,
        IdIdentificador: prov.idIdentificador,
        LargoIdentificador: prov.largo,
        NombreIdentificador: "NUMCLI",
        ReIngresa: false,
        UrlImagenIdentificador: prov.urlImg,
      }],
    }]
  );

  const claveConsulta    = data1.body?.[0]?.ClaveConsultaBoleta;
  const claveCuentaToken = data1.body?.[0]?.ClaveCuenta;
  if (!claveConsulta) throw new Error("No se obtuvo clave de consulta de Unired.");

  // Paso 2: Activar consulta → obtener idCuenta real de la boleta
  const data2 = await uniredProxy("/api/ConsultaBoletaHome", {
    idConsulta: claveConsulta,
    idCuenta: claveCuentaToken,
    isMobile: false,
  });

  const idCuentaXcash = data2.body?.boletas?.[0]?.idCuenta;
  if (!idCuentaXcash) {
    // Sin boletas pendientes = servicio al día
    return { monto: 0, vencimiento: null, saldo_anterior: 0 };
  }

  // Paso 3: Obtener deuda real
  const data3 = await uniredProxy("/api/ObtieneConsultaXcash", {
    idCanal: 1,
    idCuenta: idCuentaXcash,
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
