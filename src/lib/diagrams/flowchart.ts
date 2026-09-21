import { sanitizeDiagramText } from "./types";

export type FlowNodeKind = "start" | "process" | "decision" | "end";

export type FlowNode = {
  id: string;
  kind: FlowNodeKind;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type FlowEdge = { from: string; to: string };

export type FlowchartLayout = {
  viewBox: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  orientation: "vertical" | "horizontal";
};

/** Deterministic flowchart from a topic / step list — no AI. */
export function buildFlowchartLayout(
  topic: string,
  orientation: "vertical" | "horizontal" = "vertical",
  explicitSteps?: string[],
): FlowchartLayout {
  const steps =
    explicitSteps && explicitSteps.length >= 2
      ? explicitSteps.map((s) => sanitizeDiagramText(s, 40)).filter(Boolean)
      : inferSteps(topic);

  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  const gap = orientation === "vertical" ? 70 : 40;
  const boxW = orientation === "vertical" ? 160 : 120;
  const boxH = 44;

  const start: FlowNode = {
    id: "n0",
    kind: "start",
    text: "Start",
    x: orientation === "vertical" ? 160 : 20,
    y: orientation === "vertical" ? 20 : 100,
    w: 100,
    h: 36,
  };
  nodes.push(start);

  steps.forEach((text, i) => {
    const kind: FlowNodeKind = /decide|if |check|yes\/no|\?/i.test(text) ? "decision" : "process";
    const prev = nodes[nodes.length - 1];
    const node: FlowNode = {
      id: `n${i + 1}`,
      kind,
      text,
      x:
        orientation === "vertical"
          ? 130
          : prev.x + prev.w + gap,
      y:
        orientation === "vertical"
          ? prev.y + prev.h + gap
          : kind === "decision"
            ? 80
            : 100,
      w: boxW,
      h: boxH,
    };
    nodes.push(node);
    edges.push({ from: prev.id, to: node.id });
  });

  const last = nodes[nodes.length - 1];
  const end: FlowNode = {
    id: "end",
    kind: "end",
    text: "End",
    x: orientation === "vertical" ? 160 : last.x + last.w + gap,
    y: orientation === "vertical" ? last.y + last.h + gap : 100,
    w: 100,
    h: 36,
  };
  nodes.push(end);
  edges.push({ from: last.id, to: end.id });

  const maxX = Math.max(...nodes.map((n) => n.x + n.w)) + 40;
  const maxY = Math.max(...nodes.map((n) => n.y + n.h)) + 40;

  return {
    viewBox: `0 0 ${Math.max(maxX, 360)} ${Math.max(maxY, 280)}`,
    nodes,
    edges,
    orientation,
  };
}

function inferSteps(topic: string): string[] {
  const t = sanitizeDiagramText(topic, 120).toLowerCase();
  if (!t) return ["Step 1", "Step 2", "Step 3"];

  if (t.includes("photosynthesis")) {
    return ["Absorb light", "Split water", "Fix CO₂", "Make glucose"];
  }
  if (t.includes("water cycle")) {
    return ["Evaporation", "Condensation", "Precipitation", "Collection"];
  }
  if (t.includes("digest")) {
    return ["Ingestion", "Digestion", "Absorption", "Egestion"];
  }
  if (t.includes("login") || t.includes("sign in")) {
    return ["Enter credentials", "Validate", "Create session", "Open dashboard"];
  }
  if (t.includes("software") || t.includes("development")) {
    return ["Plan", "Design", "Build", "Test", "Deploy"];
  }

  // Split on arrows / commas / "then"
  const parts = t
    .split(/\s*(?:→|->|then|,|;|\n)\s*/i)
    .map((p) => sanitizeDiagramText(p, 36))
    .filter((p) => p.length > 1)
    .slice(0, 6);

  if (parts.length >= 2) return parts.map(capitalize);

  return ["Begin process", capitalize(t.slice(0, 36) || "Main step"), "Finish"];
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
