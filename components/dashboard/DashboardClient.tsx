"use client";

import { useEffect, useMemo, useState } from "react";
import type { Cadencia, DashboardData, DatePreset, ProgramaConfig } from "@/types";
import { ProgramMultiSelect } from "@/components/dashboard/ProgramMultiSelect";
import { ProcessSelect, type ProcessOption } from "@/components/dashboard/ProcessSelect";
import { DateRangeBar } from "@/components/dashboard/DateRangeBar";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { InsightPanel } from "@/components/dashboard/InsightPanel";
import { FunnelPanel } from "@/components/dashboard/FunnelPanel";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { ProgramConversionPanel } from "@/components/dashboard/ProgramConversionPanel";
import { ChannelPanel } from "@/components/dashboard/ChannelPanel";
import { DualLineChart } from "@/components/dashboard/DualLineChart";
import { ConversionTrendChart } from "@/components/dashboard/ConversionTrendChart";
import { CostByChannelPanel } from "@/components/dashboard/CostByChannelPanel";

const ALL_PROGRAMS = "Todos los programas";

type Props = {
  institucion: string;
  programsConfig: ProgramaConfig[];
};

function computeDateLabel(preset: DatePreset, appliedFrom: string, appliedTo: string): string {
  if (preset === "Procesos abiertos") return "Solo procesos que siguen matriculando";
  if (preset === "Todos los procesos") return "Histórico completo (abiertos + cerrados)";
  if (preset === "Personalizado") {
    return appliedFrom && appliedTo ? `Del ${appliedFrom} al ${appliedTo}` : "Selecciona ambas fechas";
  }
  const today = new Date();
  const from = new Date(today);
  if (preset === "Últimos 3 días") from.setDate(today.getDate() - 3);
  if (preset === "Últimos 7 días") from.setDate(today.getDate() - 7);
  const fmtDate = (d: Date) => d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
  return `Del ${fmtDate(from)} al ${fmtDate(today)}`;
}

