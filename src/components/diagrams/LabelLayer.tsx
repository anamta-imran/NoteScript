import type { DiagramLabel, ScientificPalette } from "@/lib/diagrams/types";

export function LabelLayer({
  labels,
  palette: p,
  show,
}: {
  labels: DiagramLabel[];
  palette: ScientificPalette;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <g className="diagram-labels" aria-hidden={false}>
      {labels.map((l) => (
        <g key={l.id}>
          <line
            x1={l.x}
            y1={l.y}
            x2={l.lx}
            y2={l.ly}
            stroke={p.leader}
            strokeWidth={1.25}
          />
          <circle cx={l.x} cy={l.y} r={2.5} fill={p.outline} />
          <text
            x={l.lx}
            y={l.ly}
            fill={p.text}
            fontSize={12}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight={500}
            dominantBaseline="middle"
            textAnchor={l.lx < l.x ? "end" : "start"}
          >
            {l.text}
          </text>
        </g>
      ))}
    </g>
  );
}
