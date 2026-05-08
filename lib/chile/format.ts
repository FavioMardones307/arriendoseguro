/**
 * Utilidades de formateo monetario y UF para Chile
 * Precios de propiedades en UF, suscripciones en CLP
 */

/**
 * Formatea un monto en CLP (pesos chilenos)
 * Ejemplo: 450000 → "$450.000"
 */
export function formatearCLP(monto: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
}

/**
 * Formatea un monto en UF
 * Ejemplo: 12.5 → "12,50 UF"
 */
export function formatearUF(monto: number): string {
  return `${new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto)} UF`;
}

/**
 * Convierte UF a CLP dado el valor actual de la UF
 */
export function ufACLP(montoUF: number, valorUF: number): number {
  return Math.round(montoUF * valorUF);
}

/**
 * Convierte CLP a UF dado el valor actual de la UF
 */
export function clpAUF(montoCLP: number, valorUF: number): number {
  return montoCLP / valorUF;
}

/**
 * Parsea un string de monto (con o sin puntos/comas) a número
 * Soporta formatos chilenos: "1.234.567" o "1.234,56"
 */
export function parsearMonto(str: string): number {
  const limpio = str.replace(/\./g, "").replace(",", ".");
  return parseFloat(limpio) || 0;
}

/**
 * Formatea un número como monto legible (sin símbolo de moneda)
 * Ejemplo: 450000 → "450.000"
 */
export function formatearNumero(num: number, decimales = 0): string {
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(num);
}

/**
 * Lista de regiones de Chile
 */
export const REGIONES = [
  { codigo: "XV", nombre: "Arica y Parinacota" },
  { codigo: "I", nombre: "Tarapacá" },
  { codigo: "II", nombre: "Antofagasta" },
  { codigo: "III", nombre: "Atacama" },
  { codigo: "IV", nombre: "Coquimbo" },
  { codigo: "V", nombre: "Valparaíso" },
  { codigo: "RM", nombre: "Región Metropolitana de Santiago" },
  { codigo: "VI", nombre: "O'Higgins" },
  { codigo: "VII", nombre: "Maule" },
  { codigo: "XVI", nombre: "Ñuble" },
  { codigo: "VIII", nombre: "Biobío" },
  { codigo: "IX", nombre: "La Araucanía" },
  { codigo: "XIV", nombre: "Los Ríos" },
  { codigo: "X", nombre: "Los Lagos" },
  { codigo: "XI", nombre: "Aysén" },
  { codigo: "XII", nombre: "Magallanes y Antártica Chilena" },
] as const;

/**
 * Comunas de la Región Metropolitana (lista parcial de las principales)
 */
export const COMUNAS_RM = [
  "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central",
  "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja",
  "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo",
  "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda",
  "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal",
  "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón",
  "Santiago", "Vitacura", "Puente Alto", "San Bernardo", "Colina",
  "Lampa", "Tiltil", "Pirque", "San José de Maipo",
  "Buin", "Calera de Tango", "Paine", "El Monte", "Isla de Maipo",
  "Melipilla", "Padre Hurtado", "Peñaflor", "Talagante"
] as const;

export type Region = typeof REGIONES[number];
export type ComunaRM = typeof COMUNAS_RM[number];

/**
 * Formatea una fecha en el formato chileno dd-mm-aaaa
 */
export function formatearFechaChile(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = d.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

/**
 * Meses en español de Chile
 */
export const MESES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;

/**
 * Formatea fecha en texto largo: "7 de mayo de 2026"
 */
export function formatearFechaLarga(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const mes = MESES_ES[d.getMonth()];
  return `${d.getDate()} de ${mes ?? ""} de ${d.getFullYear()}`;
}
