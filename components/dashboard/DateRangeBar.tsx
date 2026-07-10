"use client";

import type { DatePreset } from "@/types";

const PRESETS: DatePreset[] = [
  "Hoy",
  "Últimos 3 días",
  "Últimos 7 días",
  "Procesos abiertos",
  "Todos los procesos",
  "Personalizado",
];

type Props = {
  preset: DatePreset;
  onPresetChange: (p: DatePreset) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onApplyCustomRange: () => void;
  label: string;
};

export function DateRangeBar({
  preset,
  onPresetChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApplyCustomRange,
  label,
}: Props) {
  return (
    <div className="flex items-center gap-3.5 flex-wrap mb-[18px]">
      <div className="flex gap-1.5 flex-wrap">
        {PRESETS.map((p) => (
          <div
            key={p}
            className={`date-chip ${p === preset ? "active" : ""}`}
            onClick={() => onPresetChange(p)}
          >
            {p}
          </div>
        ))}
      </div>
      {preset === "Personalizado" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="field-input !w-auto"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
          <span className="text-[var(--color-text-dimmer)] text-xs">hasta</span>
          <input
            type="date"
            className="field-input !w-auto"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
          <button className="btn-analyze !px-3 !py-1.5" onClick={onApplyCustomRange}>
            Aplicar
          </button>
        </div>
      )}
      <div className="ml-auto text-xs text-[var(--color-text-dimmer)]">{label}</div>
    </div>
  );
}
