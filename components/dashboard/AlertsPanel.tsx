import type { DashboardData } from "@/types";

function fmt(n: number) {
  return n.toLocaleString("es-CL");
}

export function AlertsPanel({ data }: { data: DashboardData }) {
  const alerts: { level: "high" | "mid"; text: string }[] = [
    { level: "high", text: `${fmt(data.uncontacted48h)} leads sin contactar hace +48hs` },
    { level: "mid", text: `Tasa de contacto cayó ${data.contactDrop}% esta semana` },
    {
      level: "mid",
      text: `${data.lowestProg.name}: menor conversión del corte (${data.lowestProg.value}%)`,
    },
  ];

  return (
    <div className="panel">
      <div className="panel-title">Alertas activas</div>
      <div>
        {alerts.map((a, i) => (
          <div className={`alert ${a.level}`} key={i}>
            ⚠️ <span>{a.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
