import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2, TrendingUp, AlertCircle, CheckCircle2,
  Clock, Plus, ArrowRight, CreditCard, FileText,
  ChevronUp, ChevronDown, Minus, Droplet, Zap, Flame
} from "lucide-react";
import { formatearCLP, formatearUF } from "@/lib/chile/format";
import { formatearFechaChile } from "@/lib/chile/format";

export const metadata: Metadata = {
  title: "Panel Propietario",
};

// Mock data — en producción vendrá de Supabase con Server Components
const mockData = {
  resumen: {
    propiedades_activas: 3,
    contratos_vigentes: 3,
    ingresos_mes_clp: 1850000,
    ingresos_mes_uf: 55.2,
    pagos_pendientes: 1,
    pagos_atrasados: 0,
  },
  propiedades: [
    {
      id: "1",
      direccion: "Av. Providencia 1234, Dpto 501",
      comuna: "Providencia",
      arrendatario: "María González",
      monto_clp: 650000,
      monto_uf: 19.4,
      estado_pago: "pagado" as const,
      proximo_pago: "2026-06-05",
      dias_al_pago: 30,
      servicios: {
        agua: { aplica: true, deuda: 0 },
        luz: { aplica: true, deuda: 12450 },
        gas: { aplica: false, deuda: 0 }
      }
    },
    {
      id: "2",
      direccion: "Los Leones 456, Casa 3",
      comuna: "Las Condes",
      arrendatario: "Carlos Muñoz",
      monto_clp: 750000,
      monto_uf: 22.4,
      estado_pago: "pendiente" as const,
      proximo_pago: "2026-05-08",
      dias_al_pago: 2,
      servicios: {
        agua: { aplica: true, deuda: 0 },
        luz: { aplica: true, deuda: 0 },
        gas: { aplica: true, deuda: 0 }
      }
    },
    {
      id: "3",
      direccion: "Ñuñoa 789, Dpto 302",
      comuna: "Ñuñoa",
      arrendatario: "Ana Fernández",
      monto_clp: 450000,
      monto_uf: 13.4,
      estado_pago: "pagado" as const,
      proximo_pago: "2026-06-10",
      dias_al_pago: 35,
      servicios: {
        agua: { aplica: true, deuda: 0 },
        luz: { aplica: true, deuda: 0 },
        gas: { aplica: false, deuda: 0 }
      }
    },
  ],
  alertas: [
    { id: "1", tipo: "vencimiento_pago", mensaje: "Pago pendiente: Carlos Muñoz — vence en 2 días", urgente: true },
    { id: "2", tipo: "reajuste", mensaje: "Reajuste IPC pendiente para contrato Los Leones — junio 2026", urgente: false },
    { id: "3", tipo: "deuda_servicio", mensaje: "Deuda detectada: Enel (Luz) — Av. Providencia 1234 ($12.450)", urgente: true },
  ],
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

function MiniSemaforoServicio({ tipo, deuda, aplica }: { tipo: 'agua' | 'luz' | 'gas', deuda: number, aplica: boolean }) {
  if (!aplica) return null;
  const Icon = tipo === 'agua' ? Droplet : tipo === 'luz' ? Zap : Flame;
  const colorClass = deuda > 0 ? "text-red-500 bg-red-50 border-red-200" : "text-green-500 bg-green-50 border-green-200";
  
  return (
    <div 
      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110 cursor-help`}
      title={`${tipo.charAt(0).toUpperCase() + tipo.slice(1)}: ${deuda > 0 ? `Deuda ${formatearCLP(deuda)}` : 'Al día'}`}
    >
      <Icon size={14} className={deuda > 0 ? "fill-red-500" : "fill-green-500"} />
    </div>
  );
}

export default function PropietarioDashboard() {
  const { resumen, propiedades, alertas } = mockData;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Panel de Control</h1>
          <p className="text-[#64748B] text-sm mt-0.5">
            {formatearFechaChile(new Date())} · {resumen.contratos_vigentes} contratos vigentes
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
                alerta.urgente
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
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
            <span className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Ingresos mayo</span>
            <TrendingUp size={16} className="text-[#10B981]" />
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{formatearCLP(resumen.ingresos_mes_clp)}</p>
          <p className="text-xs text-[#64748B] mt-1">{formatearUF(resumen.ingresos_mes_uf)}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Pagos pendientes</span>
            <Clock size={16} className="text-[#F59E0B]" />
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{resumen.pagos_pendientes}</p>
          <p className="text-xs text-[#F59E0B] flex items-center gap-1 mt-1">
            <Minus size={12} /> Requiere atención
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Atrasados</span>
            <AlertCircle size={16} className="text-[#EF4444]" />
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{resumen.pagos_atrasados}</p>
          <p className={`text-xs flex items-center gap-1 mt-1 ${resumen.pagos_atrasados === 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
            {resumen.pagos_atrasados === 0 ? <><ChevronDown size={12} /> Sin atrasos</> : <><AlertCircle size={12} /> Gestionar</>}
          </p>
        </div>
      </div>

      {/* Propiedades y semáforo */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
          <h2 className="font-semibold text-[#0F172A]">Semáforo de pagos — Mayo 2026</h2>
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
                <th className="text-left px-5 py-3">Arrendatario</th>
                <th className="text-right px-5 py-3">Arriendo</th>
                <th className="text-center px-5 py-3">Estado Arriendo</th>
                <th className="text-center px-5 py-3">Servicios Básicos</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {propiedades.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#0F172A] leading-tight">{p.direccion}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{p.comuna}</p>
                  </td>
                  <td className="px-5 py-4 text-[#374151]">{p.arrendatario}</td>
                  <td className="px-5 py-4 text-right">
                    <p className="font-semibold text-[#0F172A]">{formatearCLP(p.monto_clp)}</p>
                    <p className="text-xs text-[#94A3B8]">{formatearUF(p.monto_uf)}</p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <SemaforoPago estado={p.estado_pago} diasAlPago={p.dias_al_pago} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <MiniSemaforoServicio tipo="agua" deuda={p.servicios.agua.deuda} aplica={p.servicios.agua.aplica} />
                      <MiniSemaforoServicio tipo="luz" deuda={p.servicios.luz.deuda} aplica={p.servicios.luz.aplica} />
                      <MiniSemaforoServicio tipo="gas" deuda={p.servicios.gas.deuda} aplica={p.servicios.gas.aplica} />
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

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-[#F1F5F9]">
          {propiedades.map((p) => (
            <div key={p.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-medium text-[#0F172A] text-sm leading-tight truncate">{p.direccion}</p>
                  <p className="text-xs text-[#94A3B8]">{p.arrendatario} · {p.comuna}</p>
                </div>
                <SemaforoPago estado={p.estado_pago} diasAlPago={p.dias_al_pago} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#0F172A]">{formatearCLP(p.monto_clp)}</span>
                <Link href={`/propietario/propiedades/${p.id}`} className="text-xs text-[#1E40AF] font-medium">
                  Ver detalle →
                </Link>
              </div>
            </div>
          ))}
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
