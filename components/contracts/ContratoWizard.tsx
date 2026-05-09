"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { validarRut, formatearRutParcial } from "@/lib/chile/rut";
import { ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";

// ── Schema de validación por paso ──────────────────────────────────────
const schemaPartes = z.object({
  arrendador_nombre: z.string().min(2, "Ingresa el nombre del arrendador"),
  arrendador_rut: z.string().refine(validarRut, "RUT inválido"),
  arrendatario_nombre: z.string().min(2, "Ingresa el nombre del arrendatario"),
  arrendatario_rut: z.string().refine(validarRut, "RUT inválido"),
  arrendatario_email: z.string().email("Correo inválido"),
  arrendatario_telefono: z.string().min(9, "Teléfono inválido"),
});

const schemaInmueble = z.object({
  direccion: z.string().min(5, "Ingresa la dirección completa"),
  numero: z.string().optional(),
  depto: z.string().optional(),
  comuna: z.string().min(2, "Selecciona la comuna"),
  region: z.string().min(2, "Selecciona la región"),
  tipo: z.enum(["casa", "departamento", "pieza", "oficina", "local", "bodega", "estacionamiento"]),
});

const schemaRenta = z.object({
  moneda: z.enum(["CLP", "UF"]),
  monto: z.string().min(1, "Ingresa el monto"),
  dia_pago: z.number().min(1).max(28),
});

const schemaDuracion = z.object({
  tipo_duracion: z.enum(["plazo_fijo", "mes_a_mes", "indefinido"]),
  fecha_inicio: z.string().min(1, "Selecciona fecha de inicio"),
  fecha_fin: z.string().optional(),
  reajuste: z.enum(["ipc_semestral", "ipc_anual", "uf", "sin_reajuste"]),
});

const schemaGarantia = z.object({
  garantia_meses: z.number().min(0).max(2),
});

const schemaClausulas = z.object({
  permite_mascotas: z.boolean(),
  permite_subarriendo: z.boolean(),
  requiere_codeudor: z.boolean(),
  include_inventario: z.boolean(),
  clausulas_extra: z.string().optional(),
});

export type DatosContrato = z.infer<typeof schemaPartes>
  & z.infer<typeof schemaInmueble>
  & z.infer<typeof schemaRenta>
  & z.infer<typeof schemaDuracion>
  & z.infer<typeof schemaGarantia>
  & z.infer<typeof schemaClausulas>;

const PASOS = [
  "Partes",
  "Inmueble",
  "Renta",
  "Duración",
  "Garantía",
  "Cláusulas",
  "Revisar y firmar",
];

// ── Componente indicador de pasos ──────────────────────────────────────
function PasoIndicador({ actual, total }: { actual: number; total: number }) {
  return (
    <div className="flex items-center gap-1 mb-6" role="progressbar" aria-valuenow={actual + 1} aria-valuemax={total}>
      {PASOS.map((nombre, i) => (
        <div key={nombre} className="flex items-center gap-1 flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
            i < actual ? "bg-[#10B981] text-white" :
            i === actual ? "bg-[#1E40AF] text-white" :
            "bg-[#E2E8F0] text-[#94A3B8]"
          }`}>
            {i < actual ? <CheckCircle2 size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 flex-1 transition-all ${i < actual ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Paso 1: Partes ─────────────────────────────────────────────────────
function PasoPartes({ form }: { form: ReturnType<typeof useForm<DatosContrato>> }) {
  const { register, formState: { errors }, setValue, watch } = form;
  const rutArrValue = watch("arrendador_rut") ?? "";
  const rutAteValue = watch("arrendatario_rut") ?? "";

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-[#0F172A] text-lg">Datos de las partes</h2>

      <fieldset className="space-y-4 p-4 border border-[#E2E8F0] rounded-xl">
        <legend className="text-sm font-semibold text-[#1E40AF] px-1">Arrendador (propietario)</legend>
        <div>
          <label htmlFor="arr-nombre" className="label">Nombre completo</label>
          <input id="arr-nombre" className={`input-base ${errors.arrendador_nombre ? "input-error" : ""}`}
            placeholder="Juan Pérez Soto" {...register("arrendador_nombre")} />
          {errors.arrendador_nombre && <p className="helper-text helper-error">{errors.arrendador_nombre.message}</p>}
        </div>
        <div>
          <label htmlFor="arr-rut" className="label">RUT</label>
          <input id="arr-rut" className={`input-base ${errors.arrendador_rut ? "input-error" : ""}`}
            placeholder="12.345.678-9" value={rutArrValue}
            onChange={(e) => setValue("arrendador_rut", formatearRutParcial(e.target.value))} />
          {errors.arrendador_rut && <p className="helper-text helper-error">{errors.arrendador_rut.message}</p>}
        </div>
      </fieldset>

      <fieldset className="space-y-4 p-4 border border-[#E2E8F0] rounded-xl">
        <legend className="text-sm font-semibold text-[#10B981] px-1">Arrendatario</legend>
        <div>
          <label htmlFor="ate-nombre" className="label">Nombre completo</label>
          <input id="ate-nombre" className={`input-base ${errors.arrendatario_nombre ? "input-error" : ""}`}
            placeholder="María González López" {...register("arrendatario_nombre")} />
          {errors.arrendatario_nombre && <p className="helper-text helper-error">{errors.arrendatario_nombre.message}</p>}
        </div>
        <div>
          <label htmlFor="ate-rut" className="label">RUT</label>
          <input id="ate-rut" className={`input-base ${errors.arrendatario_rut ? "input-error" : ""}`}
            placeholder="9.876.543-2" value={rutAteValue}
            onChange={(e) => setValue("arrendatario_rut", formatearRutParcial(e.target.value))} />
          {errors.arrendatario_rut && <p className="helper-text helper-error">{errors.arrendatario_rut.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ate-email" className="label">Correo electrónico</label>
            <input id="ate-email" type="email" className={`input-base ${errors.arrendatario_email ? "input-error" : ""}`}
              placeholder="maria@email.cl" {...register("arrendatario_email")} />
            {errors.arrendatario_email && <p className="helper-text helper-error">{errors.arrendatario_email.message}</p>}
          </div>
          <div>
            <label htmlFor="ate-tel" className="label">Teléfono</label>
            <input id="ate-tel" type="tel" className={`input-base ${errors.arrendatario_telefono ? "input-error" : ""}`}
              placeholder="+56 9 1234 5678" {...register("arrendatario_telefono")} />
            {errors.arrendatario_telefono && <p className="helper-text helper-error">{errors.arrendatario_telefono.message}</p>}
          </div>
        </div>
      </fieldset>
    </div>
  );
}

// ── Paso 2: Inmueble ───────────────────────────────────────────────────
function PasoInmueble({ form }: { form: ReturnType<typeof useForm<DatosContrato>> }) {
  const { register, formState: { errors } } = form;
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-[#0F172A] text-lg">Datos del inmueble</h2>
      <div>
        <label htmlFor="inmueble-tipo" className="label">Tipo de inmueble</label>
        <select id="inmueble-tipo" className="input-base" {...register("tipo")}>
          <option value="departamento">Departamento</option>
          <option value="casa">Casa</option>
          <option value="pieza">Pieza</option>
          <option value="oficina">Oficina</option>
          <option value="local">Local comercial</option>
          <option value="bodega">Bodega</option>
          <option value="estacionamiento">Estacionamiento</option>
        </select>
      </div>
      <div>
        <label htmlFor="inmueble-dir" className="label">Dirección (calle y número)</label>
        <input id="inmueble-dir" className={`input-base ${errors.direccion ? "input-error" : ""}`}
          placeholder="Av. Providencia 1234" {...register("direccion")} />
        {errors.direccion && <p className="helper-text helper-error">{errors.direccion.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="inmueble-num" className="label">N° depto / casa (opcional)</label>
          <input id="inmueble-num" className="input-base" placeholder="Dpto 501" {...register("depto")} />
        </div>
        <div>
          <label htmlFor="inmueble-comuna" className="label">Comuna</label>
          <input id="inmueble-comuna" className={`input-base ${errors.comuna ? "input-error" : ""}`}
            placeholder="Providencia" {...register("comuna")} />
          {errors.comuna && <p className="helper-text helper-error">{errors.comuna.message}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="inmueble-region" className="label">Región</label>
        <select id="inmueble-region" className="input-base" {...register("region")}>
          <option value="RM">Región Metropolitana de Santiago</option>
          <option value="V">Valparaíso</option>
          <option value="VIII">Biobío</option>
          <option value="IX">La Araucanía</option>
          <option value="X">Los Lagos</option>
          <option value="II">Antofagasta</option>
          <option value="IV">Coquimbo</option>
          <option value="VII">Maule</option>
        </select>
      </div>
    </div>
  );
}

// ── Paso 3: Renta ──────────────────────────────────────────────────────
function PasoRenta({ form }: { form: ReturnType<typeof useForm<DatosContrato>> }) {
  const { register, formState: { errors }, watch, setValue } = form;
  const moneda = watch("moneda");

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-[#0F172A] text-lg">Renta y forma de pago</h2>
      <div>
        <label className="label">Moneda del contrato</label>
        <div className="flex gap-3">
          {(["CLP", "UF"] as const).map((m) => (
            <button key={m} type="button"
              onClick={() => setValue("moneda", m)}
              className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-all ${
                moneda === m ? "border-[#1E40AF] bg-[#DBEAFE] text-[#1E40AF]" : "border-[#E2E8F0] text-[#64748B]"
              }`}>
              {m === "CLP" ? "$ Pesos (CLP)" : "UF"}
            </button>
          ))}
        </div>
        <p className="helper-text mt-2">
          {moneda === "UF" ? "El monto se ajusta automáticamente al valor diario de la UF." : "Monto fijo en pesos chilenos."}
        </p>
      </div>
      <div>
        <label htmlFor="monto" className="label">
          Monto mensual {moneda === "CLP" ? "(CLP)" : "(UF)"}
        </label>
        <input id="monto" type="number" className={`input-base ${errors.monto ? "input-error" : ""}`}
          placeholder={moneda === "CLP" ? "650000" : "19.5"} step={moneda === "UF" ? "0.01" : "1"}
          {...register("monto")} />
        {errors.monto && <p className="helper-text helper-error">{errors.monto.message}</p>}
      </div>
      <div>
        <label htmlFor="dia-pago" className="label">Día de pago mensual</label>
        <select id="dia-pago" className="input-base" {...register("dia_pago", { valueAsNumber: true })}>
          {[1, 5, 10, 15, 20, 28].map((d) => (
            <option key={d} value={d}>Día {d} de cada mes</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Paso 4: Duración ───────────────────────────────────────────────────
function PasoDuracion({ form }: { form: ReturnType<typeof useForm<DatosContrato>> }) {
  const { register, watch } = form;
  const tipo_duracion = watch("tipo_duracion");
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-[#0F172A] text-lg">Duración del contrato</h2>
      <div>
        <label htmlFor="tipo-contrato" className="label">Tipo de contrato</label>
        <select id="tipo-contrato" className="input-base" {...register("tipo_duracion")}>
          <option value="plazo_fijo">Plazo fijo</option>
          <option value="mes_a_mes">Mes a mes</option>
          <option value="indefinido">Indefinido</option>
        </select>
      </div>
      <div>
        <label htmlFor="fecha-inicio" className="label">Fecha de inicio</label>
        <input id="fecha-inicio" type="date" className="input-base" {...register("fecha_inicio")} />
      </div>
      {tipo_duracion === "plazo_fijo" && (
        <div>
          <label htmlFor="fecha-fin" className="label">Fecha de término</label>
          <input id="fecha-fin" type="date" className="input-base" {...register("fecha_fin")} />
        </div>
      )}
      <div>
        <label htmlFor="reajuste" className="label">Reajuste de renta</label>
        <select id="reajuste" className="input-base" {...register("reajuste")}>
          <option value="sin_reajuste">Sin reajuste</option>
          <option value="ipc_semestral">IPC semestral</option>
          <option value="ipc_anual">IPC anual</option>
          <option value="uf">UF (valor diario)</option>
        </select>
      </div>
    </div>
  );
}

// ── Paso 5: Garantía ───────────────────────────────────────────────────
function PasoGarantia({ form }: { form: ReturnType<typeof useForm<DatosContrato>> }) {
  const { register, watch } = form;
  const meses = watch("garantia_meses");
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-[#0F172A] text-lg">Garantía</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Ley 21.461:</strong> La garantía no puede exceder 2 meses de arriendo.
      </div>
      <div>
        <label htmlFor="garantia" className="label">Meses de garantía</label>
        <select id="garantia" className="input-base" {...register("garantia_meses", { valueAsNumber: true })}>
          <option value={0}>Sin garantía</option>
          <option value={1}>1 mes</option>
          <option value={2}>2 meses (máximo legal)</option>
        </select>
        {meses > 0 && (
          <p className="helper-text mt-2">
            El arrendatario debe depositar la garantía antes de recibir las llaves.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Paso 6: Cláusulas opcionales ───────────────────────────────────────
function PasoClausulas({ form }: { form: ReturnType<typeof useForm<DatosContrato>> }) {
  const { register } = form;
  const opciones = [
    { name: "permite_mascotas" as const, label: "Permite mascotas" },
    { name: "permite_subarriendo" as const, label: "Permite subarriendo" },
    { name: "requiere_codeudor" as const, label: "Requiere codeudor solidario" },
    { name: "include_inventario" as const, label: "Adjuntar acta de inventario" },
  ];
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-[#0F172A] text-lg">Cláusulas opcionales</h2>
      <div className="space-y-3">
        {opciones.map(({ name, label }) => (
          <label key={name} className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl cursor-pointer hover:bg-[#F8FAFC]">
            <input type="checkbox" className="w-4 h-4 accent-[#1E40AF]" {...register(name)} />
            <span className="text-sm text-[#374151]">{label}</span>
          </label>
        ))}
      </div>
      <div>
        <label htmlFor="clausulas-extra" className="label">Cláusulas adicionales (opcional)</label>
        <textarea id="clausulas-extra" className="input-base min-h-[100px] resize-y"
          placeholder="Ej: El arrendatario se compromete a mantener el jardín..." {...register("clausulas_extra")} />
      </div>
    </div>
  );
}

// ── Paso 7: Revisión ───────────────────────────────────────────────────
function PasoRevision({ datos, generando }: { datos: Partial<DatosContrato>; generando: boolean }) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-[#0F172A] text-lg">Revisar y generar contrato</h2>
      <div className="space-y-3">
        {[
          { label: "Arrendador", valor: `${datos.arrendador_nombre ?? ""} · ${datos.arrendador_rut ?? ""}` },
          { label: "Arrendatario", valor: `${datos.arrendatario_nombre ?? ""} · ${datos.arrendatario_rut ?? ""}` },
          { label: "Propiedad", valor: `${datos.direccion ?? ""}, ${datos.comuna ?? ""}` },
          { label: "Renta", valor: `${datos.monto ?? ""} ${datos.moneda ?? ""} — día ${datos.dia_pago ?? ""}` },
          { label: "Tipo", valor: datos.tipo_duracion ?? "" },
          { label: "Inicio", valor: datos.fecha_inicio ?? "" },
          { label: "Garantía", valor: `${datos.garantia_meses ?? 0} mes(es)` },
        ].map(({ label, valor }) => (
          <div key={label} className="flex justify-between text-sm border-b border-[#F1F5F9] pb-2">
            <span className="text-[#64748B]">{label}</span>
            <span className="font-medium text-[#0F172A] text-right max-w-[60%]">{valor}</span>
          </div>
        ))}
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
        Al generar el contrato, se creará un PDF firmable bajo la <strong>Ley 19.799</strong> de firma electrónica.
      </div>
      {generando && (
        <div className="flex items-center gap-2 text-sm text-[#1E40AF]">
          <Loader2 size={16} className="animate-spin" />
          Generando contrato con IA…
        </div>
      )}
    </div>
  );
}

// ── Wizard principal ───────────────────────────────────────────────────
export function ContratoWizard() {
  const [paso, setPaso] = useState(0);
  const [generando, setGenerando] = useState(false);
  const [completado, setCompletado] = useState(false);

  const form = useForm<DatosContrato>({
    defaultValues: {
      moneda: "CLP",
      dia_pago: 5,
      tipo: "departamento",
      tipo_duracion: "plazo_fijo",
      reajuste: "sin_reajuste",
      garantia_meses: 1,
      permite_mascotas: false,
      permite_subarriendo: false,
      requiere_codeudor: false,
      include_inventario: true,
      region: "RM",
    },
  });

  const schemas = [schemaPartes, schemaInmueble, schemaRenta, schemaDuracion, schemaGarantia, schemaClausulas];

  async function avanzar() {
    const schema = schemas[paso];
    if (!schema) { setPaso(p => p + 1); return; }

    const datos = form.getValues();
    const result = schema.safeParse(datos);
    if (!result.success) {
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof DatosContrato;
        if (field) form.setError(field, { message: err.message });
      });
      return;
    }
    setPaso(p => p + 1);
  }

  async function generarContrato() {
    setGenerando(true);
    // TODO: llamar a /api/contratos/generar con los datos del form
    await new Promise(r => setTimeout(r, 2000)); // Simular llamada a Claude
    setGenerando(false);
    setCompletado(true);
  }

  if (completado) {
    return (
      <div className="card text-center py-12">
        <CheckCircle2 size={48} className="text-[#10B981] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#0F172A] mb-2">¡Contrato generado!</h2>
        <p className="text-[#64748B] text-sm mb-6">
          El PDF se envió al arrendatario para firma electrónica.
        </p>
        <div className="flex gap-3 justify-center">
          <a href="#" className="btn-primary text-sm">Descargar PDF</a>
          <a href="/propietario/contratos" className="btn-secondary text-sm">Ver contratos</a>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <PasoIndicador actual={paso} total={PASOS.length} />
      <p className="text-xs text-[#94A3B8] mb-4">Paso {paso + 1} de {PASOS.length}: <strong className="text-[#374151]">{PASOS[paso]}</strong></p>

      <form noValidate>
        {paso === 0 && <PasoPartes form={form} />}
        {paso === 1 && <PasoInmueble form={form} />}
        {paso === 2 && <PasoRenta form={form} />}
        {paso === 3 && <PasoDuracion form={form} />}
        {paso === 4 && <PasoGarantia form={form} />}
        {paso === 5 && <PasoClausulas form={form} />}
        {paso === 6 && <PasoRevision datos={form.getValues()} generando={generando} />}

        <div className="flex justify-between mt-8 pt-6 border-t border-[#E2E8F0]">
          <button type="button" onClick={() => setPaso(p => p - 1)} disabled={paso === 0}
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
            <ChevronLeft size={16} /> Anterior
          </button>
          {paso < PASOS.length - 1 ? (
            <button type="button" onClick={avanzar}
              className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={generarContrato} disabled={generando}
              className="btn-accent text-sm py-2 px-5 flex items-center gap-2 disabled:opacity-50">
              {generando ? <><Loader2 size={14} className="animate-spin" /> Generando…</> : "Generar contrato con IA ✨"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
