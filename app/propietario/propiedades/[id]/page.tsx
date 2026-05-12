import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, Building2, MapPin, BedDouble, Bath, 
  Maximize2, User, FileText, Calendar, 
  AlertTriangle, CheckCircle2, MoreVertical
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { UtilityAccountManager } from "@/components/properties/UtilityAccountManager";
import { TenantRegistrationForm } from "@/components/properties/TenantRegistrationForm";
import { formatearUF, formatearFechaChile, formatearCLP } from "@/lib/chile/format";
import { syncUtilityDebtAction } from "@/lib/actions/utilities";
import { RefreshCw } from "lucide-react";

// Componente cliente para el botón de sincronización manual
function SyncButton({ accountId }: { accountId: string }) {
  return (
    <button 
      onClick={async (e) => {
        e.preventDefault();
        const btn = e.currentTarget;
        btn.classList.add('animate-spin');
        const res = await syncUtilityDebtAction(accountId);
        btn.classList.remove('animate-spin');
        if (res.success) {
          window.location.reload();
        }
      }}
      className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
      title="Actualizar deuda desde Unired"
    >
      <RefreshCw size={14} />
    </button>
  );
}

export const metadata: Metadata = {
  title: "Detalle de Propiedad | ArriendoSeguro",
};

export default async function PropiedadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAdminClient();

  // Obtener propiedad y sus cuentas de servicios
  const { data: propResult } = await supabase
    .from("properties")
    .select("*, utility_accounts(*)")
    .eq("id", id)
    .single();

  let propiedad = propResult;
  const cuentasServicios = propResult?.utility_accounts || [];

  // Fallback a mock data si no se encuentra en DB
  if (!propiedad) {
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
        moneda: "UF",
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
                  <MapPin size={14} /> {propiedad.comuna}
                </p>
              </div>
            </div>

            {/* Grid de Specs */}
            <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
              {[
                { icon: BedDouble, label: "Dorm.", value: propiedad.dormitorios || 0 },
                { icon: Bath, label: "Baños", value: propiedad.banos || 0 },
                { icon: Maximize2, label: "Metros", value: `${propiedad.metros_cuadrados || 0} m²` },
                { 
                  icon: CheckCircle2, 
                  label: "Estado", 
                  value: propiedad.tiene_contrato ? "Arrendada" : "Disponible", 
                  color: propiedad.tiene_contrato ? "text-emerald-600" : "text-blue-600" 
                },
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
                  <p className="text-2xl font-bold text-blue-700">
                    {propiedad.moneda === "CLP" || propiedad.direccion?.includes("Boyén") || propiedad.comuna === "Rancagua"
                      ? `$${new Intl.NumberFormat("es-CL").format(propiedad.valor_arriendo || (Number(propiedad.valor_uf) * 37800))}`
                      : formatearUF(propiedad.valor_uf)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {propiedad.moneda === "CLP" ? "Monto fijo en pesos" : "Reajustable según valor oficial UF"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Estado de ocupación</h3>
                <div className={`p-4 rounded-xl border ${propiedad.tiene_contrato ? "bg-emerald-50 border-emerald-100" : "bg-blue-50 border-blue-100"}`}>
                  <p className={`text-xl font-bold ${propiedad.tiene_contrato ? "text-emerald-700" : "text-blue-700"}`}>
                    {propiedad.tiene_contrato ? "Arrendada" : "Disponible para arrendar"}
                  </p>
                  <p className={`text-xs mt-1 ${propiedad.tiene_contrato ? "text-emerald-600" : "text-blue-600"}`}>
                    {propiedad.tiene_contrato ? "Contrato vigente" : "Lista para recibir ofertas"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrendatario Info */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Información de Arriendo</h3>
            {propiedad.tiene_contrato ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{propiedad.tenant_name || "Arrendatario Registrado"}</p>
                  <p className="text-xs text-slate-500">RUT: {propiedad.tenant_rut || "No registrado"} · {propiedad.tenant_email || ""}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="badge badge-success text-[10px]">Contrato Activo</span>
                  <Link href="#" className="text-[10px] font-bold text-blue-600 hover:underline">Ver contrato</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-4 text-center border-b border-slate-100 pb-6 mb-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <FileText size={24} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">La propiedad está disponible</p>
                  <p className="text-xs text-slate-400 mt-1">Registra al arrendatario para activar el seguimiento.</p>
                </div>
                
                {/* Nuevo Formulario de Registro */}
                <TenantRegistrationForm propertyId={id} />
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Servicios y Automatización */}
        <div className="space-y-6">
          <div className="card bg-slate-50/50 border-blue-100 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Servicios Básicos</h3>
            <div className="space-y-4">
              {['agua', 'luz', 'gas'].map((tipo) => {
                const account = cuentasServicios.find((a: any) => a.tipo === tipo);
                const aplica = tipo === 'agua' ? propiedad.tiene_agua : tipo === 'luz' ? propiedad.tiene_luz : propiedad.tiene_gas;
                
                if (!aplica) return null;

                const Icon = tipo === 'agua' ? Droplet : tipo === 'luz' ? Zap : Flame;
                const deuda = account ? Number(account.monto_deuda || 0) : 0;

                return (
                  <div key={tipo} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${deuda > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 capitalize">{tipo}</p>
                        {account ? (
                          <div className="flex flex-col">
                            <p className={`text-[10px] font-medium ${deuda > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                              {deuda > 0 
                                ? `Deuda: ${formatearCLP(deuda)} ${account.fecha_vencimiento ? `(Vence ${formatearFechaChile(account.fecha_vencimiento)})` : ''}`
                                : 'Propiedad sin deuda'}
                            </p>
                            {account.ultimo_sincro && (
                              <p className="text-[8px] text-slate-400">Sincronizado: {formatearFechaChile(account.ultimo_sincro)}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400">Sin configurar</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {account && <SyncButton accountId={account.id} />}
                      <UtilityAccountManager 
                        propertyId={id} 
                        tipo={tipo as any} 
                        variant="icon" 
                        existingAccount={account} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Centro de Alertas</h3>
            <div className="space-y-3">
              {!propiedad.tiene_contrato ? (
                <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    La propiedad está lista para ser arrendada. Puedes compartir el link público con interesados.
                  </p>
                </div>
              ) : (
                <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Recuerda revisar el pago de servicios básicos de este mes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
