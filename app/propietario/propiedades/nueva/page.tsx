"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Landmark } from "lucide-react";
import { savePropertyAction } from "@/lib/actions/properties";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const REGIONES_CHILE = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama",
  "Coquimbo", "Valparaíso", "Metropolitana de Santiago",
  "O'Higgins", "Maule", "Ñuble", "Biobío", "La Araucanía",
  "Los Ríos", "Los Lagos", "Aysén", "Magallanes",
];

export default function NuevaPropiedadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [moneda, setMoneda] = useState<"UF" | "CLP">("UF");
  const [valorRaw, setValorRaw] = useState("");

  // Formatear el valor mientras el usuario escribe
  const valorFormateado = useMemo(() => {
    if (!valorRaw) return "";
    
    // Separamos la parte entera de la decimal si existe
    const [entera, decimal] = valorRaw.split(/[.,]/);
    
    // Formatear la parte entera con separador de miles
    const enteraFormateada = entera ? new Intl.NumberFormat("es-CL").format(parseInt(entera)) : "";
    
    if (moneda === "CLP") {
      return enteraFormateada;
    } else {
      // Para UF, si hay una coma/punto, lo mostramos
      const tieneSeparador = valorRaw.includes(".") || valorRaw.includes(",");
      return tieneSeparador ? `${enteraFormateada},${decimal || ""}` : enteraFormateada;
    }
  }, [valorRaw, moneda]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (moneda === "CLP") {
      // CLP: Solo números
      setValorRaw(val.replace(/\D/g, ""));
    } else {
      // UF: Números y un solo separador decimal
      const sanitized = val.replace(/[^0-9.,]/g, "");
      const parts = sanitized.split(/[.,]/);
      if (parts.length > 2) {
        setValorRaw(parts[0] + "," + parts[1]); // Solo permitimos un separador
      } else {
        setValorRaw(sanitized);
      }
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      formData.append("moneda_seleccionada", moneda);
      // Limpiamos el valor para el servidor (cambiamos coma por punto para que sea un número válido)
      const numericString = valorRaw.replace(",", ".");
      const numericValue = parseFloat(numericString);
      
      if (isNaN(numericValue)) throw new Error("Valor de arriendo no es válido");
      
      formData.append("valor_arriendo_numeric", numericValue.toString());
      
      const result = await savePropertyAction(formData);
      
      if (result.success) {
        toast.success("Propiedad registrada correctamente");
        router.push("/propietario/propiedades");
      } else {
        toast.error("Error: " + result.error);
      }
    } catch (error: any) {
      toast.error("Error inesperado: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/propietario/propiedades"
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E40AF] transition-colors"
        >
          <ArrowLeft size={16} />
          Mis propiedades
        </Link>
        <span className="text-[#CBD5E1]">/</span>
        <span className="text-sm font-medium text-[#0F172A]">Nueva propiedad</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#DBEAFE] rounded-xl flex items-center justify-center">
          <Building2 size={20} className="text-[#1E40AF]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Agregar propiedad</h1>
          <p className="text-sm text-[#64748B]">Completa los datos de tu inmueble</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Tipo de propiedad */}
        <div>
          <label htmlFor="tipo" className="label">Tipo de propiedad *</label>
          <select id="tipo" name="tipo" className="input-base" required>
            <option value="">Selecciona un tipo…</option>
            <option value="casa">Casa</option>
            <option value="departamento">Departamento</option>
            <option value="pieza">Pieza</option>
            <option value="oficina">Oficina</option>
            <option value="local">Local comercial</option>
            <option value="bodega">Bodega</option>
            <option value="estacionamiento">Estacionamiento</option>
          </select>
        </div>

        {/* Dirección */}
        <div>
          <label className="label">Dirección *</label>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <input
                id="prop-direccion"
                name="direccion"
                className="input-base"
                placeholder="Av. Providencia 1234"
                required
              />
              <p className="text-xs text-[#94A3B8] mt-1 text-[10px] font-bold uppercase">Calle y número</p>
            </div>
            <div>
              <input
                id="prop-numero"
                name="numero"
                className="input-base"
                placeholder="Nº"
              />
              <p className="text-xs text-[#94A3B8] mt-1 text-[10px] font-bold uppercase">Número (opc.)</p>
            </div>
          </div>
          <div className="mt-3">
            <input
              id="prop-depto"
              name="depto"
              className="input-base"
              placeholder="Dpto / Casa / Oficina (opcional)"
            />
          </div>
        </div>

        {/* Comuna y Región */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prop-comuna" className="label">Comuna *</label>
            <input
              id="prop-comuna"
              name="comuna"
              className="input-base"
              placeholder="Providencia"
              required
            />
          </div>
          <div>
            <label htmlFor="prop-region" className="label">Región *</label>
            <select id="prop-region" name="region" className="input-base" required>
              <option value="">Selecciona…</option>
              {REGIONES_CHILE.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Características */}
        <div>
          <p className="label mb-3">
            Características <span className="text-xs font-normal text-[#94A3B8] ml-1">(opcional)</span>
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="prop-metros" className="text-[10px] font-bold text-[#64748B] uppercase mb-1 block">m² útiles</label>
              <input
                id="prop-metros"
                name="metros"
                type="number"
                min="1"
                className="input-base"
                placeholder="60"
              />
            </div>
            <div>
              <label htmlFor="prop-dormitorios" className="text-[10px] font-bold text-[#64748B] uppercase mb-1 block">Dormitorios</label>
              <select id="prop-dormitorios" name="dormitorios" className="input-base">
                <option value="">—</option>
                {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="prop-banos" className="text-[10px] font-bold text-[#64748B] uppercase mb-1 block">Baños</label>
              <select id="prop-banos" name="banos" className="input-base">
                <option value="">—</option>
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="prop-amoblada"
              name="amoblada"
              className="w-4 h-4 accent-[#1E40AF] cursor-pointer"
            />
            <label htmlFor="prop-amoblada" className="text-sm text-[#374151] cursor-pointer font-medium">
              Propiedad amoblada
            </label>
          </div>
        </div>

        {/* Valor de Arriendo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="label mb-0">Valor de arriendo *</label>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button 
                type="button"
                onClick={() => { setMoneda("UF"); setValorRaw(""); }}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${moneda === "UF" ? "bg-white text-[#1E40AF] shadow-sm" : "text-[#64748B] hover:text-[#1E40AF]"}`}
              >
                UF
              </button>
              <button 
                type="button"
                onClick={() => { setMoneda("CLP"); setValorRaw(""); }}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${moneda === "CLP" ? "bg-white text-[#1E40AF] shadow-sm" : "text-[#64748B] hover:text-[#1E40AF]"}`}
              >
                PESOS ($)
              </button>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none border-r pr-2 border-slate-200 w-[75px]">
                {moneda === "UF" ? (
                  <Landmark size={14} className="text-[#1E40AF]" />
                ) : (
                  <span className="text-sm font-bold text-[#1E40AF]">$</span>
                )}
                <span className="text-[10px] font-bold text-[#64748B]">{moneda}</span>
              </div>
              <input
                id="prop-valor-visual"
                type="text"
                value={valorFormateado}
                onChange={handleInputChange}
                className="input-base font-bold text-[#0F172A]"
                style={{ paddingLeft: "115px" }}
                placeholder={moneda === "UF" ? "14,20" : "650.000"}
                required
              />
              <input type="hidden" name="valor_arriendo" value={valorRaw} />
            </div>
            <div>
              <input
                id="prop-avaluo"
                name="rol_avaluo"
                className="input-base"
                placeholder="Rol de avalúo SII (opcional)"
              />
            </div>
          </div>
          <p className="text-[10px] text-[#64748B] italic">
            * {moneda === "UF" ? "Ingresa el valor (ej: 14,2). Se ajustará mensualmente según el valor oficial de la UF." : "El valor quedará fijado en pesos chilenos sin decimales."}
          </p>
        </div>

        {/* Servicios Básicos */}
        <div className="space-y-4">
          <p className="label">Servicios básicos aplicables</p>
          <div className="space-y-3 p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            {/* Agua Potable */}
            <div className="space-y-3 pb-3 border-b border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="tiene_agua" defaultChecked className="w-4 h-4 accent-[#1E40AF]" />
                <span className="text-sm font-medium text-[#334155] group-hover:text-[#1E40AF]">Agua potable</span>
              </label>
              <div className="grid grid-cols-2 gap-3 pl-6">
                <input 
                  name="n_cliente_agua" 
                  className="input-base text-xs py-1.5" 
                  placeholder="Nº Cliente (opcional)" 
                />
                <select name="proveedor_agua" className="input-base text-xs py-1.5">
                  <option value="">Proveedor...</option>
                  <option value="Aguas Andinas">Aguas Andinas</option>
                  <option value="Aguas Cordillera">Aguas Cordillera</option>
                  <option value="Aguas Manquehue">Aguas Manquehue</option>
                  <option value="Aguas Santiago Norte">Aguas Santiago Norte</option>
                  <option value="Aguas Santiago Poniente">Aguas Santiago Poniente</option>
                  <option value="Aguas del Valle">Aguas del Valle</option>
                  <option value="Aguas Araucanía">Aguas Araucanía</option>
                  <option value="Aguas Magallanes">Aguas Magallanes</option>
                  <option value="Aguas Antofagasta">Aguas Antofagasta</option>
                  <option value="Aguas del Altiplano">Aguas del Altiplano</option>
                  <option value="Aguas San Pedro">Aguas San Pedro</option>
                  <option value="Aguas Décima">Aguas Décima</option>
                  <option value="Aguas Sepra">Aguas Sepra</option>
                  <option value="Aguas Izarra">Aguas Izarra</option>
                  <option value="Esval">Esval</option>
                  <option value="Essbio">Essbio</option>
                  <option value="NuevoSur">NuevoSur</option>
                  <option value="SURALIS (ex Essal)">SURALIS (ex Essal)</option>
                  <option value="Nueva Atacama">Nueva Atacama</option>
                  <option value="Cossbo">Cossbo</option>
                  <option value="Coopagua Santo Domingo">Coopagua Santo Domingo</option>
                  <option value="Sacyr Agua Metropolitana">Sacyr Agua Metropolitana</option>
                  <option value="Sacyr Agua Lampa">Sacyr Agua Lampa</option>
                  <option value="Sacyr Agua Utilities">Sacyr Agua Utilities</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Luz */}
            <div className="space-y-3 pb-3 border-b border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="tiene_luz" defaultChecked className="w-4 h-4 accent-[#1E40AF]" />
                <span className="text-sm font-medium text-[#334155] group-hover:text-[#1E40AF]">Energía eléctrica</span>
              </label>
              <div className="grid grid-cols-2 gap-3 pl-6">
                <input 
                  name="n_cliente_luz" 
                  className="input-base text-xs py-1.5" 
                  placeholder="Nº Cliente (opcional)" 
                />
                <select name="proveedor_luz" className="input-base text-xs py-1.5">
                  <option value="">Proveedor...</option>
                  <option value="Enel">Enel</option>
                  <option value="CGE S.A.">CGE S.A.</option>
                  <option value="Chilquinta">Chilquinta</option>
                  <option value="Saesa">Saesa</option>
                  <option value="Frontel">Frontel</option>
                  <option value="Edelmag">Edelmag</option>
                  <option value="Edelaysen">Edelaysen</option>
                  <option value="Luz Osorno">Luz Osorno</option>
                  <option value="Luz Linares">Luz Linares</option>
                  <option value="Luz Parral">Luz Parral</option>
                  <option value="Litoral">Litoral</option>
                  <option value="Energía Casablanca">Energía Casablanca</option>
                  <option value="Emelca">Emelca</option>
                  <option value="CEC Coop. Eléctrica Curicó">CEC Coop. Eléctrica Curicó</option>
                  <option value="EEPA">EEPA</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Gas */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="tiene_gas" className="w-4 h-4 accent-[#1E40AF]" />
                <span className="text-sm font-medium text-[#334155] group-hover:text-[#1E40AF]">Gas (por cañería o Red)</span>
              </label>
              <div className="grid grid-cols-2 gap-3 pl-6">
                <input 
                  name="n_cliente_gas" 
                  className="input-base text-xs py-1.5" 
                  placeholder="Nº Cliente (opcional)" 
                />
                <select name="proveedor_gas" className="input-base text-xs py-1.5">
                  <option value="">Proveedor...</option>
                  <option value="Metrogas">Metrogas</option>
                  <option value="Gasco">Gasco</option>
                  <option value="Gasco Magallanes">Gasco Magallanes</option>
                  <option value="Gasvalpo">Gasvalpo</option>
                  <option value="Lipigas Granel">Lipigas Granel</option>
                  <option value="Lipigas Medidor">Lipigas Medidor</option>
                  <option value="Abastible Boleta">Abastible Boleta</option>
                  <option value="Abastible Factura">Abastible Factura</option>
                  <option value="Gas Sur">Gas Sur</option>
                  <option value="Energas">Energas</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[#64748B]">
            * Los números de cliente son necesarios para automatizar el seguimiento con Unired. Puedes ingresarlos después si no los tienes a mano.
          </p>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="prop-descripcion" className="label">Descripción adicional (opcional)</label>
          <textarea
            id="prop-descripcion"
            name="descripcion"
            rows={3}
            className="input-base resize-none"
            placeholder="Detalles sobre la propiedad, reglas de convivencia, estacionamiento, etc."
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <Link
            href="/propietario/propiedades"
            className="btn-secondary flex-1 justify-center py-3"
          >
            Cancelar
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary flex-1 justify-center py-3"
          >
            {loading ? "Registrando..." : "Guardar propiedad"}
          </button>
        </div>
      </form>
    </div>
  );
}
