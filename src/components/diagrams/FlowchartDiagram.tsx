import { buildFlowchartLayout } from "@/lib/diagrams/flowchart";
import type { FlowchartLayout } from "@/lib/diagrams/flowchart";
import { sanitizeDiagramText } from "@/lib/diagrams/types";

export function FlowchartDiagram({
  topic,
  orientation = "vertical",
  steps,
  layout: provided,
  className,
}: {
  topic?: string;
  orientation?: "vertical" | "horizontal";
  steps?: string[];
  layout?: FlowchartLayout;
  className?: string;
}) {
  const layout =
    provided ||
    buildFlowchartLayout(sanitizeDiagramText(topic || "Process", 80), orientation, steps);

  const byId = Object.fromEntries(layout.nodes.map((n) => [n.id, n]));

  return (
    <svg
      viewBox={layout.viewBox}
      className={className || "h-auto w-full max-h-[70vh]"}
      role="img"
      aria-label={`Flowchart: ${topic || "process"}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100%" height="100%" fill="#ffffff" />
      <defs>
        <marker
          id="flow-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="#1f2937" />
        </marker>
      </defs>
      {layout.edges.map((e, i) => {
        const a = byId[e.from];
        const b = byId[e.to];
        if (!a || !b) return null;
        const x1 = a.x + a.w / 2;
        const y1 = a.y + a.h;
        const x2 = b.x + b.w / 2;
        const y2 = b.y;
        const vertical = Math.abs(y2 - y1) >= Math.abs(x2 - x1);
        if (vertical) {
          return (
            <path
              key={i}
              d={`M${x1} ${y1} L${x1} ${y2 - 4}`}
              stroke="#1f2937"
              strokeWidth={1.5}
              fill="none"
              markerEnd="url(#flow-arrow)"
            />
          );
        }
        return (
          <path
            key={i}
            d={`M${a.x + a.w} ${a.y + a.h / 2} L${b.x - 4} ${b.y + b.h / 2}`}
            stroke="#1f2937"
            strokeWidth={1.5}
            fill="none"
            markerEnd="url(#flow-arrow)"
          />
        );
      })}
      {layout.nodes.map((n) => {
        const cx = n.x + n.w / 2;
        const cy = n.y + n.h / 2;
        if (n.kind === "start" || n.kind === "end") {
          return (
            <g key={n.id}>
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={n.h}
                rx={n.h / 2}
                fill={n.kind === "start" ? "#dcfce7" : "#fee2e2"}
                stroke="#1f2937"
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fill="#111827"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {n.text}
              </text>
            </g>
          );
        }
        if (n.kind === "decision") {
          const midX = n.x + n.w / 2;
          const midY = n.y + n.h / 2;
          const hw = n.w / 2;
          const hh = n.h / 2 + 8;
          return (
            <g key={n.id}>
              <polygon
                points={`${midX},${midY - hh} ${midX + hw},${midY} ${midX},${midY + hh} ${midX - hw},${midY}`}
                fill="#fef9c3"
                stroke="#1f2937"
                strokeWidth={1.5}
              />
              <text
                x={midX}
                y={midY + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                fill="#111827"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {n.text}
              </text>
            </g>
          );
        }
        return (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx={6}
              fill="#eff6ff"
              stroke="#1f2937"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fill="#111827"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {n.text.length > 22 ? `${n.text.slice(0, 20)}…` : n.text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
