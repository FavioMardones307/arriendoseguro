import { describe, it, expect } from "vitest";
import { calcularScore, obtenerNivel, PERFILES_PRUEBA } from "@/lib/score/calculate";

describe("calcularScore — perfil excelente", () => {
  const { score, nivel } = calcularScore(PERFILES_PRUEBA.excelente);

  it("score debe ser >= 850", () => {
    expect(score).toBeGreaterThanOrEqual(850);
  });

  it("nivel debe ser 'excelente'", () => {
    expect(nivel).toBe("excelente");
  });

  it("score no debe exceder 1000", () => {
    expect(score).toBeLessThanOrEqual(1000);
  });
});

describe("calcularScore — perfil regular", () => {
  const { score, nivel } = calcularScore(PERFILES_PRUEBA.regular);

  it("score debe estar entre 400 y 700", () => {
    expect(score).toBeGreaterThan(400);
    expect(score).toBeLessThan(700);
  });

  it("nivel debe ser 'regular', 'bueno' o 'precaucion'", () => {
    expect(["regular", "bueno", "precaucion"]).toContain(nivel);
  });
});

describe("calcularScore — sin datos", () => {
  const { score, nivel } = calcularScore(PERFILES_PRUEBA.sin_datos);

  it("score debe ser > 0 (hay puntaje base)", () => {
    expect(score).toBeGreaterThan(0);
  });

  it("score debe ser < 500", () => {
    expect(score).toBeLessThan(500);
  });

  it("nivel debe ser 'precaucion' o 'sin_datos'", () => {
    expect(["precaucion", "sin_datos"]).toContain(nivel);
  });
});

describe("obtenerNivel", () => {
  it("900 → excelente", () => expect(obtenerNivel(900)).toBe("excelente"));
  it("750 → bueno", () => expect(obtenerNivel(750)).toBe("bueno"));
  it("600 → regular", () => expect(obtenerNivel(600)).toBe("regular"));
  it("400 → precaucion", () => expect(obtenerNivel(400)).toBe("precaucion"));
  it("200 → sin_datos", () => expect(obtenerNivel(200)).toBe("sin_datos"));
});
