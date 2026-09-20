import type { NoteBlock } from "./types";

export const SAMPLE_BLOCKS: NoteBlock[] = [
  { type: "heading", level: 1, text: "Photosynthesis — Class Notes" },
  {
    type: "definition",
    term: "Photosynthesis",
    meaning: "The process by which green plants convert light energy into chemical energy.",
  },
  {
    type: "formula",
    expression: "6CO2 + 6H2O → C6H12O6 + 6O2",
    label: "Overall reaction",
  },
  {
    type: "bullets",
    items: [
      "Occurs mainly in chloroplasts",
      "Light-dependent reactions in thylakoids",
      "Calvin cycle in the stroma",
    ],
  },
  { type: "diagram", templateId: "process-arrows", caption: "Process template (not a photo of a cell)" },
  { type: "callout", kind: "important", text: "Remember: oxygen is released as a by-product of the light reactions." },
];
