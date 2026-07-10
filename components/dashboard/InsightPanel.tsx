"use client";

import { useState } from "react";
import type { DashboardData } from "@/types";

function fmt(n: number) {
  return n.toLocaleString("es-CL");
}

type Props = {
  data: DashboardData;
  institucion: string;
  programLabel: string;
  procesoLabel: string;
};

// Fase 4: mock igual al del prototipo (setTimeout + texto armado con los datos
// ya calculados). Fase 5 lo reemplaza por una llamada real a la API de Claude.
export function InsightPanel({ data, institucion, programLabel, procesoLabel }: Props) {
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string | null>(null);

  function runAnalysis() {
    setLoading(true);
    setHtml(null);

    setTimeout(() => {
      const convDelta = parseFloat(data.deltas.conv);
      const convTrend = convDelta >= 0 ? "una mejora" : "una caída";
      const worseProg = data.lowestProg.name;
      const bestProg = data.topProg.name;
      const progText =
        programLabel === "Todos los programas" || programLabel.includes("programas")
          ? "los programas seleccionados"
          : programLabel;

      setHtml(`
        <p>En <b>${progText}</b> de <b>${institucion}</b> (${procesoLabel}), la conversión global muestra ${convTrend} de ${Math.abs(convDelta)}% respecto al período anterior.</p>
        <ul>
          <li><b>Riesgo principal:</b> ${fmt(data.uncontacted48h)} leads llevan más de 48 horas sin contacto. Esto explica gran parte de la brecha entre leads y postulantes.</li>
          <li><b>Programa más débil:</b> ${worseProg} tiene la conversión más baja del corte (${data.lowestProg.value}%), mientras que ${bestProg} lidera con ${data.topProg.value}%. Vale la pena revisar si el guion de seguimiento es el mismo para ambos.</li>
          <li><b>Recomendación:</b> Priorizar el contacto de los leads pendientes de ${worseProg} en las próximas 24 horas; ese grupo concentra el mayor riesgo de fuga antes de postulación.</li>
        </ul>
      `);
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="insight-panel">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-[26px] h-[26px] rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-[13px]">
            ✦
          </div>
          <div>
            <div className="text-[13px] font-bold">Insight de la semana</div>
            <div className="text-[11.5px] text-[var(--color-text-dim)]">
              Generado a partir de los datos del corte seleccionado
            </div>
          </div>
        </div>
        <button className="btn-analyze" onClick={runAnalysis} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" /> Analizando…
            </>
          ) : (
            "Analizar esta semana"
          )}
        </button>
      </div>
      <div className="text-[13.5px] leading-relaxed" style={{ color: "#E5E5EF" }}>
        {html ? (
          <div className="[&_ul]:mt-2 [&_ul]:pl-[18px] [&_li]:mb-1.5" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <span className="italic text-[13px]" style={{ color: "var(--color-text-dimmer)" }}>
            Aún no se ha generado un análisis para este corte. Presiona &quot;Analizar esta semana&quot;
            para obtener observaciones y recomendaciones.
          </span>
        )}
      </div>
    </div>
  );
}
