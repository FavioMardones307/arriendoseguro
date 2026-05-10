import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, Building2, MapPin, BedDouble, Bath, 
  Maximize2, User, FileText, Calendar, 
  AlertTriangle, CheckCircle2, MoreVertical
} from "lucide-react";
import { db } from "@/db";
import { properties, profiles, utilityAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UtilityAccountManager } from "@/components/properties/UtilityAccountManager";
import { formatearUF, formatearFechaChile } from "@/lib/chile/format";

export const metadata: Metadata = {
  title: "Detalle de Propiedad",
};

export default async function PropiedadDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // En una app real, esto sería una consulta a Supabase
  // Por ahora, intentamos obtener de la DB si existe, o usamos mock si falla (para demo)
  let propiedad;
  let cuentasServicios = [];

  try {
    const result = await db.select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);
    
    if (result.length > 0) {
      propiedad = result[0];
      
      // Obtener cuentas de servicios
      cuentasServicios = await db.select()
        .from(utilityAccounts)
        .where(eq(utilityAccounts.property_id, id));
    }
  } catch (error) {
    console.error("Error fetching property:", error);
  }

  // Fallback a mock data si no se encuentra en DB (para desarrollo/continuidad)
  if (!propiedad) {
    // Si el ID es uno de los mocks, mostramos datos coherentes
    if (id === "1" || id === "2" || id === "3") {
      propiedad = {
        id,
        direccion: id === "1" ? "Av. Providencia 1234, Dpto 501" : id === "2" ? "Los Leones 456, Casa 3" : "Ñuñoa 789, Dpto 302",
        comuna: id === "1" ? "Providencia" : id === "2" ? "Las Condes" : "Ñuñoa",
        tipo: id === "2" ? "casa" : "departamento",
        dormitorios: id === "2" ? 3 : id === "1" ? 2 : 1,
        banos: id === "2" ? 2 : 1,
        metros_cuadrados: id === "2" ? "110" : id === "1" ? "60" : "42",
        valor_uf: id === "1" ? "19.4" : id === "2" ? "22.4" : "13.4",
        activa: true,
      };
    } else {
      return notFound();
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Navegación superior */}
      <div className="flex items-center justify-between">
        <Link href="/propietario/propiedades" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} /> Volver a mis propiedades
        </Link>
        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Info Principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden p-0">
            {/* Cabecera con imagen (placeholder) */}
            <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative flex items-center justify-center">
              <Building2 size={64} className="text-white/20" />
              <div className="absolute bottom-4 left-6">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase rounded-full border border-white/30">
                  {propiedad.tipo}
                </span>
                <h1 className="text-2xl font-bold text-white mt-2">{propiedad.direccion}</h1>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <MapPin size={14} /> {propiedad.comuna}, Santiago
                </p>
              </div>
            </div>

            {/* Grid de Specs */}
            <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
              {[
                { icon: BedDouble, label: "Dorm.", value: propiedad.dormitorios || 0 },
                { icon: Bath, label: "Baños", value: propiedad.banos || 0 },
                { icon: Maximize2, label: "Metros", value: `${propiedad.metros_cuadrados || 0} m²` },
                { icon: CheckCircle2, label: "Estado", value: propiedad.activa ? "Activa" : "Inactiva", color: "text-emerald-600" },
              ].map((spec, i) => (
                <div key={i} className="py-4 px-2 text-center">
                  <div className="flex justify-center mb-1">
                    <spec.icon size={18} className="text-slate-400" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{spec.label}</p>
                  <p className={`text-sm font-bold text-slate-900 ${spec.color || ""}`}>{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Detalles económicos */}
            <div className="p-6 grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Valor de Arriendo</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-2xl font-bold text-blue-700">{formatearUF(propiedad.valor_uf)}</p>
                  <p className="text-xs text-slate-500 mt-1">Reajustable según IPC anual</p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Próximo Pago</h3>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-700">05 Jun</p>
                  <p className="text-xs text-emerald-600 mt-1">Al día con el último pago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrendatario Info */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Arrendatario Actual</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <User size={24} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900">María González</p>
                <p className="text-xs text-slate-500">RUT: 12.345.678-9 · Verificada ✅</p>
              </div>
              <Link href="#" className="text-xs font-bold text-blue-600 hover:underline">Ver contrato</Link>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Servicios y Automatización */}
        <div className="space-y-6">
          <div className="card bg-slate-50/50 border-blue-100 shadow-sm">
            <UtilityAccountManager propertyId={id} initialAccounts={cuentasServicios as any} />
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Centro de Alertas</h3>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Recordatorio:</strong> El contrato vence en 4 meses. Deberías decidir si renovar o pedir la propiedad.
                </p>
              </div>
              <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <FileText size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Se ha generado el reporte de gastos del mes de mayo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
