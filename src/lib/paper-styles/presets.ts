import { PAPER_STYLES } from "./registry";
import type { PaperCategory, PaperStyleDef } from "./types";

/** Convenience groupings for UI filters / future expansion. */
export const PAPER_PRESETS_BY_CATEGORY: Record<PaperCategory, PaperStyleDef[]> = {
  ruled: PAPER_STYLES.filter((p) => p.category === "ruled"),
  grid: PAPER_STYLES.filter((p) => p.category === "grid"),
  school: PAPER_STYLES.filter((p) => p.category === "school"),
  professional: PAPER_STYLES.filter((p) => p.category === "professional"),
  texture: PAPER_STYLES.filter((p) => p.category === "texture"),
  minimal: PAPER_STYLES.filter((p) => p.category === "minimal"),
};
