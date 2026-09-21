import type { DiagramColorMode, DiagramTemplateId } from "@/lib/types";

export type DiagramLabel = {
  id: string;
  text: string;
  /** Point on the structure */
  x: number;
  y: number;
  /** Label text position */
  lx: number;
  ly: number;
};

export type ScientificPalette = {
  bg: string;
  outline: string;
  fill: string;
  fillAlt: string;
  fillSoft: string;
  accent: string;
  text: string;
  leader: string;
  organ: string;
  organDeep: string;
  vessel: string;
  fat: string;
};

export function palette(mode: DiagramColorMode): ScientificPalette {
  if (mode === "bw") {
    return {
      bg: "#ffffff",
      outline: "#111111",
      fill: "#ffffff",
      fillAlt: "#f5f5f5",
      fillSoft: "#e8e8e8",
      accent: "#222222",
      text: "#111111",
      leader: "#333333",
      organ: "#ffffff",
      organDeep: "#f0f0f0",
      vessel: "#dddddd",
      fat: "#fafafa",
    };
  }
  return {
    bg: "#ffffff",
    outline: "#1f2937",
    fill: "#fecaca",
    fillAlt: "#fed7aa",
    fillSoft: "#dbeafe",
    accent: "#b91c1c",
    text: "#111827",
    leader: "#4b5563",
    organ: "#fca5a5",
    organDeep: "#f87171",
    vessel: "#93c5fd",
    fat: "#fde68a",
  };
}

export type ScientificTemplateDef = {
  id: DiagramTemplateId;
  title: string;
  category: "anatomy" | "cell" | "plant" | "molecular" | "system";
  aliases: string[];
  viewBox: string;
  labels: DiagramLabel[];
};

export function sanitizeDiagramText(input: string, max = 80): string {
  return input
    .replace(/[<>&"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function normalizeTopic(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
