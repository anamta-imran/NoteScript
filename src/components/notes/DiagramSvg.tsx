import type { DiagramColorMode, DiagramTemplateId } from "@/lib/types";
import { FlowchartDiagram } from "@/components/diagrams/FlowchartDiagram";
import { ScientificDiagram } from "@/components/diagrams/ScientificDiagram";
import { getScientificTemplate } from "@/lib/diagrams/registry";

const LEGACY_COMMON = { viewBox: "0 0 320 160", className: "h-40 w-full" };

export function DiagramSvg({
  id,
  colorMode = "color",
  labelled = true,
  caption,
  flowchartTopic,
  flowchartSteps,
}: {
  id: DiagramTemplateId;
  colorMode?: DiagramColorMode;
  labelled?: boolean;
  caption?: string;
  flowchartTopic?: string;
  flowchartSteps?: string[];
}) {
  if (getScientificTemplate(id)) {
    return (
      <ScientificDiagram
        templateId={id}
        colorMode={colorMode}
        labelled={labelled}
        className="h-auto w-full max-h-[70vh]"
      />
    );
  }

  if (id === "flowchart") {
    return (
      <FlowchartDiagram
        topic={flowchartTopic || caption || "Process"}
        steps={flowchartSteps}
        className="h-auto w-full max-h-[70vh]"
      />
    );
  }

  return <LegacyDiagramSvg id={id} />;
}

function LegacyDiagramSvg({ id }: { id: DiagramTemplateId }) {
  const common = LEGACY_COMMON;
  switch (id) {
    case "process-arrows":
      return (
        <svg {...common} role="img" aria-label="Process arrows">
          {["Input", "Change", "Output"].map((t, i) => (
            <g key={t} transform={`translate(${20 + i * 100} 50)`}>
              <polygon points="0,20 70,0 70,60 0,40" fill="#fffdf9" stroke="#1f2937" />
              <text x="36" y="36" textAnchor="middle" fontSize="11">
                {t}
              </text>
            </g>
          ))}
        </svg>
      );
    case "cell-simple":
      return (
        <svg {...common} role="img" aria-label="Simple cell">
          <ellipse cx="160" cy="80" rx="90" ry="55" fill="#f3fbe8" stroke="#5c8a4d" />
          <circle cx="160" cy="80" r="22" fill="#fecaca" stroke="#1f2937" />
          <text x="160" y="84" textAnchor="middle" fontSize="10">
            nucleus
          </text>
          <text x="100" y="70" fontSize="10">
            membrane
          </text>
        </svg>
      );
    case "atom-simple":
      return (
        <svg {...common} role="img" aria-label="Simple atom">
          <circle cx="160" cy="80" r="10" fill="#1f2937" />
          <ellipse cx="160" cy="80" rx="70" ry="28" fill="none" stroke="#1f2937" />
          <ellipse
            cx="160"
            cy="80"
            rx="28"
            ry="70"
            fill="none"
            stroke="#6b7280"
            transform="rotate(30 160 80)"
          />
          <circle cx="230" cy="80" r="6" fill="#4b5563" />
        </svg>
      );
    case "circuit-simple":
      return (
        <svg {...common} role="img" aria-label="Simple circuit">
          <rect x="40" y="70" width="28" height="18" fill="none" stroke="#2b2a28" />
          <path d="M20 79 H40 M68 79 H140 M180 79 H300" fill="none" stroke="#2b2a28" />
          <path d="M140 79 l10-12 10 24 10-24 10 12" fill="none" stroke="#1f2937" />
          <text x="48" y="64" fontSize="10">
            cell
          </text>
          <text x="148" y="110" fontSize="10">
            resistor
          </text>
        </svg>
      );
    case "force-diagram":
      return (
        <svg {...common} role="img" aria-label="Force diagram">
          <rect x="140" y="60" width="40" height="40" fill="#fff" stroke="#2b2a28" />
          <path d="M160 60 L160 24" stroke="#1f2937" />
          <path d="M180 80 L220 80" stroke="#3d7a5a" />
          <text x="164" y="20" fontSize="10">
            N
          </text>
          <text x="224" y="84" fontSize="10">
            F
          </text>
        </svg>
      );
    case "timeline":
      return (
        <svg {...common} role="img" aria-label="Timeline">
          <path d="M20 80 H300" stroke="#1f2937" />
          {[40, 120, 200, 280].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy="80" r="6" fill="#1f2937" />
              <text x={x} y="110" textAnchor="middle" fontSize="10">
                Event {i + 1}
              </text>
            </g>
          ))}
        </svg>
      );
    case "algorithm-box":
      return (
        <svg {...common} role="img" aria-label="Algorithm steps">
          <rect x="70" y="20" width="180" height="120" rx="8" fill="#fffdf9" stroke="#1f2937" />
          <text x="160" y="48" textAnchor="middle" fontSize="12">
            Input → Process
          </text>
          <text x="160" y="72" textAnchor="middle" fontSize="12">
            Repeat until done
          </text>
          <text x="160" y="96" textAnchor="middle" fontSize="12">
            Return result
          </text>
        </svg>
      );
    case "water-cycle":
      return (
        <svg {...common} role="img" aria-label="Water cycle">
          <ellipse cx="160" cy="130" rx="100" ry="18" fill="#dbeafe" stroke="#3b82f6" />
          <text x="160" y="134" textAnchor="middle" fontSize="10">
            Collection
          </text>
          <path d="M80 120 Q60 70 100 50" fill="none" stroke="#1f2937" strokeDasharray="4 3" />
          <text x="50" y="80" fontSize="10">
            Evaporation
          </text>
          <ellipse cx="160" cy="35" rx="50" ry="18" fill="#e5e7eb" stroke="#6b7280" />
          <text x="160" y="39" textAnchor="middle" fontSize="10">
            Condensation
          </text>
          <path d="M210 50 Q240 90 220 120" fill="none" stroke="#3b82f6" />
          <text x="230" y="90" fontSize="10">
            Precipitation
          </text>
        </svg>
      );
    case "blank-labeled":
    default:
      return (
        <svg {...common} role="img" aria-label="Labeled study sketch">
          <rect
            x="40"
            y="30"
            width="240"
            height="100"
            rx="10"
            fill="#fffdf9"
            stroke="#1f2937"
            strokeDasharray="6 4"
          />
          <circle cx="100" cy="80" r="22" fill="#fecaca" stroke="#1f2937" />
          <path d="M122 80 H180" stroke="#1f2937" />
          <text x="190" y="84" fontSize="11">
            Main idea
          </text>
          <text x="160" y="50" textAnchor="middle" fontSize="11">
            Study sketch
          </text>
        </svg>
      );
  }
}
