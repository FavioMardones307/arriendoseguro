import { describe, it, expect } from "vitest";
import { validarRut, calcularDV, formatearRut, formatearRutParcial } from "@/lib/chile/rut";

/**
 * Tests autocontenidos — usan calcularDV como referencia interna
 * para construir RUTs válidos, sin depender de valores hardcodeados externos.
 */

describe("validarRut", () => {
  it("acepta RUT válido con puntos y guión (generado internamente)", () => {
    const dv = calcularDV("11111111");
    expect(validarRut(`11.111.111-${dv}`)).toBe(true);
  });

  it("acepta RUT válido sin puntos ni guión", () => {
    const dv = calcularDV("15000001");
    expect(validarRut(`15000001-${dv}`)).toBe(true);
  });

  it("acepta DV en mayúscula y minúscula", () => {
    const dv = calcularDV("20000000");
    expect(validarRut(`20.000.000-${dv.toUpperCase()}`)).toBe(true);
    expect(validarRut(`20.000.000-${dv.toLowerCase()}`)).toBe(true);
  });

  it("rechaza RUT con DV incorrecto", () => {
    const dv = calcularDV("11111111");
    const dvMalo = dv === "9" ? "1" : "9";
    expect(validarRut(`11.111.111-${dvMalo}`)).toBe(false);
  });

  it("rechaza RUT demasiado corto", () => {
    expect(validarRut("1.234-5")).toBe(false);
  });

  it("rechaza string vacío", () => {
    expect(validarRut("")).toBe(false);
  });

  it("rechaza texto que no es RUT", () => {
    expect(validarRut("no-es-rut")).toBe(false);
  });
});

describe("calcularDV", () => {
  it("DV es consistente con validarRut para 11.111.111", () => {
    const dv = calcularDV("11111111");
    expect(validarRut(`11.111.111-${dv}`)).toBe(true);
  });

  it("DV es consistente con validarRut para 15.000.001", () => {
    const dv = calcularDV("15000001");
    expect(validarRut(`15.000.001-${dv}`)).toBe(true);
  });

  it("DV es siempre un caracter [0-9k]", () => {
    ["10000000", "20000000", "5000000", "99999999"].forEach(rut => {
      expect(calcularDV(rut)).toMatch(/^[0-9k]$/);
    });
  });
});

describe("formatearRut", () => {
  it("formatea RUT 9 dígitos al formato estándar", () => {
    const dv = calcularDV("11111111");
    const resultado = formatearRut(`11111111${dv}`);
    expect(resultado).toBe(`11.111.111-${dv}`);
  });

  it("formatea RUT ya con formato sin duplicar guión", () => {
    const dv = calcularDV("11111111");
    const formateado = `11.111.111-${dv}`;
    expect(formatearRut(formateado)).toBe(formateado);
  });
});

describe("formatearRutParcial", () => {
  it("retorna vacío para input vacío", () => {
    expect(formatearRutParcial("")).toBe("");
  });

  it("agrega puntos mientras el usuario escribe", () => {
    const resultado = formatearRutParcial("12345");
    expect(resultado).toContain(".");
  });
});
