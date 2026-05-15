
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import {
  Zap, Droplet, Flame,
  ArrowRight,
  Building2, Info
} from "lucide-react";
import { formatearCLP, formatearFechaChile } from "@/lib/chile/format";
import { UtilityAccountManager } from "@/components/properties/UtilityAccountManager";
import { SyncUtilityButton } from "@/components/properties/SyncUtilityButton";

export const metadata: Metadata = {
  title: "Gestión de Servicios Básicos | ArriendoSeguro",
};

export default async function ServiciosPage() {
  const supabase = await createAdminClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: realPropiedades, error } = await supabase
    .from("properties")
    .select(`
      *,
      utility_accounts (*)
    `)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Mocks para consistencia en la demo
  const mockPropiedades = [
    {
      id: "1", direccion: "Av. Providencia 1234, Dpto 501", comuna: "Providencia", region: "Metropolitana",
      tiene_agua: true, tiene_luz: true, tiene_gas: false, utility_accounts: []
    },
    {
      id: "2", direccion: "Los Leones 456, Casa 3", comuna: "Las Condes", region: "Metropolitana",
      tiene_agua: true, tiene_luz: true, tiene_gas: true, utility_accounts: []
    },
    {
      id: "3", direccion: "Ñuñoa 789, Dpto 302", comuna: "Ñuñoa", region: "Metropolitana",
      tiene_agua: true, tiene_luz: true, tiene_gas: false, utility_accounts: []
    },
  ];

  // Si no hay propiedades reales, usamos las mock para que el usuario vea algo
  const propiedades = (realPropiedades && realPropiedades.length > 0) ? realPropiedades : mockPropiedades;

  if (error && !realPropiedades) {
    // Solo mostramos error si falló la conexión y no tenemos ni mocks
    console.error("Error fetching properties:", error);
  }

  const deudaTotal = propiedades.reduce((acc, prop) => {
    return acc + (prop.utility_accounts?.reduce((acc2: number, acc_util: any) => acc2 + Number(acc_util.monto_deuda || 0), 0) || 0);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Encabezado con KPI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Servicios Básicos</h1>
          <p className="text-[#64748B] text-sm mt-1">
            Monitoreo automático de deudas de Agua, Electricidad y Gas.
          </p>
        </div>
        
        <div className="card py-3 px-6 bg-white border-l-4 border-l-[#1E40AF] flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-[#DBEAFE] rounded-full flex items-center justify-center text-[#1E40AF]">
            <Zap size={20} className="fill-[#1E40AF]" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#64748B]">Deuda Total Detectada</p>
            <p className={`text-xl font-black ${deudaTotal > 0 ? "text-red-600" : "text-[#10B981]"}`}>
              {formatearCLP(deudaTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-blue-800 leading-relaxed">
          <strong>¿Cómo funciona?</strong> Solo necesitas ingresar el Número de Cliente de cada servicio. Nuestro sistema consulta automáticamente las deudas cada 24 horas para mantenerte informado y proteger tu ArriendoScore.
        </div>
      </div>

      {/* Lista de Propiedades */}
      <div className="grid gap-6">
        {propiedades?.length === 0 ? (
          <div className="card py-12 text-center space-y-4">
            <Building2 className="mx-auto text-[#CBD5E1]" size={48} />
            <div className="max-w-xs mx-auto">
              <p className="text-[#0F172A] font-semibold">No tienes propiedades registradas</p>
              <p className="text-[#64748B] text-sm">Registra tu primera propiedad para comenzar a monitorear sus servicios.</p>
            </div>
            <a href="/propietario/propiedades/nueva" className="btn-primary inline-flex items-center gap-2">
              Registrar propiedad
            </a>
          </div>
        ) : (
          propiedades?.map((prop) => (
            <div key={prop.id} className="card p-0 overflow-hidden hover:shadow-md transition-shadow group border-[#E2E8F0]">
              {/* Header Propiedad */}
              <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-center shadow-sm">
                    <Building2 size={16} className="text-[#1E40AF]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-sm leading-none">{prop.direccion}</h3>
                    <p className="text-[11px] text-[#64748B] mt-1 uppercase tracking-tight font-medium">{prop.comuna}, {prop.region}</p>
                  </div>
                </div>
                <a 
                  href={`/propietario/propiedades/${prop.id}`}
                  className="p-2 hover:bg-white rounded-lg text-[#64748B] hover:text-[#1E40AF] transition-colors"
                  title="Ver propiedad"
                >
                  <ArrowRight size={18} />
                </a>
              </div>

              {/* Grid de Servicios */}
              <div className="p-6 grid sm:grid-cols-3 gap-6">
                {/* Agua */}
                <ServiceCard 
                  tipo="agua" 
                  aplica={prop.tiene_agua} 
                  cuenta={prop.utility_accounts?.find((a: any) => a.tipo === "agua")}
                  propertyId={prop.id}
                />
                
                {/* Electricidad */}
                <ServiceCard 
                  tipo="luz" 
                  aplica={prop.tiene_luz} 
                  cuenta={prop.utility_accounts?.find((a: any) => a.tipo === "luz")}
                  propertyId={prop.id}
                />

                {/* Gas */}
                <ServiceCard 
                  tipo="gas" 
                  aplica={prop.tiene_gas} 
                  cuenta={prop.utility_accounts?.find((a: any) => a.tipo === "gas")}
                  propertyId={prop.id}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getFechaVencimientoInfo(fechaVencimiento: string | null): { label: string; color: string } | null {
  if (!fechaVencimiento) return null;

  // Fecha de hoy en Chile (UTC-3, sin considerar DST para simplificar)
  const ahora = new Date();
  const offsetChile = -3 * 60;
  const chileMs = ahora.getTime() + (ahora.getTimezoneOffset() + offsetChile) * 60000;
  const hoyStr = new Date(chileMs).toISOString().slice(0, 10);

  if (fechaVencimiento < hoyStr) {
    const [y, m, d] = fechaVencimiento.split("-");
    return { label: `Vencida el ${d}/${m}/${y}`, color: "text-red-600" };
  }
  if (fechaVencimiento === hoyStr) {
    return { label: "Vence hoy", color: "text-orange-500" };
  }
  const [y, m, d] = fechaVencimiento.split("-");
  return { label: `Vence el ${d}/${m}/${y}`, color: "text-slate-500" };
}

function ServiceCard({ tipo, aplica, cuenta, propertyId }: { tipo: 'agua' | 'luz' | 'gas', aplica: boolean, cuenta: any, propertyId: string }) {
  if (!aplica) {
    return (
      <div className="relative group/disabled opacity-50 grayscale bg-[#F1F5F9] border-dashed border-2 border-[#E2E8F0] rounded-2xl p-5 flex flex-col items-center justify-center text-center">
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Servicio no aplica</p>
        <p className="text-[10px] text-[#94A3B8] mt-1 italic">Incluido en arriendo o no existe</p>
      </div>
    );
  }

  const Icon = tipo === 'agua' ? Droplet : tipo === 'luz' ? Zap : Flame;
  const label = tipo === 'agua' ? 'Agua Potable' : tipo === 'luz' ? 'Energía Eléctrica' : 'Suministro de Gas';
  const hasAccount = !!cuenta;
  const hasDebt = (cuenta?.monto_deuda || 0) > 0;

  return (
    <div className={`relative rounded-2xl p-5 border transition-all ${hasAccount ? (hasDebt ? "bg-red-50/50 border-red-100 shadow-sm" : "bg-green-50/50 border-green-100") : "bg-white border-[#E2E8F0] border-dashed shadow-sm"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${hasAccount ? (hasDebt ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600") : "bg-[#F1F5F9] text-[#64748B]"}`}>
          <Icon size={18} className={hasAccount ? "fill-current" : ""} />
        </div>
        {hasAccount ? (
          hasDebt ? (
            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase">Con Deuda</span>
          ) : (
            <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase">Al Día</span>
          )
        ) : (
          <span className="text-[10px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full uppercase">Sin Configurar</span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-bold text-[#0F172A]">{label}</p>
        {hasAccount ? (
          <>
            <p className="text-xs text-[#64748B] truncate">{cuenta.proveedor} · {cuenta.numero_cliente}</p>
            <p className={`text-lg font-black mt-2 ${hasDebt ? "text-red-600" : "text-[#10B981]"}`}>
              {formatearCLP(cuenta.monto_deuda || 0)}
            </p>
            {(() => {
              const fechaInfo = getFechaVencimientoInfo(cuenta.fecha_vencimiento);
              return fechaInfo ? (
                <p className={`text-[10px] font-semibold ${fechaInfo.color}`}>{fechaInfo.label}</p>
              ) : null;
            })()}
            {Number(cuenta.saldo_anterior) > 0 && (
              <p className="text-[10px] text-orange-600 font-medium">
                Saldo anterior: {formatearCLP(Number(cuenta.saldo_anterior))}
              </p>
            )}
            <div className="pt-2">
              <SyncUtilityButton accountId={cuenta.id} />
            </div>
            {cuenta.ultima_consulta && (
              <p className="text-[9px] text-[#94A3B8] mt-1">
                Sincronizado: {formatearFechaChile(cuenta.ultima_consulta)}
              </p>
            )}
          </>
        ) : (
          <div className="pt-2 space-y-2">
            <p className="text-xs text-[#94A3B8]">Configura el número de cliente para activar el monitoreo.</p>
            <UtilityAccountManager 
              propertyId={propertyId} 
              tipo={tipo} 
              variant="button"
            />
          </div>
        )}
      </div>

      {hasAccount && (
        <div className="absolute top-4 right-4">
          <UtilityAccountManager 
            propertyId={propertyId} 
            tipo={tipo} 
            variant="icon"
            existingAccount={cuenta}
          />
        </div>
      )}
    </div>
  );
}
