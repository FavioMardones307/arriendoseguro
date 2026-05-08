/**
 * Algoritmo ArriendoScore (0-1000 puntos)
 * 
 * Pesos según especificación del roadmap:
 * - Historial de pagos en plataforma: 30%
 * - Puntualidad (días de retraso promedio): 15%
 * - Verificación ingresos vía Floid: 20%
 * - Estado DICOM / deudas CMF: 10%
 * - Referencias verificadas: 10%
 * - Duración promedio de arriendos: 10%
 * - Pago de servicios básicos: 5%
 */

export type NivelScore = "excelente" | "bueno" | "regular" | "precaucion" | "sin_datos";

export interface BreakdownScore {
  historial_pagos: number;      // 0-300 pts (30%)
  puntualidad: number;          // 0-150 pts (15%)
  ingresos_verificados: number; // 0-200 pts (20%)
  dicom_cmf: number;            // 0-100 pts (10%)
  referencias: number;          // 0-100 pts (10%)
  duracion_arriendos: number;   // 0-100 pts (10%)
  servicios_basicos: number;    // 0-50 pts (5%)
}

export interface InputScore {
  // Historial de pagos
  total_pagos: number;
  pagos_puntuales: number;
  pagos_atrasados: number;
  // Puntualidad
  dias_atraso_promedio: number;
  // Ingresos Floid
  ingreso_mensual_verificado: number | null; // null = no verificado
  monto_arriendo_actual: number;
  // DICOM / CMF
  tiene_deudas_dicom: boolean;
  monto_deuda_cmf: number;
  // Referencias
  referencias_positivas: number;
  referencias_negativas: number;
  // Duración arriendos
  contratos_completados: number;
  duracion_promedio_meses: number;
  // Servicios básicos
  servicios_al_dia: number;
  servicios_totales: number;
}

/**
 * Calcula el nivel de score según el puntaje
 */
export function obtenerNivel(score: number): NivelScore {
  if (score >= 850) return "excelente";
  if (score >= 700) return "bueno";
  if (score >= 500) return "regular";
  if (score >= 300) return "precaucion";
  return "sin_datos";
}

/**
 * Calcula el color del score según el nivel
 */
export function colorPorNivel(nivel: NivelScore): string {
  switch (nivel) {
    case "excelente": return "#10B981"; // verde
    case "bueno":     return "#3B82F6"; // azul
    case "regular":   return "#F59E0B"; // amarillo
    case "precaucion":return "#EF4444"; // rojo
    default:          return "#94A3B8"; // gris
  }
}

/**
 * Etiqueta en español para el nivel
 */
export function etiquetaNivel(nivel: NivelScore): string {
  switch (nivel) {
    case "excelente": return "Excelente";
    case "bueno":     return "Bueno";
    case "regular":   return "Regular";
    case "precaucion":return "Precaución";
    default:          return "Sin datos";
  }
}

/**
 * Calcula el ArriendoScore completo con breakdown detallado
 * Puntaje base para nuevos usuarios: 350 puntos
 */