export function DashboardClient({ institucion, programsConfig }: Props) {
  const programs = useMemo(() => [...new Set(programsConfig.map((p) => p.programa))], [programsConfig]);

  const cadenceByProgram = useMemo(() => {
    const map: Record<string, Cadencia> = {};
    programsConfig.forEach((p) => {
      map[p.programa] = p.cadencia;
    });
    return map;
  }, [programsConfig]);

  const processesByProgram = useMemo(() => {
    const map: Record<string, ProcessOption[]> = {};
    programsConfig.forEach((p) => {
      if (!map[p.programa]) map[p.programa] = [];
      map[p.programa].push({ name: p.nombre_proceso, closed: p.cerrado });
    });
    // más reciente primero, igual que el prototipo (fecha_inicio desc)
    Object.keys(map).forEach((programa) => {
      const withDates = programsConfig.filter((p) => p.programa === programa);
      map[programa] = [...map[programa]].sort((a, b) => {
        const da = withDates.find((p) => p.nombre_proceso === a.name)?.fecha_inicio.getTime() ?? 0;
        const db = withDates.find((p) => p.nombre_proceso === b.name)?.fecha_inicio.getTime() ?? 0;
        return db - da;
      });
    });
    return map;
  }, [programsConfig]);

  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([ALL_PROGRAMS]);
  const [selectedProceso, setSelectedProceso] = useState("");
  const [preset, setPreset] = useState<DatePreset>("Procesos abiertos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const specificSelected = selectedPrograms.filter((p) => p !== ALL_PROGRAMS);
  const scopeIsAggregate = preset === "Procesos abiertos" || preset === "Todos los procesos";

  let showProcessSelect = false;
  let processOptions: ProcessOption[] = [];
  if (specificSelected.length > 0 && !scopeIsAggregate) {
    const cadences = new Set(specificSelected.map((p) => cadenceByProgram[p]));
    if (specificSelected.length === 1 || cadences.size === 1) {
      showProcessSelect = true;
      processOptions = processesByProgram[specificSelected[0]] ?? [];
    }
  }

  // Selecciona por defecto el primer proceso abierto (o el primero de la lista) cuando
  // el selector pasa a estar visible o cambia la lista de opciones disponibles.
  useEffect(() => {
    if (!showProcessSelect) {
      if (selectedProceso !== "") setSelectedProceso("");
      return;
    }
    const stillValid = processOptions.some((p) => p.name === selectedProceso);
    if (!stillValid) {
      const openOne = processOptions.find((p) => !p.closed);
      setSelectedProceso(openOne?.name ?? processOptions[0]?.name ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProcessSelect, JSON.stringify(processOptions)]);

  useEffect(() => {
    if (preset === "Personalizado" && (!appliedFrom || !appliedTo)) {
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("programas", selectedPrograms.join(","));
    if (showProcessSelect && selectedProceso) params.set("proceso", selectedProceso);
    params.set("preset", preset);
    if (preset === "Personalizado") {
      params.set("dateFrom", appliedFrom);
      params.set("dateTo", appliedTo);
    }

    fetch(`/api/dashboard?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Error ${res.status}`);
        }
        return res.json();
      })
      .then((json: DashboardData) => setData(json))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Error desconocido");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [selectedPrograms, selectedProceso, showProcessSelect, preset, appliedFrom, appliedTo, refreshKey]);

  const dateLabel = computeDateLabel(preset, appliedFrom, appliedTo);

  const programLabel = selectedPrograms.includes(ALL_PROGRAMS)
    ? ALL_PROGRAMS
    : selectedPrograms.length === 1
      ? selectedPrograms[0]
      : `${selectedPrograms.length} programas seleccionados`;

  const procesoLabel = showProcessSelect ? selectedProceso : dateLabel;

  return (
    <>
      <div className="flex items-center gap-2.5 flex-wrap mb-4">
        <ProgramMultiSelect
          programs={programs}
          cadenceByProgram={cadenceByProgram}
          selected={selectedPrograms}
          onChange={setSelectedPrograms}
        />
        {showProcessSelect && (
          <ProcessSelect processes={processOptions} value={selectedProceso} onChange={setSelectedProceso} />
        )}
      </div>

      <DateRangeBar
        preset={preset}
        onPresetChange={setPreset}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onApplyCustomRange={() => {
          setAppliedFrom(dateFrom);
          setAppliedTo(dateTo);
        }}
        label={dateLabel}
      />

      {error && (
        <div className="panel mb-3.5" style={{ borderColor: "var(--color-red)" }}>
          <p className="text-sm" style={{ color: "var(--color-red)" }}>
            No se pudo cargar el dashboard: {error}
          </p>
        </div>
      )}

      {!data && loading && (
        <div className="panel mb-3.5">
          <p className="text-sm text-[var(--color-text-dim)]">Cargando datos…</p>
        </div>
      )}

      {data && (
        <div style={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s" }}>
          <KpiGrid data={data} />

          <InsightPanel
            key={JSON.stringify({ selectedPrograms, selectedProceso, preset, appliedFrom, appliedTo })}
            data={data}
            institucion={institucion}
            programLabel={programLabel}
            procesoLabel={procesoLabel}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3.5 mb-3.5">
            <FunnelPanel data={data} />
            <AlertsPanel data={data} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3.5 mb-3.5">
            <ProgramConversionPanel data={data} />
            <ChannelPanel data={data} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5">
            <div className="panel">
              <div className="panel-title">Leads vs. matriculados (escalas independientes)</div>
              <DualLineChart weeks={data.weeks} leadsSeries={data.leadsSeries} matSeries={data.matSeries} />
            </div>
            <div className="panel">
              <div className="panel-title">Tendencia de tasa de conversión</div>
              <ConversionTrendChart weeks={data.weeks} convSeries={data.convSeries} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 mb-3.5">
            <CostByChannelPanel data={data} onSpendSaved={() => setRefreshKey((k) => k + 1)} />
          </div>
        </div>
      )}

      <div className="text-center text-[11.5px] text-[var(--color-text-dimmer)] mt-4">
        Datos sincronizados desde Google Sheets · Admisien
      </div>
    </>
  );
}
