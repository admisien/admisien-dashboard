type Props = { weeks: string[]; leadsSeries: number[]; matSeries: number[] };

const W = 420;
const H = 230;
const padL = 34;
const padR = 34;
const padB = 30;
const padT = 14;
const GRID_STEPS = [0, 1, 2, 3, 4];

function safeMax(min: number, max: number) {
  return max > min ? max : min + 1;
}

export function DualLineChart({ weeks, leadsSeries, matSeries }: Props) {
  const minL = Math.min(...leadsSeries) * 0.9;
  const maxL = safeMax(minL, Math.max(...leadsSeries) * 1.08);
  const minM = Math.min(...matSeries) * 0.85;
  const maxM = safeMax(minM, Math.max(...matSeries) * 1.1);
  const stepX = (W - padL - padR) / (weeks.length - 1 || 1);

  const scaleYL = (v: number) => H - padB - ((v - minL) / (maxL - minL)) * (H - padB - padT);
  const scaleYM = (v: number) => H - padB - ((v - minM) / (maxM - minM)) * (H - padB - padT);

  const pathL = leadsSeries
    .map((v, i) => `${i === 0 ? "M" : "L"} ${padL + i * stepX} ${scaleYL(v)}`)
    .join(" ");
  const pathM = matSeries
    .map((v, i) => `${i === 0 ? "M" : "L"} ${padL + i * stepX} ${scaleYM(v)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} 220`} width="100%" height="220">
      {GRID_STEPS.map((i) => {
        const y = padT + (i / 4) * (H - padB - padT);
        return <line key={i} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#1c1f2e" strokeWidth={1} />;
      })}
      <path d={pathL} fill="none" stroke="#6366F1" strokeWidth={2.5} />
      <path d={pathM} fill="none" stroke="#34D399" strokeWidth={2.5} />
      {GRID_STEPS.map((i) => (
        <text key={`l${i}`} x={2} y={padT + (i / 4) * (H - padB - padT) + 4} fontSize={8.5} fill="#6366F1">
          {Math.round(maxL - (i / 4) * (maxL - minL))}
        </text>
      ))}
      {GRID_STEPS.map((i) => (
        <text
          key={`r${i}`}
          x={W - 30}
          y={padT + (i / 4) * (H - padB - padT) + 4}
          fontSize={8.5}
          fill="#34D399"
        >
          {Math.round(maxM - (i / 4) * (maxM - minM))}
        </text>
      ))}
      {weeks.map((l, i) => (
        <text key={l} x={padL + i * stepX} y={H - 8} fontSize={9} fill="#6b7086" textAnchor="middle">
          {l}
        </text>
      ))}
      <text x={padL} y={10} fontSize={9} fill="#6366F1">
        Leads (eje izq.)
      </text>
      <text x={W - 100} y={10} fontSize={9} fill="#34D399">
        Matriculados (eje der.)
      </text>
    </svg>
  );
}
