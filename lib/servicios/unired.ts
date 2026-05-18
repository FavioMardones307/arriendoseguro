/**
 * Servicio para interactuar con Unired.cl y obtener deudas de servicios básicos.
 * Token y endpoints actualizados desde bundle JS de Unired (2026-05-15).
 * IDs verificados via api/empresaAutoComplete + ObtenerIdentificadoresCtaExpress.
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
  nombreIdentificador: string;
}

export const PROVEEDORES_IDS: Record<string, ProveedorConfig> = {
  // ─── AGUA ───────────────────────────────────────────────────────────────────
  "Aguas Andinas":            { nombre: "Aguas Andinas",            id: 60,  idIdentificador: 75,  idTipoMetaDato: 3, largo: 11, correlativo: "0", urlImg: "AGAANDNUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Aguas Cordillera":         { nombre: "Aguas Cordillera",         id: 61,  idIdentificador: 76,  idTipoMetaDato: 3, largo: 11, correlativo: "0", urlImg: "AGACORNUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Aguas Manquehue":          { nombre: "Aguas Manquehue",          id: 62,  idIdentificador: 77,  idTipoMetaDato: 3, largo: 11, correlativo: "0", urlImg: "AGAMANNUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Aguas Santiago Norte":     { nombre: "Aguas Santiago Norte",     id: 137, idIdentificador: 170, idTipoMetaDato: 2, largo: 11, correlativo: "0", urlImg: "ASANTIIDSERV.jpg",  descIdentificador: "ID Servicio",       nombreIdentificador: "IDSERV" },
  "Aguas Santiago Poniente":  { nombre: "Aguas Santiago Poniente",  id: 181, idIdentificador: 263, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "ASANTPNUMSER.jpg",  descIdentificador: "Número de Servicio",nombreIdentificador: "NUMSER" },
  "Aguas del Valle":          { nombre: "Aguas del Valle",          id: 5,   idIdentificador: 5,   idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "PAGVALNUMSUM.jpg",  descIdentificador: "Número de Suministro", nombreIdentificador: "NUMSUM" },
  "Aguas Araucanía":          { nombre: "Aguas Araucanía",          id: 283, idIdentificador: 395, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "GRPAARIDCLIE.jpg",  descIdentificador: "ID Cliente",        nombreIdentificador: "IDCLIE" },
  "Aguas Magallanes":         { nombre: "Aguas Magallanes",         id: 284, idIdentificador: 396, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "GRPAMAIDCLIE.jpg",  descIdentificador: "ID Cliente",        nombreIdentificador: "IDCLIE" },
  "Aguas Antofagasta":        { nombre: "Aguas Antofagasta",        id: 200, idIdentificador: 285, idTipoMetaDato: 2, largo: 11, correlativo: "0", urlImg: "PAGANTNUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Aguas del Altiplano":      { nombre: "Aguas del Altiplano",      id: 282, idIdentificador: 394, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "GRPAAlIDCLIE.jpg",  descIdentificador: "ID Cliente",        nombreIdentificador: "IDCLIE" },
  "Aguas San Pedro":          { nombre: "Aguas San Pedro",          id: 285, idIdentificador: 397, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "GRPASPNUMCLT.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLT" },
  "Aguas Décima":             { nombre: "Aguas Décima",             id: 320, idIdentificador: 432, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "GRPADEIDCLIE.jpg",  descIdentificador: "ID Cliente",        nombreIdentificador: "IDCLIE" },
  "Aguas Sepra":              { nombre: "Aguas Sepra",              id: 232, idIdentificador: 339, idTipoMetaDato: 1, largo: 10, correlativo: "0", urlImg: "SEPRANUMSER.jpg",   descIdentificador: "Número de Servicio",nombreIdentificador: "NUMSER" },
  "Aguas Izarra":             { nombre: "Aguas Izarra",             id: 245, idIdentificador: 355, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "AGUIZAIDSERV.jpg",  descIdentificador: "ID Servicio",       nombreIdentificador: "IDSERV" },
  "Esval":                    { nombre: "Esval",                    id: 4,   idIdentificador: 4,   idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "PAGESVNUMSUM.jpg",  descIdentificador: "Número de Suministro", nombreIdentificador: "NUMSUM" },
  "Essbio":                   { nombre: "Essbio",                   id: 16,  idIdentificador: 16,  idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "ESSBIOIDSERV.jpg",  descIdentificador: "ID Servicio",       nombreIdentificador: "IDSERV" },
  "NuevoSur":                 { nombre: "NuevoSur",                 id: 17,  idIdentificador: 17,  idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "NUESURIDSERV.jpg",  descIdentificador: "ID Servicio",       nombreIdentificador: "IDSERV" },
  "SURALIS (ex Essal)":       { nombre: "SURALIS (ex Essal)",       id: 287, idIdentificador: 399, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "GRPESAIDSERV.jpg",  descIdentificador: "ID Servicio",       nombreIdentificador: "IDSERV" },
  "Nueva Atacama":            { nombre: "Nueva Atacama",            id: 286, idIdentificador: 398, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "GRPATAIDCLIE.jpg",  descIdentificador: "ID Cliente",        nombreIdentificador: "IDCLIE" },
  "Cossbo":                   { nombre: "Cossbo",                   id: 18,  idIdentificador: 18,  idTipoMetaDato: 1, largo: 10, correlativo: "0", urlImg: "COSSBONUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Coopagua Santo Domingo":   { nombre: "Coopagua Santo Domingo",   id: 65,  idIdentificador: 82,  idTipoMetaDato: 2, largo: 7,  correlativo: "0", urlImg: "COOPPCROL.jpg",     descIdentificador: "Rol",               nombreIdentificador: "ROL" },
  "Sacyr Agua Metropolitana": { nombre: "Sacyr Agua Metropolitana", id: 171, idIdentificador: 254, idTipoMetaDato: 2, largo: 11, correlativo: "0", urlImg: "AGUCHAIDSERV.jpg",  descIdentificador: "ID Servicio",       nombreIdentificador: "IDSERV" },
  "Sacyr Agua Lampa":         { nombre: "Sacyr Agua Lampa",         id: 172, idIdentificador: 255, idTipoMetaDato: 2, largo: 11, correlativo: "0", urlImg: "AGULAMIDSERV.jpg",  descIdentificador: "ID Servicio",       nombreIdentificador: "IDSERV" },
  "Sacyr Agua Utilities":     { nombre: "Sacyr Agua Utilities",     id: 174, idIdentificador: 257, idTipoMetaDato: 2, largo: 11, correlativo: "0", urlImg: "AGUUTIIDSERV.jpg",  descIdentificador: "ID Servicio",       nombreIdentificador: "IDSERV" },

  // ─── LUZ ────────────────────────────────────────────────────────────────────
  "Enel":                     { nombre: "Enel",                     id: 238, idIdentificador: 345, idTipoMetaDato: 3, largo: 10, correlativo: "0", urlImg: "PAENENNUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "CGE S.A.":                 { nombre: "CGE S.A.",                 id: 107, idIdentificador: 125, idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "CGECGENUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Chilquinta":               { nombre: "Chilquinta",               id: 49,  idIdentificador: 64,  idTipoMetaDato: 3, largo: 10, correlativo: "0", urlImg: "BOLCHINIS.jpg",     descIdentificador: "NIS",               nombreIdentificador: "NIS" },
  "Saesa":                    { nombre: "Saesa",                    id: 162, idIdentificador: 240, idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "SAESANUMSRV.jpg",   descIdentificador: "Número de Servicio",nombreIdentificador: "NUMSRV" },
  "Frontel":                  { nombre: "Frontel",                  id: 160, idIdentificador: 238, idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "SAEFRTNUMSRV.jpg",  descIdentificador: "Número de Servicio",nombreIdentificador: "NUMSRV" },
  "Edelmag":                  { nombre: "Edelmag",                  id: 164, idIdentificador: 242, idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "EDELM4NUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Edelaysen":                { nombre: "Edelaysen",                id: 159, idIdentificador: 237, idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "SAEEDENUMSRV.jpg",  descIdentificador: "Número de Servicio",nombreIdentificador: "NUMSRV" },
  "Luz Osorno":               { nombre: "Luz Osorno",               id: 161, idIdentificador: 239, idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "SAEOSONUMSRV.jpg",  descIdentificador: "Número de Servicio",nombreIdentificador: "NUMSRV" },
  "Luz Linares":              { nombre: "Luz Linares",              id: 50,  idIdentificador: 65,  idTipoMetaDato: 3, largo: 10, correlativo: "0", urlImg: "BOLLLINIS.jpg",     descIdentificador: "NIS",               nombreIdentificador: "NIS" },
  "Luz Parral":               { nombre: "Luz Parral",               id: 51,  idIdentificador: 66,  idTipoMetaDato: 3, largo: 10, correlativo: "0", urlImg: "BOLLPANIS.jpg",     descIdentificador: "NIS",               nombreIdentificador: "NIS" },
  "Litoral":                  { nombre: "Litoral",                  id: 52,  idIdentificador: 67,  idTipoMetaDato: 3, largo: 10, correlativo: "0", urlImg: "BOLLITNIS.jpg",     descIdentificador: "NIS",               nombreIdentificador: "NIS" },
  "Energía Casablanca":       { nombre: "Energía Casablanca",       id: 53,  idIdentificador: 68,  idTipoMetaDato: 3, largo: 10, correlativo: "0", urlImg: "BOLCBANIS.jpg",     descIdentificador: "NIS",               nombreIdentificador: "NIS" },
  "CEC Coop. Eléctrica Curicó": { nombre: "CEC Coop. Eléctrica Curicó", id: 169, idIdentificador: 249, idTipoMetaDato: 2, largo: 6, correlativo: "0", urlImg: "CECNUMCLI.jpg", descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "EEPA":                     { nombre: "EEPA",                     id: 209, idIdentificador: 294, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "EEPANUMCLI.jpg",   descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Emelca":                   { nombre: "Emelca",                   id: 325, idIdentificador: 437, idTipoMetaDato: 2, largo: 14, correlativo: "0", urlImg: "PAGEMENSERVI.jpg",  descIdentificador: "Número de Servicio",nombreIdentificador: "NSERVI" },

  // ─── GAS ────────────────────────────────────────────────────────────────────
  "Metrogas":                 { nombre: "Metrogas",                 id: 186, idIdentificador: 268, idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "PAGMTGNUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Gasco":                    { nombre: "Gasco",                    id: 204, idIdentificador: 289, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "GASMEDNUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Gasco Magallanes":         { nombre: "Gasco Magallanes",         id: 203, idIdentificador: 288, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "GASMAGNUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Gasvalpo":                 { nombre: "Gasvalpo",                 id: 251, idIdentificador: 363, idTipoMetaDato: 2, largo: 7,  correlativo: "0", urlImg: "GVALPONUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Lipigas Granel":           { nombre: "Lipigas Granel",           id: 139, idIdentificador: 173, idTipoMetaDato: 3, largo: 10, correlativo: "0", urlImg: "LPGGRARUT.jpg",     descIdentificador: "RUT",               nombreIdentificador: "RUT" },
  "Lipigas Medidor":          { nombre: "Lipigas Medidor",          id: 140, idIdentificador: 233, idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "LPGMEDCOD1.jpg",    descIdentificador: "Código",            nombreIdentificador: "COD1" },
  "Abastible Boleta":         { nombre: "Abastible Boleta",         id: 58,  idIdentificador: 73,  idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "GASPBONUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Abastible Factura":        { nombre: "Abastible Factura",        id: 59,  idIdentificador: 74,  idTipoMetaDato: 2, largo: 10, correlativo: "0", urlImg: "GASPAFNUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Gas Sur":                  { nombre: "Gas Sur",                  id: 193, idIdentificador: 275, idTipoMetaDato: 2, largo: 12, correlativo: "0", urlImg: "PAGGSUNUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
  "Energas":                  { nombre: "Energas",                  id: 324, idIdentificador: 436, idTipoMetaDato: 2, largo: 7,  correlativo: "0", urlImg: "ENERGANUMCLI.jpg",  descIdentificador: "Número de Cliente", nombreIdentificador: "NUMCLI" },
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
          NombreIdentificador: prov.nombreIdentificador,
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
