import type { Metadata } from "next";
import { ScoreGauge } from "@/components/score/ScoreGauge";
import { calcularScore, PERFILES_PRUEBA, etiquetaNivel, colorPorNivel } from "@/lib/score/calculate";
import { Download, Info, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Mi ArriendoScore" };

const { score, nivel, breakdown } = calcularScore(PERFILES_PRUEBA.regular);

const categorias = [
  { key: "historial_pagos", label: "Historial de pagos", max: 300, peso: "30%", descripcion: "Pagos realizados en la plataforma" },
  { key: "puntualidad", label: "Puntualidad", max: 150, peso: "15%", descripcion: "Días promedio de retraso" },
  { key: "ingresos_verificados", label: "Ingresos verificados", max: 200, peso: "20%", descripcion: "Ratio arriendo/ingreso vía Floid" },
  { key: "dicom_cmf", label: "DICOM / CMF", max: 100, peso: "10%", descripcion: "Deudas en el sistema financiero" },
  { key: "referencias", label: "Referencias", max: 100, peso: "10%", descripcion: "Referencias de propietarios anteriores" },
  { key: "duracion_arriendos", label: "Duración de arriendos", max: 100, peso: "10%", descripcion: "Historial de contratos completados" },
  { key: "servicios_basicos", label: "Servicios básicos", max: 50, peso: "5%", descripcion: "Pago de luz, agua, gas, etc." },
] as const;

export default function ScorePage() {
  const color = colorPorNivel(nivel);
  const etiqueta = etiquetaNivel(nivel);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Mi ArriendoScore</h1>
        <p className="text-[#64748B] text-sm mt-1">Tu historial como arrendatario, resumido en un puntaje.</p>
      </div>

      {/* Score principal */}
      <div className="card flex flex-col items-center py-8">
        <ScoreGauge score={score} nivel={nivel} size={220} mostrarBreakdown={false} />
        <div className="mt-4 text-center">
          <span className="text-sm font-semibold px-4 py-1.5 rounded-full" style={{ background: color + "20", color }}>
            Nivel {etiqueta}
          </span>
          <p className="text-xs text-[#64748B] mt-3 max-w-xs">
            Actualizado automáticamente con cada pago. Calculado el {new Date().toLocaleDateString("es-CL")}.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
            <Download size={15} /> Descargar certificado PDF
          </button>
          <button className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
            <ShieldCheck size={15} /> Compartir score
          </button>
        </div>
      </div>

      {/* Breakdown detallado */}
      <div className="card">
        <h2 className="font-semibold text-[#0F172A] mb-4">Detalle del puntaje</h2>
        <div className="space-y-5">
          {categorias.map(({ key, label, max, peso, descripcion }) => {
            const valor = breakdown[key] ?? 0;
            const pct = Math.round((valor / max) * 100);
            const barColor = pct >= 80 ? "#10B981" : pct >= 50 ? "#3B82F6" : pct >= 30 ? "#F59E0B" : "#EF4444";
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-[#0F172A]">{label}</span>
                    <span className="text-xs text-[#94A3B8] ml-2">({peso})</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: barColor }}>{valor}/{max}</span>
                </div>
                <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: barColor }} />
                </div>
                <p className="text-xs text-[#94A3B8] mt-1">{descripcion}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aviso legal */}
      <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <Info size={16} className="shrink-0 mt-0.5" />
        <div>
          <strong>Privacy by design (Ley 21.719):</strong> Tu score solo se comparte con propietarios con tu consentimiento explícito.
          Tienes derecho a oponerte a cualquier decisión automatizada basada en este score.
          <a href="/legal/arriendo-score" className="ml-1 underline">Saber más →</a>
        </div>
      </div>
    </div>
  );
}