export function calcularScore(input: InputScore): {
  score: number;
  nivel: NivelScore;
  breakdown: BreakdownScore;
} {
  const breakdown: BreakdownScore = {
    historial_pagos: 0,
    puntualidad: 0,
    ingresos_verificados: 0,
    dicom_cmf: 0,
    referencias: 0,
    duracion_arriendos: 0,
    servicios_basicos: 0,
  };

  // ── 1. Historial de pagos (30% = máx 300 pts) ────────────────
  if (input.total_pagos > 0) {
    const tasaPuntualidad = input.pagos_puntuales / input.total_pagos;
    // Curva progresiva: más pagos = más confianza
    const factorVolumen = Math.min(1, input.total_pagos / 24); // máximo a 24 meses
    breakdown.historial_pagos = Math.round(
      tasaPuntualidad * 300 * (0.6 + 0.4 * factorVolumen)
    );
  } else {
    // Sin historial: puntaje base
    breakdown.historial_pagos = 100;
  }

  // ── 2. Puntualidad (15% = máx 150 pts) ──────────────────────
  const diasAtraso = input.dias_atraso_promedio;
  if (diasAtraso === 0) {
    breakdown.puntualidad = 150;
  } else if (diasAtraso <= 3) {
    breakdown.puntualidad = 120;
  } else if (diasAtraso <= 7) {
    breakdown.puntualidad = 80;
  } else if (diasAtraso <= 15) {
    breakdown.puntualidad = 40;
  } else if (diasAtraso <= 30) {
    breakdown.puntualidad = 10;
  } else {
    breakdown.puntualidad = 0;
  }

  // ── 3. Verificación de ingresos vía Floid (20% = máx 200 pts)
  if (input.ingreso_mensual_verificado !== null && input.monto_arriendo_actual > 0) {
    // Ratio recomendado: arriendo ≤ 30% del ingreso
    const ratio = input.monto_arriendo_actual / input.ingreso_mensual_verificado;
    if (ratio <= 0.25) {
      breakdown.ingresos_verificados = 200;
    } else if (ratio <= 0.30) {
      breakdown.ingresos_verificados = 170;
    } else if (ratio <= 0.35) {
      breakdown.ingresos_verificados = 130;
    } else if (ratio <= 0.40) {
      breakdown.ingresos_verificados = 80;
    } else if (ratio <= 0.50) {
      breakdown.ingresos_verificados = 40;
    } else {
      breakdown.ingresos_verificados = 10;
    }
  } else {
    // Sin verificación: puntaje neutral
    breakdown.ingresos_verificados = 60;
  }

  // ── 4. DICOM / CMF (10% = máx 100 pts) ──────────────────────
  if (!input.tiene_deudas_dicom) {
    if (input.monto_deuda_cmf === 0) {
      breakdown.dicom_cmf = 100;
    } else if (input.monto_deuda_cmf < 500000) {
      breakdown.dicom_cmf = 70;
    } else {
      breakdown.dicom_cmf = 40;
    }
  } else {
    breakdown.dicom_cmf = 0;
  }

  // ── 5. Referencias verificadas (10% = máx 100 pts) ───────────
  const totalRefs = input.referencias_positivas + input.referencias_negativas;
  if (totalRefs > 0) {
    const tasaRefs = input.referencias_positivas / totalRefs;
    breakdown.referencias = Math.round(tasaRefs * 100);
  } else {
    breakdown.referencias = 40; // sin referencias: neutral
  }

  // ── 6. Duración promedio arriendos (10% = máx 100 pts) ───────
  if (input.contratos_completados >= 2 && input.duracion_promedio_meses >= 12) {
    breakdown.duracion_arriendos = 100;
  } else if (input.contratos_completados >= 1 && input.duracion_promedio_meses >= 6) {
    breakdown.duracion_arriendos = 60;
  } else if (input.contratos_completados >= 1) {
    breakdown.duracion_arriendos = 30;
  } else {
    breakdown.duracion_arriendos = 0;
  }

  // ── 7. Servicios básicos (5% = máx 50 pts) ───────────────────
  if (input.servicios_totales > 0) {
    const tasaServicios = input.servicios_al_dia / input.servicios_totales;
    breakdown.servicios_basicos = Math.round(tasaServicios * 50);
  } else {
    breakdown.servicios_basicos = 25; // sin datos: neutral
  }

  // ── Score total ───────────────────────────────────────────────
  const scoreTotal = Math.min(
    1000,
    Math.max(
      0,
      breakdown.historial_pagos +
      breakdown.puntualidad +
      breakdown.ingresos_verificados +
      breakdown.dicom_cmf +
      breakdown.referencias +
      breakdown.duracion_arriendos +
      breakdown.servicios_basicos
    )
  );

  return {
    score: scoreTotal,
    nivel: obtenerNivel(scoreTotal),
    breakdown,
  };
}

/**
 * Perfiles de prueba para validación (requerido en criterios de éxito)
 */
export const PERFILES_PRUEBA = {
  excelente: {
    total_pagos: 36,
    pagos_puntuales: 36,
    pagos_atrasados: 0,
    dias_atraso_promedio: 0,
    ingreso_mensual_verificado: 2500000,
    monto_arriendo_actual: 600000,
    tiene_deudas_dicom: false,
    monto_deuda_cmf: 0,
    referencias_positivas: 3,
    referencias_negativas: 0,
    contratos_completados: 2,
    duracion_promedio_meses: 18,
    servicios_al_dia: 12,
    servicios_totales: 12,
  } satisfies InputScore,

  regular: {
    total_pagos: 12,
    pagos_puntuales: 9,
    pagos_atrasados: 3,
    dias_atraso_promedio: 8,
    ingreso_mensual_verificado: 900000,
    monto_arriendo_actual: 400000,
    tiene_deudas_dicom: false,
    monto_deuda_cmf: 200000,
    referencias_positivas: 1,
    referencias_negativas: 1,
    contratos_completados: 1,
    duracion_promedio_meses: 8,
    servicios_al_dia: 8,
    servicios_totales: 12,
  } satisfies InputScore,

  sin_datos: {
    total_pagos: 0,
    pagos_puntuales: 0,
    pagos_atrasados: 0,
    dias_atraso_promedio: 0,
    ingreso_mensual_verificado: null,
    monto_arriendo_actual: 0,
    tiene_deudas_dicom: false,
    monto_deuda_cmf: 0,
    referencias_positivas: 0,
    referencias_negativas: 0,
    contratos_completados: 0,
    duracion_promedio_meses: 0,
    servicios_al_dia: 0,
    servicios_totales: 0,
  } satisfies InputScore,
};
