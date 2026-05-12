import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2, TrendingUp, AlertCircle, CheckCircle2,
  Clock, Plus, ArrowRight, CreditCard, FileText,
  ChevronUp, ChevronDown, Minus, Droplet, Zap, Flame
} from "lucide-react";
import { formatearCLP, formatearUF } from "@/lib/chile/format";
import { formatearFechaChile } from "@/lib/chile/format";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Panel Propietario | ArriendoSeguro",
};

function SemaforoPago({ estado, diasAlPago }: { estado: "pagado" | "pendiente" | "atrasado"; diasAlPago: number }) {
  if (estado === "pagado") return (
    <span className="badge badge-success flex items-center gap-1">
      <CheckCircle2 size={12} /> Arriendo al día
    </span>
  );
  if (estado === "atrasado") return (
    <span className="badge badge-error flex items-center gap-1">
      <AlertCircle size={12} /> Pago atrasado
    </span>
  );
  if (diasAlPago <= 3) return (
    <span className="badge badge-warning flex items-center gap-1">
      <Clock size={12} /> Vence en {diasAlPago}d
    </span>
  );
  return (
    <span className="badge badge-neutral flex items-center gap-1">
      <Clock size={12} /> Pendiente
    </span>
  );
}

function MiniSemaforoServicio({ tipo, account }: { tipo: 'agua' | 'luz' | 'gas', account?: any }) {
  const Icon = tipo === 'agua' ? Droplet : tipo === 'luz' ? Zap : Flame;
  
  if (!account) {
    return (
      <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center opacity-20 grayscale" title="No configurado">
        <Icon size={14} />
      </div>
    );
  }

  const deuda = Number(account.monto_deuda || 0);
  const colorClass = deuda > 0 
    ? "text-red-500 bg-red-50 border-red-200" 
    : "text-emerald-500 bg-emerald-50 border-emerald-200";
  
  return (
    <div 
      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110 cursor-help ${colorClass}`}
      title={`${tipo.toUpperCase()}: ${deuda > 0 ? `Deuda ${formatearCLP(deuda)}` : 'Al día'}`}
    >
      <Icon size={14} className={deuda > 0 ? "fill-red-500" : "fill-emerald-500"} />
    </div>
  );
}

export default async function PropietarioDashboard() {
  const supabase = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Consultar datos reales de Supabase
  const { data: realPropiedades } = await (supabase as any)
    .from("properties")
    .select("*, utility_accounts(*)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const props = realPropiedades || [];
  
  // Resumen calculado de datos reales
  const resumen = {
    propiedades_activas: props.length,
    contratos_vigentes: 0, // Implementar cuando haya contratos reales
    ingresos_mes_clp: props.reduce((acc: number, p: any) => acc + (p.moneda === 'CLP' ? Number(p.valor_arriendo) : 0), 0),
    ingresos_mes_uf: props.reduce((acc: number, p: any) => acc + (p.moneda === 'UF' ? Number(p.valor_uf) : 0), 0),
    pagos_pendientes: 0,
    pagos_atrasados: 0,
  };

  const alertas = [];
  // Generar alertas automáticas de servicios
  props.forEach((p: any) => {
    p.utility_accounts?.forEach((acc: any) => {
      if (Number(acc.monto_deuda) > 0) {
        alertas.push({
          id: acc.id,
          mensaje: `Deuda detectada: ${acc.proveedor} (${acc.tipo}) — ${p.direccion} (${formatearCLP(acc.monto_deuda)})`,
          urgente: true
        });
      }
    });
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Panel de Control</h1>
          <p className="text-[#64748B] text-sm mt-0.5">
            {formatearFechaChile(new Date())} · {resumen.propiedades_activas} propiedades registradas
          </p>
        </div>
        <Link href="/propietario/propiedades/nueva" className="btn-primary text-sm">
          <Plus size={16} /> Agregar propiedad
        </Link>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-red-50 border-red-200 text-red-800 animate-pulse-subtle"
              role="alert"
            >
              <AlertCircle size={16} className="shrink-0" />
              {alerta.mensaje}
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Propiedades</span>
            <Building2 size={16} className="text-[#1E40AF]" />
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{resumen.propiedades_activas}</p>
          <p className="text-xs text-[#10B981] flex items-center gap-1 mt-1">
            <ChevronUp size={12} /> Todas activas
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Ingresos Estimados</span>
            <TrendingUp size={16} className="text-[#10B981]" />
          </div>
          <p className="text-xl font-bold text-[#0F172A]">{formatearCLP(resumen.ingresos_mes_clp)}</p>
          <p className="text-xs text-[#64748B] mt-1">{formatearUF(resumen.ingresos_mes_uf)}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Pagos Pendientes</span>
            <Clock size={16} className="text-[#F59E0B]" />
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{resumen.pagos_pendientes}</p>
          <p className="text-xs text-[#64748B] flex items-center gap-1 mt-1">
            <Minus size={12} /> Sin contratos aún
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Atrasados</span>
            <AlertCircle size={16} className="text-[#EF4444]" />
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{resumen.pagos_atrasados}</p>
          <p className="text-xs text-[#10B981] flex items-center gap-1 mt-1">
             <ChevronDown size={12} /> Sin atrasos
          </p>
        </div>
      </div>

      {/* Propiedades y semáforo */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
          <h2 className="font-semibold text-[#0F172A]">Semáforo de pagos — {new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(new Date())}</h2>
          <Link href="/propietario/pagos" className="text-sm text-[#1E40AF] font-medium hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {/* Desktop tabla */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#64748B] text-xs font-semibold uppercase tracking-wide">
                <th className="text-left px-5 py-3">Propiedad</th>
                <th className="text-right px-5 py-3">Arriendo</th>
                <th className="text-center px-5 py-3">Estado</th>
                <th className="text-center px-5 py-3">Servicios Básicos</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {props.map((p: any) => (
                <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#0F172A] leading-tight">{p.direccion}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{p.comuna}</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <p className="font-semibold text-[#0F172A]">
                      {p.moneda === 'CLP' ? formatearCLP(p.valor_arriendo) : formatearUF(p.valor_uf)}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="badge badge-neutral">Sin contrato</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <MiniSemaforoServicio tipo="agua" account={p.utility_accounts?.find((a: any) => a.tipo === 'agua')} />
                      <MiniSemaforoServicio tipo="luz" account={p.utility_accounts?.find((a: any) => a.tipo === 'luz')} />
                      <MiniSemaforoServicio tipo="gas" account={p.utility_accounts?.find((a: any) => a.tipo === 'gas')} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/propietario/propiedades/${p.id}`} className="text-[#1E40AF] hover:underline text-xs font-medium">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/propietario/contratos/nuevo", icon: FileText, label: "Nuevo contrato", color: "#1E40AF", bg: "#DBEAFE" },
          { href: "/propietario/pagos/registrar", icon: CreditCard, label: "Registrar pago", color: "#10B981", bg: "#D1FAE5" },
          { href: "/propietario/inventarios/nuevo", icon: Building2, label: "Nuevo inventario", color: "#7C3AED", bg: "#EDE9FE" },
        ].map((acc) => (
          <Link
            key={acc.href}
            href={acc.href}
            className="card flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: acc.bg }}>
              <acc.icon size={18} style={{ color: acc.color }} />
            </div>
            <span className="font-medium text-[#0F172A] text-sm">{acc.label}</span>
            <ArrowRight size={16} className="ml-auto text-[#94A3B8] group-hover:text-[#1E40AF] transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
