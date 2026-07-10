import type { DashboardData } from "@/types";

function fmt(n: number) {
  return n.toLocaleString("es-CL");
}

export function ChannelPanel({ data }: { data: DashboardData }) {
  const maxChan = Math.max(1, ...data.channelData.map((c) => c.leads));

  return (
    <div className="panel">
      <div className="panel-title">Leads por canal de origen</div>
      <div>
        {data.channelData.map((c) => (
          <div className="prog-row" key={c.key}>
            <div className="prog-name" title={c.name}>
              {c.name}
            </div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${(c.leads / maxChan) * 100}%` }} />
            </div>
            <div className="prog-val">{fmt(c.leads)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
