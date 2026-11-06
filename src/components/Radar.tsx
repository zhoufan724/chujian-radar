import type { RadarItem } from '../types';

export function Radar({ items }: { items: RadarItem[] }) {
  const C = 220;
  const R = 132;
  const LABEL_R = 168;
  const n = items.length;
  const ang = (i: number) => -Math.PI / 2 + (i * Math.PI * 2) / n;
  const pt = (i: number, r: number) => ({
    x: C + Math.cos(ang(i)) * r,
    y: C + Math.sin(ang(i)) * r,
  });

  const poly = items
    .map((it, i) => {
      const p = pt(i, (Math.max(0, Math.min(100, it.score)) / 100) * R);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 440 440" className="radar-svg" role="img" aria-label="印象雷达图">
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D9A55B" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#E2654A" stopOpacity="0.13" />
        </linearGradient>
        <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0C987" />
          <stop offset="100%" stopColor="#D9A55B" />
        </linearGradient>
      </defs>

      {[1, 2, 3, 4].map((k) => {
        const rr = (R * k) / 4;
        const pts = items.map((_, i) => { const p = pt(i, rr); return `${p.x},${p.y}`; }).join(' ');
        return (
          <polygon
            key={k}
            points={pts}
            fill="none"
            stroke={k === 4 ? 'rgba(244,241,234,0.16)' : 'rgba(244,241,234,0.065)'}
            strokeWidth={k === 4 ? 1.2 : 1}
          />
        );
      })}

      {items.map((_, i) => {
        const p = pt(i, R);
        return (
          <line key={i} x1={C} y1={C} x2={p.x} y2={p.y} stroke="rgba(244,241,234,0.07)" strokeWidth="1" />
        );
      })}

      <polygon
        className="radar-shape"
        points={poly}
        fill="url(#radarFill)"
        stroke="url(#radarStroke)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {items.map((it, i) => {
        const p = pt(i, (it.score / 100) * R);
        return <circle key={i} cx={p.x} cy={p.y} r="2.8" fill="#F4F1EA" />;
      })}

      {items.map((it, i) => {
        const p = pt(i, LABEL_R);
        const cos = Math.cos(ang(i));
        const anchor = Math.abs(cos) < 0.25 ? 'middle' : cos > 0 ? 'start' : 'end';
        return (
          <g key={i}>
            <text x={p.x} y={p.y - 4} textAnchor={anchor} className="radar-label">
              {it.label}
            </text>
            <text x={p.x} y={p.y + 15} textAnchor={anchor} className="radar-score">
              {it.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
