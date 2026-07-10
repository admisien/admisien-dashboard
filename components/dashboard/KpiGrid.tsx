import type { DashboardData } from "@/types";

const KPI_ICONS = ["👤", "📋", "🎓", "%"];

function fmt(n: number) {
  return n.toLocaleString("es-CL");
}

export function KpiGrid({ data }: { data: DashboardData }) {
  const kpis = [
    { label: "Leads totales", value: fmt(data.leads), delta: data.deltas.leads },
    { label: "Postulantes", value: fmt(data.postulantes), delta: data.deltas.postulantes },
    { label: "Matriculados", value: fmt(data.matriculados), delta: data.deltas.matriculados },
    { label: "Conv. global", value: `${data.convGlobal}%`, delta: data.deltas.conv },
  ];

  const totalSpend = data.costData.reduce((a, c) => a + c.spend, 0);
  const costPerMat = data.matriculados > 0 ? Math.round(totalSpend / data.matriculados) : 0;
  const closeBenchOk = data.closeDays <= data.benchClose;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-3.5">
        {kpis.map((k, i) => {
          const deltaNum = parseFloat(k.delta);
          const up = deltaNum >= 0;
          return (
            <div className="kpi" key={k.label}>
              <div className="kpi-top">
                <span className="kpi-label">{k.label}</span>
                <div className="kpi-icon">{KPI_ICONS[i]}</div>
              </div>
              <div className="kpi-value">
                {k.value}
                <span className={`delta ${up ? "up" : "down"}`}>
                  {up ? "↗" : "↘"} {Math.abs(deltaNum)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Tiempo prom. de cierre</span>
            <div className="kpi-edit" title="Editar meta para este programa/institución">
              ⚙
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: "20px" }}>
            {data.closeDays.toFixed(1)} días
            {closeBenchOk ? (
              <span className="bench-tag bench-ok">dentro de meta</span>
            ) : (
              <span className="bench-tag bench-low">sobre meta ({data.benchClose}d)</span>
            )}
          </div>
          <div className="text-[11.5px] text-[var(--color-text-dimmer)] mt-1">
            Primer contacto → matrícula
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Costo por matriculado</span>
            <div className="kpi-edit" title="Editar meta para este programa/institución">
              ⚙
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: "20px" }}>
            ${fmt(costPerMat)}
          </div>
          <div className="text-[11.5px] text-[var(--color-text-dimmer)] mt-1">
            Gasto pauta Meta + Google + LinkedIn
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Inversión total del período</span>
            <div className="kpi-edit" title="Editar meta para este programa/institución">
              ⚙
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: "20px" }}>
            ${fmt(totalSpend)}
          </div>
          <div className="text-[11.5px] text-[var(--color-text-dimmer)] mt-1">
            {data.costData.length} canales con pauta activa
          </div>
        </div>
      </div>
    </>
  );
}
