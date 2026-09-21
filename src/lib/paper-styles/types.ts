export const PAPER_CATEGORIES = [
  "ruled",
  "grid",
  "school",
  "professional",
  "texture",
  "minimal",
] as const;

export type PaperCategory = (typeof PAPER_CATEGORIES)[number];

export type PaperPattern =
  | { kind: "none" }
  | {
      kind: "ruled";
      spacing: number;
      color: string;
      thickness?: number;
      startOffset?: number;
    }
  | {
      kind: "grid";
      size: number;
      color: string;
      thickness?: number;
      majorEvery?: number;
      majorColor?: string;
      majorThickness?: number;
    }
  | {
      kind: "dots";
      gap: number;
      radius: number;
      color: string;
    }
  | {
      kind: "isometric";
      size: number;
      color: string;
    }
  | {
      kind: "cornell";
      spacing: number;
      color: string;
      cueWidth: number;
      summaryHeight: number;
    }
  | {
      kind: "exam";
      spacing: number;
      color: string;
      headerHeight: number;
      footerHeight?: number;
    }
  | {
      kind: "legal";
      spacing: number;
      color: string;
      marginColor: string;
    };

export type PaperTexture =
  | "none"
  | "grain"
  | "fiber"
  | "aged"
  | "kraft"
  | "recycled"
  | "handmade"
  | "chalkboard";

export type PaperMargin = {
  left: number;
  color: string;
  width: number;
  dual?: number;
};

export type PaperStyleDef = {
  id: string;
  name: string;
  category: PaperCategory;
  description: string;
  bg: string;
  ink?: string;
  pattern: PaperPattern;
  margin?: PaperMargin;
  texture: PaperTexture;
  dark: boolean;
  printable: boolean;
};

export type PaperStyleId = string;

export const DEFAULT_PAPER_STYLE_ID = "classic-blue-ruled";
