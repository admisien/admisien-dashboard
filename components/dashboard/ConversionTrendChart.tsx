type Props = { weeks: string[]; convSeries: number[] };

const W = 420;
const H = 230;
const padL = 34;
const padR = 14;
const padB = 30;
const padT = 14;
const GRID_STEPS = [0, 1, 2, 3, 4];

function safeMax(min: number, max: number) {
  return max > min ? max : min + 1;
}

export function ConversionTrendChart({ weeks, convSeries }: Props) {
  const min = Math.min(...convSeries) * 0.85;
  const max = safeMax(min, Math.max(...convSeries) * 1.15);
  const stepX = (W - padL - padR) / (weeks.length - 1 || 1);
  const scaleY = (v: number) => H - padB - ((v - min) / (max - min)) * (H - padB - padT);

  const path = convSeries.map((v, i) => `${i === 0 ? "M" : "L"} ${padL + i * stepX} ${scaleY(v)}`).join(" ");
  const area = `${path} L ${padL + (weeks.length - 1) * stepX} ${H - padB} L ${padL} ${H - padB} Z`;

  return (
    <svg viewBox={`0 0 ${W} 220`} width="100%" height="220">
      <defs>
        <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
        </linearGradient>
      </defs>
      {GRID_STEPS.map((i) => {
        const y = padT + (i / 4) * (H - padB - padT);
        const val = (max - (i / 4) * (max - min)).toFixed(1);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#1c1f2e" strokeWidth={1} />
            <text x={2} y={y + 4} fontSize={8.5} fill="#6b7086">
              {val}%
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#convGrad)" />
      <path d={path} fill="none" stroke="#A78BFA" strokeWidth={2.5} />
      {convSeries.map((v, i) => (
        <circle key={i} cx={padL + i * stepX} cy={scaleY(v)} r={2.8} fill="#A78BFA" />
      ))}
      {weeks.map((l, i) => (
        <text key={l} x={padL + i * stepX} y={H - 8} fontSize={9} fill="#6b7086" textAnchor="middle">
          {l}
        </text>
      ))}
    </svg>
  );
}
