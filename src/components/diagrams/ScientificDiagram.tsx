import type { DiagramColorMode, DiagramTemplateId } from "@/lib/types";
import { getScientificTemplate } from "@/lib/diagrams/registry";
import { palette } from "@/lib/diagrams/types";
import { LabelLayer } from "./LabelLayer";
import { ScientificBody } from "./ScientificBodies";

export function ScientificDiagram({
  templateId,
  colorMode = "color",
  labelled = true,
  className,
  title,
}: {
  templateId: DiagramTemplateId;
  colorMode?: DiagramColorMode;
  labelled?: boolean;
  className?: string;
  title?: string;
}) {
  const def = getScientificTemplate(templateId);
  if (!def) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted">
        Diagram template unavailable.
      </div>
    );
  }
  const p = palette(colorMode);

  return (
    <svg
      viewBox={def.viewBox}
      className={className || "h-auto w-full max-h-[70vh]"}
      role="img"
      aria-label={title || def.title}
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
    >
      <rect width="100%" height="100%" fill={p.bg} />
      <ScientificBody id={templateId} p={p} />
      <LabelLayer labels={def.labels} palette={p} show={labelled} />
      <text
        x={12}
        y={18}
        fill={p.text}
        fontSize={11}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        opacity={0.7}
      >
        {def.title}
        {colourSuffix(colorMode, labelled)}
      </text>
    </svg>
  );
}

function colourSuffix(mode: DiagramColorMode, labelled: boolean) {
  const a = mode === "bw" ? " · B&W" : " · Color";
  const b = labelled ? " · Labelled" : " · Unlabelled";
  return `${a}${b}`;
}
