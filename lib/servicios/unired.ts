/**
 * Servicio para interactuar con Unired.cl y obtener deudas de servicios básicos.
 */

import { tipoServicioEnum } from "@/db/schema";

export interface DatosDeuda {
  monto: number;
  vencimiento: string | null;
  pagado: boolean;
  saldo_anterior?: number;
  error?: string;
}

const UNIRED_AUTH = "Basic OSUyYIRGeWpHWzZFOMHFYcHVBCfg3JTJmdFZMOTFVa21KZHB2SkxQZHRmcjIYOVpqNjc3ZnR1NTDSWXNscWVDeFg=";

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
};

/**
 * Mapeo de proveedores a sus IDs internos en Unired
 * TODO: Ampliar esta lista o hacerla dinámica
 */
const PROVEEDORES_IDS: Record<string, { id: number; nombre: string; rubro: number }> = {
  // AGUA
  "Aguas Andinas": { id: 75, nombre: "Aguas Andinas", rubro: 75 },
  "Aguas Cordillera": { id: 60, nombre: "Aguas Cordillera", rubro: 60 },
  "Aguas Manquehue": { id: 60, nombre: "Aguas Manquehue", rubro: 60 },
  "Essbio": { id: 70, nombre: "Essbio", rubro: 70 },
  "Esval": { id: 80, nombre: "Esval", rubro: 80 },
  "Aguas del Valle": { id: 90, nombre: "Aguas del Valle", rubro: 90 },
  "Aguas Antofagasta": { id: 100, nombre: "Aguas Antofagasta", rubro: 100 },
  "Aguas Araucanía": { id: 110, nombre: "Aguas Araucanía", rubro: 110 },
  "Aguas Magallanes": { id: 120, nombre: "Aguas Magallanes", rubro: 120 },
  "Nuevo Sur": { id: 130, nombre: "Nuevo Sur", rubro: 130 },

  // ELECTRICIDAD
  "Enel": { id: 25, nombre: "Enel", rubro: 25 },
  "CGE S.A.": { id: 15, nombre: "CGE S.A.", rubro: 15 },
  "Chilquinta": { id: 35, nombre: "Chilquinta", rubro: 35 },
  "Saesa": { id: 45, nombre: "Saesa", rubro: 45 },
  "Frontel": { id: 55, nombre: "Frontel", rubro: 55 },
  "Luz del Sur": { id: 65, nombre: "Luz del Sur", rubro: 65 },
  "Edelmag": { id: 170, nombre: "Edelmag", rubro: 170 },

  // GAS
  "Metrogas": { id: 50, nombre: "Metrogas", rubro: 50 },
  "Lipigas": { id: 140, nombre: "Lipigas", rubro: 140 },
  "Abastible": { id: 150, nombre: "Abastible", rubro: 150 },
  "Gasco": { id: 160, nombre: "Gasco", rubro: 160 },
  "GasSur": { id: 180, nombre: "GasSur", rubro: 180 },
};

/**
 * Consulta la deuda de un servicio en Unired.cl
 */
export async function consultarDeudaUnired(
  tipo: string,
  proveedor: string,
  numeroCliente: string
): Promise<DatosDeuda> {
  console.log(`[Unired] Consultando ${tipo} (${proveedor}) para cliente ${numeroCliente}...`);

  const prov = PROVEEDORES_IDS[proveedor];
  if (!prov) {
    return {
      monto: 0,
      vencimiento: null,
      pagado: false,
      error: `Proveedor '${proveedor}' no configurado para Unired.`
    };
  }

  try {
    // PASO 1: Generar consulta para obtener IdCuenta
    const resp1 = await fetch("https://apiportal.unired.cl/api/Consulta/GeneraConsultaPagoCuentasExpressHome", {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Authorization": UNIRED_AUTH,
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://www.unired.cl",
        "Referer": "https://www.unired.cl/",
      },
      body: JSON.stringify([{
        NombreServicio: prov.nombre,
        IdEmpresaRubro: prov.id,
        IdEmpresaRubroPadre: -10,
        IdConsultaBoleta: -1,
        DetalleIdentificadores: [{
          ValorIdentificador: numeroCliente,
          DescIdentificador: "Número de Cuenta",
          NombreIdentificador: "NUMCLI",
        }]
      }])
    });

    const data1 = await resp1.json();
    const idCuenta = data1.body?.[0]?.IdCuenta;
    const claveConsulta = data1.body?.[0]?.ClaveConsultaBoleta;
    const claveCuentaToken = data1.body?.[0]?.ClaveCuenta;

    if (!idCuenta) throw new Error("No se pudo obtener el IdCuenta de Unired.");

    // PASO 2: Validar boleta (Necesario para que Unired "active" la consulta)
    await fetch("https://apiportal.unired.cl/api/Consulta/ConsultaBoletaHome", {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Authorization": UNIRED_AUTH,
        "Content-Type": "application/json",
        "Origin": "https://www.unired.cl",
        "Referer": "https://www.unired.cl/",
      },
      body: JSON.stringify({
        idConsulta: claveConsulta,
        idCuenta: claveCuentaToken,
        isMobile: false
      })
    });

    // PASO 3: Obtener deuda real (Xcash)
    const resp3 = await fetch("https://apiportal.unired.cl/api/ObtieneConsultaXcash", {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Authorization": UNIRED_AUTH,
        "Content-Type": "application/json",
        "Origin": "https://www.unired.cl",
        "Referer": "https://www.unired.cl/",
      },
      body: JSON.stringify({
        idCanal: 1,
        idCuenta: idCuenta
      })
    });

    const data3 = await resp3.json();
    const gruposCuotas = data3.body?.cuenta?.gruposCuotas || [];
    const cuota = gruposCuotas[0]?.cuotas?.[0];

    if (!cuota) {
      return {
        monto: 0,
        vencimiento: null,
        pagado: true,
        saldo_anterior: 0,
        error: "No se encontraron deudas pendientes en Unired."
      };
    }

    // Formatear fecha: Unired devuelve DD-MM-YYYY, necesitamos YYYY-MM-DD
    let vencimiento = null;
    if (cuota.fechaVencimiento) {
      const parts = cuota.fechaVencimiento.split("-");
      if (parts.length === 3) {
        vencimiento = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Saldo anterior: puede venir como campo en la cuota o como segunda cuota del grupo
    const saldoAnterior =
      cuota.saldoAnterior ||
      cuota.montoSaldoAnterior ||
      gruposCuotas[0]?.cuotas?.[1]?.monto ||
      0;

    return {
      monto: cuota.monto || 0,
      vencimiento: vencimiento,
      pagado: (cuota.monto || 0) === 0,
      saldo_anterior: saldoAnterior
    };

  } catch (error: any) {
    console.error("[Unired] Error al consultar deuda:", error);
    return {
      monto: 0,
      vencimiento: null,
      pagado: false,
      error: `Falla de conexión con Unired: ${error.message}`
    };
  }
}
