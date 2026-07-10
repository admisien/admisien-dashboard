import type { DashboardData } from "@/types";

function fmt(n: number) {
  return n.toLocaleString("es-CL");
}

export function FunnelPanel({ data }: { data: DashboardData }) {
  const funnelData = [
    { label: "Leads", value: data.leads, warn: false },
    { label: "Contactados", value: data.contacted, warn: false },
    { label: "Postulantes", value: data.postulantes, warn: true },
    { label: "Matriculados", value: data.matriculados, warn: false },
  ];
  const maxV = data.leads || 1;

  return (
    <div className="panel">
      <div className="panel-title">Embudo de admisión</div>
      <div>
        {funnelData.map((f) => (
          <div className="funnel-row" key={f.label}>
            <div className="funnel-label">
              <span>{f.label}</span>
              <span>
                <b>{fmt(f.value)}</b>
                {f.warn && <span className="tag-warn">↓ mayor caída</span>}
              </span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${Math.max(6, (f.value / maxV) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
