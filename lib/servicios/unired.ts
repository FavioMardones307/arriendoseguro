/**
 * Servicio para interactuar con Unired.cl y obtener deudas de servicios básicos.
 * Token y endpoints actualizados desde bundle JS de Unired (2026-05-15).
 */

export interface DatosDeuda {
  monto: number;
  vencimiento: string | null;
  pagado: boolean;
  saldo_anterior?: number;
  error?: string;
}

const UNIRED_AUTH = "Basic OSUyYlRGeWpHZ2FOMHFYcHVBcFg3JTJmdFZWOTFVa21KZHB2SkxQZHRmcjlYOVpqNjc3ZnR1NkFNTTdSWXNscWVDeFg=";

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
};

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

export async function consultarDeudaUnired(
  tipo: string,
  proveedor: string,
  numeroCliente: string
): Promise<DatosDeuda> {
  console.log(`[Unired] Consultando ${tipo} (${proveedor}) para cliente ${numeroCliente}...`);

  const prov = PROVEEDORES_IDS[proveedor];
  if (!prov) {
    return { monto: 0, vencimiento: null, pagado: false,
      error: `Proveedor '${proveedor}' no configurado para Unired.` };
  }

  const headers = {
    ...BROWSER_HEADERS,
    "Authorization": UNIRED_AUTH,
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://www.unired.cl",
    "Referer": "https://www.unired.cl/",
  };

  try {
    // PASO 1: Generar consulta
    const resp1 = await fetch("https://apiportal.unired.cl/apiAgregaCuentaExpress/GeneraConsultaPagoCuentasExpressHome", {
      method: "POST", headers,
      body: JSON.stringify([{
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
      }]),
    });

    const data1 = await resp1.json();
    const claveConsulta = data1.body?.[0]?.ClaveConsultaBoleta;
    const claveCuentaToken = data1.body?.[0]?.ClaveCuenta;
    if (!claveConsulta) throw new Error("No se pudo obtener clave de consulta de Unired.");

    // PASO 2: Activar consulta y obtener idCuenta real
    const resp2 = await fetch("https://apiportal.unired.cl/api/ConsultaBoletaHome", {
      method: "POST", headers,
      body: JSON.stringify({ idConsulta: claveConsulta, idCuenta: claveCuentaToken, isMobile: false }),
    });
    const data2 = await resp2.json();
    const idCuentaXcash = data2.body?.boletas?.[0]?.idCuenta;
    if (!idCuentaXcash) {
      return { monto: 0, vencimiento: null, pagado: true, saldo_anterior: 0,
        error: "No se encontraron deudas pendientes en Unired." };
    }

    // PASO 3: Obtener deuda real
    const resp3 = await fetch("https://apiportal.unired.cl/api/ObtieneConsultaXcash", {
      method: "POST", headers,
      body: JSON.stringify({ idCanal: 1, idCuenta: idCuentaXcash }),
    });
    const data3 = await resp3.json();
    const gruposCuotas = data3.body?.cuenta?.gruposCuotas || [];
    const cuota = gruposCuotas[0]?.cuotas?.[0];

    if (!cuota) {
      return { monto: 0, vencimiento: null, pagado: true, saldo_anterior: 0 };
    }

    let vencimiento = null;
    if (cuota.fechaVencimiento) {
      const [d, m, y] = cuota.fechaVencimiento.split("-");
      if (d && m && y) vencimiento = `${y}-${m}-${d}`;
    }

    const saldo_anterior = cuota.saldoAnterior || gruposCuotas[0]?.cuotas?.[1]?.monto || 0;

    return {
      monto: cuota.monto || 0,
      vencimiento,
      pagado: (cuota.monto || 0) === 0,
      saldo_anterior,
    };

  } catch (error: any) {
    console.error("[Unired] Error:", error.message);
    return { monto: 0, vencimiento: null, pagado: false,
      error: `Falla de conexión con Unired: ${error.message}` };
  }
}
