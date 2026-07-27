import React from 'react';

export type DonutDatum = {
  label: string;
  value: number;
  color: string; // tailwind or hex
};

function arcPath(cx: number, cy: number, r: number, start: number, end: number, innerR: number) {
  const rad = (a: number) => (a - 90) * (Math.PI / 180);
  const sx = cx + r * Math.cos(rad(start));
  const sy = cy + r * Math.sin(rad(start));
  const ex = cx + r * Math.cos(rad(end));
  const ey = cy + r * Math.sin(rad(end));
  const largeArc = end - start <= 180 ? 0 : 1;

  const six = cx + innerR * Math.cos(rad(start));
  const siy = cy + innerR * Math.sin(rad(start));
  const eix = cx + innerR * Math.cos(rad(end));
  const eiy = cy + innerR * Math.sin(rad(end));

  return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey} L ${eix} ${eiy} A ${innerR} ${innerR} 0 ${largeArc} 0 ${six} ${siy} Z`;
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  const rad = (a: number) => (a - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(rad(angle)),
    y: cy + radius * Math.sin(rad(angle)),
  };
}

type Props = {
  data: DonutDatum[];
  size?: number; // px
  thickness?: number; // px
  showLabels?: boolean;
  showLegend?: boolean;
};

const DonutChart: React.FC<Props> = ({
  data,
  size = 260,
  thickness = 44,
  showLabels = true,
  showLegend = true,
}) => {
  const total = Math.max(0, data.reduce((s, d) => s + Math.max(0, d.value), 0));
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const innerR = r - thickness;

  const gapDeg = 2.5;

  let cursor = 0;
  const segments = data.map((d) => {
    const portion = total === 0 ? 0 : (d.value / total) * 360;
    const start = cursor + (portion > 0 ? gapDeg / 2 : 0);
    const end = cursor + portion - (portion > 0 ? gapDeg / 2 : 0);
    cursor = cursor + portion;
    return { d, start, end };
  });

  return (
    <div className="flex flex-col items-center gap-4 min-w-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 overflow-visible">
        <circle cx={cx} cy={cy} r={innerR} fill="rgba(255,255,255,0.92)" />
        {segments.map((s, i) => (
          <path
            key={i}
            d={arcPath(cx, cy, r, s.start, s.end, innerR)}
            fill={s.d.color}
            className="transition-opacity duration-150 hover:opacity-85 cursor-pointer"
          >
            <title>{`${s.d.label}: ${s.d.value}`}</title>
          </path>
        ))}

        {showLabels &&
          segments.map((s, i) => {
            if (total <= 0 || s.end <= s.start) return null;
            const mid = (s.start + s.end) / 2;
            const p0 = polar(cx, cy, r + 2, mid);
            const p1 = polar(cx, cy, r + 18, mid);
            const right = Math.cos(((mid - 90) * Math.PI) / 180) >= 0;
            const p2 = {
              x: p1.x + (right ? 28 : -28),
              y: p1.y,
            };
            const labelX = p2.x + (right ? 6 : -6);

            return (
              <g key={`label-${i}`}>
                <path
                  d={`M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke={s.d.color}
                  strokeWidth={2}
                  opacity={0.65}
                />
                <text
                  x={labelX}
                  y={p2.y}
                  textAnchor={right ? 'start' : 'end'}
                  dominantBaseline="middle"
                  className="fill-slate-600"
                  style={{ fontSize: 12, fontWeight: 600 }}
                >
                  {s.d.label}
                </text>
              </g>
            );
          })}

        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-slate-800 font-semibold">
          {total}
        </text>
      </svg>

      {showLegend && (
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <span className="h-3 w-6 rounded-sm" style={{ backgroundColor: d.color }} />
              <span className="text-slate-600 font-semibold">{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonutChart;
