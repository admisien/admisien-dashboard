import type { DashboardData } from "@/types";

export function ProgramConversionPanel({ data }: { data: DashboardData }) {
  const maxProg = Math.max(1, ...data.progConv.map((p) => p.value));

  return (
    <div className="panel">
      <div className="panel-title">Conversión por programa</div>
      <div>
        {data.progConv.map((p) => (
          <div className="prog-row" key={p.name}>
            <div className="prog-name" title={p.name}>
              {p.name}
            </div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${(p.value / maxProg) * 100}%` }} />
            </div>
            <div className="prog-val">{p.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
