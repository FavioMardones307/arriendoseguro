/**
 * Utilidades para validación y formateo de RUT chileno
 * Formato válido: 12.345.678-9 o 12345678-9 o 123456789
 */

/**
 * Calcula el dígito verificador de un RUT
 * @param rutSinDV - RUT sin dígito verificador (solo dígitos)
 */
export function calcularDV(rutSinDV: string): string {
  const digits = rutSinDV.replace(/\D/g, "");
  // Secuencia oficial SII: [2,3,4,5,6,7] aplicada de derecha a izquierda, repitiendo
  const seq = [2, 3, 4, 5, 6, 7];
  let suma = 0;

  for (let i = digits.length - 1, j = 0; i >= 0; i--, j++) {
    suma += parseInt(digits[i] ?? "0", 10) * (seq[j % seq.length] ?? 2);
  }

  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "k";
  return String(resto);
}


/**
 * Valida si un RUT chileno es correcto (incluye dígito verificador)
 * @param rut - RUT en cualquier formato (con o sin puntos y guión)
 */
export function validarRut(rut: string): boolean {
  if (!rut || typeof rut !== "string") return false;

  // Limpiar: eliminar puntos, guiones Y espacios antes de procesar
  const limpio = rut.replace(/[\s.\-]/g, "").toUpperCase();

  if (limpio.length < 2) return false;

  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1).toLowerCase();

  // Validar que el cuerpo solo tenga dígitos
  if (!/^\d+$/.test(cuerpo)) return false;

  // Validar rango razonable (1.000.000 a 99.999.999)
  const numRut = parseInt(cuerpo, 10);
  if (numRut < 1000000 || numRut > 99999999) return false;

  const dvCalculado = calcularDV(cuerpo);

  return dvIngresado === dvCalculado;
}

/**
 * Formatea un RUT al formato estándar chileno: 12.345.678-9
 * @param rut - RUT en cualquier formato
 */
export function formatearRut(rut: string): string {
  // Limpiar input: eliminar puntos, espacios Y guiones para re-formatear desde cero
  const limpio = rut.replace(/[\s.\-]/g, "").toUpperCase();

  if (limpio.length < 2) return rut;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  // Formatear cuerpo con puntos
  const cuerpoFormateado = cuerpo
    .split("")
    .reverse()
    .join("")
    .replace(/(\d{3})(?=\d)/g, "$1.")
    .split("")
    .reverse()
    .join("");

  return `${cuerpoFormateado}-${dv}`;
}

/**
 * Limpia un RUT eliminando puntos y guiones
 * Útil antes de guardar en base de datos
 */
export function limpiarRut(rut: string): string {
  return rut.replace(/[\s.\-]/g, "").toUpperCase();
}

/**
 * Obtiene solo el número del RUT sin DV ni formato
 */
export function obtenerNumeroRut(rut: string): number {
  const limpio = limpiarRut(rut);
  return parseInt(limpio.slice(0, -1), 10);
}

/**
 * Formatea el input del usuario en tiempo real
 * Acepta caracteres parciales mientras el usuario escribe
 */
export function formatearRutParcial(input: string): string {
  // Eliminar todo excepto dígitos y K/k al final
  let limpio = input.replace(/[^0-9kK]/g, "");

  if (limpio.length === 0) return "";

  // Detectar si el último caracter es K
  const tieneK = limpio.toUpperCase().endsWith("K");
  const soloNumeros = tieneK ? limpio.slice(0, -1) : limpio;

  if (soloNumeros.length === 0) return tieneK ? "K" : "";

  // Formatear con puntos
  const conPuntos = soloNumeros
    .split("")
    .reverse()
    .join("")
    .replace(/(\d{3})(?=\d)/g, "$1.")
    .split("")
    .reverse()
    .join("");

  // Si tiene 7+ dígitos, agregar guión antes del último
  if (soloNumeros.length >= 7) {
    const partes = conPuntos.split(".");
    const ultimo = partes[partes.length - 1];
    if (ultimo && ultimo.length > 1) {
      const sinUltimo = partes.slice(0, -1).join(".");
      const ultimoSinDV = ultimo.slice(0, -1);
      const dv = tieneK ? "K" : ultimo.slice(-1);
      return `${sinUltimo}.${ultimoSinDV}-${dv}`;
    }
  }

  return tieneK ? `${conPuntos}-K` : conPuntos;
}
