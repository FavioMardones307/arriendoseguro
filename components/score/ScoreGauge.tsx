"use client";

import { useEffect, useRef } from "react";
import { colorPorNivel, etiquetaNivel, type NivelScore } from "@/lib/score/calculate";

interface ScoreGaugeProps {
  score: number;
  nivel: NivelScore;
  size?: number;
  mostrarBreakdown?: boolean;
  breakdown?: Record<string, number>;
}

export function ScoreGauge({
  score,
  nivel,
  size = 180,
  mostrarBreakdown = false,
  breakdown,
}: ScoreGaugeProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const color = colorPorNivel(nivel);
  const etiqueta = etiquetaNivel(nivel);

  // Cálculo del gauge (arco de 75% del círculo)
  const radio = 70;
  const circunferencia = 2 * Math.PI * radio;
  const arcoTotal = circunferencia * 0.75; // 270 grados
  const offset = arcoTotal - (score / 1000) * arcoTotal;

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    // Animación al montar
    circle.style.strokeDashoffset = String(arcoTotal);
    const timeout = setTimeout(() => {
      circle.style.transition = "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
      circle.style.strokeDashoffset = String(offset);
    }, 100);

    return () => clearTimeout(timeout);
  }, [score, offset, arcoTotal]);

  const centro = size / 2;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Gauge */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`ArriendoScore: ${score} puntos — Nivel ${etiqueta}`}
        >
          {/* Rotamos -225° para empezar desde abajo-izquierda */}
          <g transform={`rotate(-225, ${centro}, ${centro})`}>
            {/* Track (fondo) */}
            <circle
              cx={centro}
              cy={centro}
              r={radio}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${arcoTotal} ${circunferencia}`}
            />
            {/* Fill animado */}
            <circle
              ref={circleRef}
              cx={centro}
              cy={centro}
              r={radio}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${arcoTotal} ${circunferencia}`}
              strokeDashoffset={arcoTotal}
              style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
            />
          </g>

          {/* Score central */}
          <text
            x={centro}
            y={centro - 8}
            textAnchor="middle"
            fontSize="36"
            fontWeight="700"
            fill="#0F172A"
            fontFamily="var(--font-inter, sans-serif)"
          >
            {score}
          </text>
          <text
            x={centro}
            y={centro + 16}
            textAnchor="middle"
            fontSize="12"
            fill="#64748B"
            fontFamily="var(--font-inter, sans-serif)"
          >
            de 1000
          </text>

          {/* Nivel */}
          <rect
            x={centro - 38}
            y={centro + 28}
            width="76"
            height="20"
            rx="10"
            fill={color + "20"}
          />
          <text
            x={centro}
            y={centro + 42}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={color}
            fontFamily="var(--font-inter, sans-serif)"
          >
            {etiqueta.toUpperCase()}
          </text>

          {/* Labels min/max */}
          <text x="18" y={size - 10} fontSize="9" fill="#94A3B8">0</text>
          <text x={size - 28} y={size - 10} fontSize="9" fill="#94A3B8">1000</text>
        </svg>
      </div>

      {/* Breakdown opcional */}
      {mostrarBreakdown && breakdown && (
        <div className="w-full max-w-xs space-y-2">
          {Object.entries({
            "Historial de pagos": breakdown["historial_pagos"] ?? 0,
            "Puntualidad": breakdown["puntualidad"] ?? 0,
            "Ingresos verificados": breakdown["ingresos_verificados"] ?? 0,
            "DICOM / CMF": breakdown["dicom_cmf"] ?? 0,
            "Referencias": breakdown["referencias"] ?? 0,
            "Duración arriendos": breakdown["duracion_arriendos"] ?? 0,
            "Servicios básicos": breakdown["servicios_basicos"] ?? 0,
          }).map(([label, valor]) => {
            const maximo = label === "Historial de pagos" ? 300
              : label === "Ingresos verificados" ? 200
              : label === "Puntualidad" ? 150
              : label === "Servicios básicos" ? 50
              : 100;
            const porcentaje = (valor / maximo) * 100;

            return (
              <div key={label}>
                <div className="flex justify-between text-xs text-[#374151] mb-1">
                  <span>{label}</span>
                  <span className="font-semibold">{valor}/{maximo}</span>
                </div>
                <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${porcentaje}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
