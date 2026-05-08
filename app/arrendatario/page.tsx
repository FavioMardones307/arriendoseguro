import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, FileText, Star, Download, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatearCLP, formatearUF, formatearFechaChile } from "@/lib/chile/format";
import { ScoreGauge } from "@/components/score/ScoreGauge";
import { calcularScore, PERFILES_PRUEBA } from "@/lib/score/calculate";

export const metadata: Metadata = {
  title: "Mi Arriendo",
};

// Mock data — en producción viene de Supabase
const mockArriendo = {
  propiedad: "Av. Providencia 1234, Dpto 501",
  comuna: "Providencia",
  propietario: "Juan Pérez Soto",
  monto_clp: 650000,
  monto_uf: 19.4,
  dia_pago: 5,
  fecha_inicio: "2025-03-01",
  fecha_fin: "2026-03-01",
  estado: "vigente" as const,
  garantia_clp: 1300000,
  contrato_url: "#",
};

const mockPagos = [
  { periodo: "Mayo 2026", monto: 650000, estado: "pendiente" as const, vence: "2026-05-05" },
  { periodo: "Abril 2026", monto: 650000, estado: "pagado" as const, fecha_pago: "2026-04-04" },
  { periodo: "Marzo 2026", monto: 650000, estado: "pagado" as const, fecha_pago: "2026-03-05" },
];

// Calcular score del demo
const { score: demoScore, nivel: demoNivel, breakdown } = calcularScore(PERFILES_PRUEBA.regular);

export default function ArrendatarioDashboard() {
  const hoy = new Date();
  const diaActual = hoy.getDate();
  const diasAlPago = mockArriendo.dia_pago - diaActual;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Mi Arriendo</h1>
        <p className="text-[#64748B] text-sm mt-0.5">{formatearFechaChile(hoy)}</p>
      </div>

      {/* Card principal: próximo pago */}
      <div className="gradient-hero rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-blue-200 text-sm mb-1">Próximo pago</p>
          <p className="text-4xl font-bold mb-1">{formatearCLP(mockArriendo.monto_clp)}</p>
          <p className="text-blue-200 text-sm mb-4">{formatearUF(mockArriendo.monto_uf)} · día {mockArriendo.dia_pago} de cada mes</p>

          <div className="flex items-center gap-3 flex-wrap">
            {diasAlPago <= 0 ? (
              <span className="flex items-center gap-1.5 bg-red-500/30 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                <AlertCircle size={14} /> Vence hoy
              </span>
            ) : diasAlPago <= 3 ? (
              <span className="flex items-center gap-1.5 bg-amber-500/30 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                <Clock size={14} /> Vence en {diasAlPago} días
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-white/20 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                <Clock size={14} /> En {diasAlPago} días
              </span>
            )}

            <Link
              href="/arrendatario/pagos/pagar"
              className="btn-accent text-sm py-2 px-5"
            >
              Pagar ahora <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Info del arriendo + Score */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Datos del arriendo */}
        <div className="card">
          <h2 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <FileText size={16} className="text-[#1E40AF]" />
            Mi contrato
          </h2>
          <dl className="space-y-3 text-sm">
            {[
              { label: "Propiedad", value: mockArriendo.propiedad },
              { label: "Comuna", value: mockArriendo.comuna },
              { label: "Propietario", value: mockArriendo.propietario },
              { label: "Inicio contrato", value: formatearFechaChile(mockArriendo.fecha_inicio) },
              { label: "Término contrato", value: formatearFechaChile(mockArriendo.fecha_fin) },
              { label: "Garantía pagada", value: formatearCLP(mockArriendo.garantia_clp) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-[#64748B] shrink-0">{label}</dt>
                <dd className="font-medium text-[#0F172A] text-right">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
            <a
              href={mockArriendo.contrato_url}
              className="flex items-center gap-2 text-sm text-[#1E40AF] font-medium hover:underline"
            >
              <Download size={15} /> Descargar contrato PDF
            </a>
          </div>
        </div>

        {/* ArriendoScore */}
        <div className="card flex flex-col items-center">
          <h2 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2 self-start w-full">
            <Star size={16} className="text-[#F59E0B]" />
            Mi ArriendoScore
          </h2>
          <ScoreGauge
            score={demoScore}
            nivel={demoNivel}
            size={180}
            mostrarBreakdown={false}
          />
          <div className="mt-4 text-center">
            <p className="text-xs text-[#64748B] mb-3">
              Tu score se actualiza con cada pago registrado
            </p>
            <Link
              href="/arrendatario/score"
              className="btn-secondary text-sm py-2 px-4"
            >
              Ver breakdown completo <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Historial de pagos */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
          <h2 className="font-semibold text-[#0F172A] flex items-center gap-2">
            <CreditCard size={16} className="text-[#1E40AF]" />
            Historial de pagos
          </h2>
          <Link href="/arrendatario/pagos" className="text-sm text-[#1E40AF] font-medium hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {mockPagos.map((pago) => (
            <div key={pago.periodo} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-[#0F172A] text-sm">{pago.periodo}</p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {pago.estado === "pagado" && pago.fecha_pago
                    ? `Pagado el ${formatearFechaChile(pago.fecha_pago)}`
                    : `Vence el ${formatearFechaChile(pago.vence ?? "")}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-[#0F172A]">{formatearCLP(pago.monto)}</span>
                {pago.estado === "pagado" ? (
                  <span className="badge badge-success"><CheckCircle2 size={11} /> Pagado</span>
                ) : (
                  <span className="badge badge-warning"><Clock size={11} /> Pendiente</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
