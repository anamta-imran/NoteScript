import type { DiagramStyle, DiagramTemplateId, NoteBlock } from "@/lib/types";

const KEYWORD_TEMPLATES: Array<{ words: string[]; id: DiagramTemplateId }> = [
  { words: ["water cycle", "evaporation", "condensation", "precipitation", "collection"], id: "water-cycle" },
  { words: ["photosynthesis", "respiration", "cycle", "stages"], id: "process-arrows" },
  { words: ["cell", "nucleus", "membrane"], id: "cell-simple" },
  { words: ["atom", "electron", "proton"], id: "atom-simple" },
  { words: ["circuit", "voltage", "resistor"], id: "circuit-simple" },
  { words: ["force", "newton", "friction"], id: "force-diagram" },
  { words: ["timeline", "history", "century"], id: "timeline" },
  { words: ["algorithm", "steps", "process", "flow"], id: "flowchart" },
];

export function pickDiagramFromPrompt(
  prompt: string,
  explicit?: DiagramTemplateId,
): DiagramTemplateId {
  if (explicit) return explicit;
  const lower = prompt.toLowerCase();
  let best: DiagramTemplateId = "blank-labeled";
  let score = 0;
  for (const rule of KEYWORD_TEMPLATES) {
    const s = rule.words.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
    if (s > score) {
      score = s;
      best = rule.id;
    }
  }
  return best;
}

export function buildDiagramBlocks(opts: {
  prompt: string;
  style: DiagramStyle;
  templateId?: DiagramTemplateId;
  fromImage?: boolean;
}): NoteBlock[] {
  const templateId = pickDiagramFromPrompt(opts.prompt, opts.templateId);
  const labels = extractLabelHints(opts.prompt);
  const caption = opts.fromImage
    ? "Handwritten study sketch based on your reference (structure preserved, not a pixel copy)."
    : `Study diagram · ${opts.style}`;

  const blocks: NoteBlock[] = [
    { type: "heading", level: 1, text: titleFromPrompt(opts.prompt) },
    {
      type: "diagram",
      templateId,
      caption,
      style: opts.style,
    },
  ];

  if (labels.length) {
    blocks.push({
      type: "bullets",
      items: labels.map((l) => `Label: ${l}`),
    });
  }

  blocks.push({
    type: "callout",
    kind: "important",
    text: "This is a rule-based educational sketch template — not generative AI art.",
  });

  return blocks;
}

function titleFromPrompt(prompt: string): string {
  const cleaned = prompt.trim().replace(/^draw\s+/i, "").slice(0, 80);
  return cleaned || "Study diagram";
}

function extractLabelHints(prompt: string): string[] {
  const parts = prompt
    .split(/,| and | with |→|->|;|\./i)
    .map((p) => p.trim())
    .filter((p) => p.length > 2 && p.length < 40)
    .slice(0, 8);
  return [...new Set(parts)];
}
