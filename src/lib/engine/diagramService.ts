import type {
  DiagramColorMode,
  DiagramKind,
  DiagramStyle,
  DiagramTemplateId,
  NoteBlock,
} from "@/lib/types";
import { AppError } from "@/lib/errors";
import { getScientificTemplate } from "@/lib/diagrams/registry";
import { matchScientificTopic } from "@/lib/diagrams/matcher";
import { sanitizeDiagramText } from "@/lib/diagrams/types";

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
  kind?: DiagramKind;
  colorMode?: DiagramColorMode;
  labelled?: boolean;
  flowchartSteps?: string[];
}): NoteBlock[] {
  const prompt = sanitizeDiagramText(opts.prompt, 200) || opts.prompt.trim();
  const wantsScientific =
    opts.kind === "scientific" ||
    Boolean(opts.templateId && getScientificTemplate(opts.templateId));

  if (wantsScientific) {
    let templateId = opts.templateId;
    let title = prompt || "Educational diagram";

    if (templateId && getScientificTemplate(templateId)) {
      title = getScientificTemplate(templateId)!.title;
    } else {
      const match = matchScientificTopic(prompt);
      if (!match.ok) {
        throw new AppError(
          `That diagram isn't available yet. Try one of our supported educational diagrams: ${match.suggestions.join(", ")}.`,
          400,
        );
      }
      templateId = match.id;
      title = match.title;
    }

    const colorMode: DiagramColorMode = opts.colorMode || "color";
    const labelled = opts.labelled !== false;

    return [
      { type: "heading", level: 1, text: title },
      {
        type: "diagram",
        templateId: templateId!,
        caption: `${title} · ${colorMode === "bw" ? "Black & White" : "Color"} · ${labelled ? "Labelled" : "Unlabelled"}`,
        style: opts.style,
        kind: "scientific",
        colorMode,
        labelled,
      },
      {
        type: "callout",
        kind: "important",
        text: "Deterministic educational SVG template — not generative AI art.",
      },
    ];
  }

  if (opts.kind === "flowchart") {
    const title = titleFromPrompt(prompt);
    return [
      { type: "heading", level: 1, text: title },
      {
        type: "diagram",
        templateId: "flowchart",
        caption: title,
        style: opts.style,
        kind: "flowchart",
        flowchartSteps: opts.flowchartSteps,
      },
      {
        type: "callout",
        kind: "important",
        text: "Rule-based flowchart layout — not generative AI art.",
      },
    ];
  }

  // Legacy keyword templates (CreateNoteForm / OCR reference path)
  const templateId = pickDiagramFromPrompt(prompt, opts.templateId);
  const labels = extractLabelHints(prompt);
  const caption = opts.fromImage
    ? "Handwritten study sketch based on your reference (structure preserved, not a pixel copy)."
    : `Study diagram · ${opts.style}`;

  const blocks: NoteBlock[] = [
    { type: "heading", level: 1, text: titleFromPrompt(prompt) },
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
