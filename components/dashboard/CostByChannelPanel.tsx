import type { DashboardData } from "@/types";
import { ManualSpendPanel } from "@/components/dashboard/ManualSpendPanel";

function fmt(n: number) {
  return n.toLocaleString("es-CL");
}

type Props = { data: DashboardData; onSpendSaved: () => void };

export function CostByChannelPanel({ data, onSpendSaved }: Props) {
  return (
    <div className="panel" style={{ gridColumn: "1 / -1" }}>
      <div className="panel-title flex items-center justify-between">
        <span>Costo por canal</span>
      </div>
      <ManualSpendPanel onSaved={onSpendSaved} />
      <div
        className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr] gap-2.5 text-[11.5px] pb-2 mb-2 mt-3.5"
        style={{ color: "var(--color-text-dimmer)", borderBottom: "1px solid var(--color-panel-border-soft)" }}
      >
        <div>CANAL</div>
        <div>LEADS</div>
        <div>INVERSIÓN</div>
        <div>CPL</div>
        <div>ORIGEN DEL DATO</div>
      </div>
      {data.costData.map((c) => (
        <div
          key={c.key}
          className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr] gap-2.5 text-[13px] py-[7px] items-center"
        >
          <div>{c.name}</div>
          <div>{fmt(c.leads)}</div>
          <div>${fmt(c.spend)}</div>
          <div>${fmt(c.cpl)}</div>
          <div
            style={{
              fontSize: "12px",
              color: c.source.includes("Automático") ? "var(--color-green)" : "var(--color-text-dim)",
            }}
          >
            {c.source}
          </div>
        </div>
      ))}
    </div>
  );
}
