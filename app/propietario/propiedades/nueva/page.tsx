import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nueva Propiedad | ArriendoSeguro" };

async function crearPropiedad(formData: FormData) {
  "use server";
  const supabase = await createAdminClient();

  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const body = {
    owner_id: user.id,
    tipo: formData.get("tipo") as string,
    direccion: formData.get("direccion") as string,
    numero: formData.get("numero") as string || null,
    depto: formData.get("depto") as string || null,
    comuna: formData.get("comuna") as string,
    region: formData.get("region") as string,
    metros_cuadrados: formData.get("metros") ? Number(formData.get("metros")) : null,
    dormitorios: formData.get("dormitorios") ? Number(formData.get("dormitorios")) : null,
    banos: formData.get("banos") ? Number(formData.get("banos")) : null,
    amoblada: formData.get("amoblada") === "on",
    valor_uf: Number(formData.get("valor_uf")),
    rol_avaluo: formData.get("rol_avaluo") as string || null,
    descripcion: formData.get("descripcion") as string || null,
    tiene_agua: formData.get("tiene_agua") === "on",
    tiene_luz: formData.get("tiene_luz") === "on",
    tiene_gas: formData.get("tiene_gas") === "on",
    activa: true,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("properties").insert(body);
  if (error) throw new Error(error.message);

  revalidatePath("/propietario/propiedades");
  redirect("/propietario/propiedades");
}

const REGIONES_CHILE = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama",
  "Coquimbo", "Valparaíso", "Metropolitana de Santiago",
  "O'Higgins", "Maule", "Ñuble", "Biobío", "La Araucanía",
  "Los Ríos", "Los Lagos", "Aysén", "Magallanes",
];

export default async function NuevaPropiedadPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
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
      <form action={crearPropiedad} className="card space-y-6">
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
              <p className="text-xs text-[#94A3B8] mt-1">Calle y número</p>
            </div>
            <div>
              <input
                id="prop-numero"
                name="numero"
                className="input-base"
                placeholder="Nº"
              />
              <p className="text-xs text-[#94A3B8] mt-1">Número (opc.)</p>
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
          <p className="label mb-3">Características</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="prop-metros" className="text-xs text-[#64748B] mb-1 block">m² útiles</label>
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
              <label htmlFor="prop-dormitorios" className="text-xs text-[#64748B] mb-1 block">Dormitorios</label>
              <select id="prop-dormitorios" name="dormitorios" className="input-base">
                <option value="">—</option>
                {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="prop-banos" className="text-xs text-[#64748B] mb-1 block">Baños</label>
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
            <label htmlFor="prop-amoblada" className="text-sm text-[#374151] cursor-pointer">
              Propiedad amoblada
            </label>
          </div>
        </div>

        {/* Valor */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prop-uf" className="label">
              Valor arriendo en UF *
              <span className="text-xs font-normal text-[#94A3B8] ml-2">(Ej: 19.5)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm font-medium">UF</span>
              <input
                id="prop-uf"
                name="valor_uf"
                type="number"
                step="0.01"
                min="0.01"
                className="input-base pl-10"
                placeholder="19.50"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="prop-avaluo" className="label">
              Rol de avalúo SII
              <span className="text-xs font-normal text-[#94A3B8] ml-2">(opcional)</span>
            </label>
            <input
              id="prop-avaluo"
              name="rol_avaluo"
              className="input-base"
              placeholder="123-456"
            />
          </div>
        </div>

        {/* Servicios Básicos */}
        <div className="space-y-3">
          <p className="label">Servicios básicos aplicables</p>
          <div className="flex flex-wrap gap-6 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tiene_agua"
                name="tiene_agua"
                defaultChecked
                className="w-4 h-4 accent-[#1E40AF] cursor-pointer"
              />
              <label htmlFor="tiene_agua" className="text-sm font-medium text-[#334155] cursor-pointer select-none">
                Agua potable
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tiene_luz"
                name="tiene_luz"
                defaultChecked
                className="w-4 h-4 accent-[#1E40AF] cursor-pointer"
              />
              <label htmlFor="tiene_luz" className="text-sm font-medium text-[#334155] cursor-pointer select-none">
                Energía eléctrica
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tiene_gas"
                name="tiene_gas"
                className="w-4 h-4 accent-[#1E40AF] cursor-pointer"
              />
              <label htmlFor="tiene_gas" className="text-sm font-medium text-[#334155] cursor-pointer select-none">
                Gas de red/balón
              </label>
            </div>
          </div>
          <p className="text-xs text-[#64748B]">Marca solo los servicios que el arrendatario debe pagar aparte.</p>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="prop-descripcion" className="label">Descripción adicional</label>
          <textarea
            id="prop-descripcion"
            name="descripcion"
            rows={3}
            className="input-base resize-none"
            placeholder="Detalles sobre la propiedad, reglas de convivencia, estacionamiento, etc."
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/propietario/propiedades"
            className="btn-secondary flex-1 justify-center"
          >
            Cancelar
          </Link>
          <button type="submit" className="btn-primary flex-1 justify-center">
            Guardar propiedad
          </button>
        </div>
      </form>
    </div>
  );
}
