import type { DiagramTemplateId, Subject } from "@/lib/types";

const RULES: Array<{ id: DiagramTemplateId; words: string[] }> = [
  { id: "flowchart", words: ["process", "flow", "then", "next", "step"] },
  { id: "process-arrows", words: ["cycle", "photosynthesis", "respiration", "stages"] },
  { id: "cell-simple", words: ["cell", "nucleus", "membrane", "organelle"] },
  { id: "atom-simple", words: ["atom", "electron", "proton", "nucleus", "orbital"] },
  { id: "circuit-simple", words: ["circuit", "voltage", "current", "resistor"] },
  { id: "force-diagram", words: ["force", "newton", "friction", "acceleration"] },
  { id: "timeline", words: ["century", "timeline", "war", "revolution", "year"] },
  { id: "algorithm-box", words: ["algorithm", "pseudocode", "loop", "complexity"] },
  { id: "water-cycle", words: ["water cycle", "evaporation", "precipitation", "condensation"] },
];

export function selectDiagram(
  text: string,
  subject: Exclude<Subject, "auto">,
  explicit?: DiagramTemplateId,
): DiagramTemplateId | null {
  if (explicit) return explicit;
  const lower = text.toLowerCase();
  let best: DiagramTemplateId | null = null;
  let score = 0;
  for (const rule of RULES) {
    const s = rule.words.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
    if (s > score) {
      score = s;
      best = rule.id;
    }
  }
  if (score < 2) {
    if (subject === "biology") return null;
    if (subject === "history") return "timeline";
    return null;
  }
  return best;
}
