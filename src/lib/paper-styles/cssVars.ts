import type { CSSProperties } from "react";
import { isometricPattern, textureDataUri } from "./patterns";
import type { PaperStyleDef } from "./types";

export function paperStyleToCssVars(style: PaperStyleDef): CSSProperties {
  const layers: string[] = [];
  const texture = textureDataUri(style.texture, style.dark);
  if (texture) layers.push(texture);

  const p = style.pattern;
  let ruleLayer = "none";
  let gridExtra = "none";
  let marginColor = "transparent";
  let marginLeft = "0px";
  let marginWidth = "0px";
  let marginDual = "none";
  let cueLine = "none";
  let summaryLine = "none";
  let headerBand = "none";
  let footerBand = "none";
  let padLeft = "40px";

  if (style.margin) {
    marginColor = style.margin.color;
    marginLeft = `${style.margin.left}px`;
    marginWidth = `${style.margin.width}px`;
    padLeft = `${Math.max(28, style.margin.left + 16)}px`;
    if (style.margin.dual) {
      marginDual = `linear-gradient(to right, transparent ${style.margin.dual}px, ${style.margin.color} ${style.margin.dual}px, ${style.margin.color} ${style.margin.dual + style.margin.width}px, transparent ${style.margin.dual + style.margin.width}px)`;
    }
  }

  if (p.kind === "ruled" || p.kind === "legal") {
    const spacing = p.spacing;
    const color = p.color;
    const thickness = "thickness" in p && p.thickness ? p.thickness : 1;
    ruleLayer = `repeating-linear-gradient(to bottom, transparent 0, transparent ${spacing - thickness}px, ${color} ${spacing - thickness}px, ${color} ${spacing}px)`;
  }

  if (p.kind === "grid") {
    const size = p.size;
    const color = p.color;
    const t = p.thickness ?? 1;
    ruleLayer = `
      repeating-linear-gradient(to right, transparent 0, transparent ${size - t}px, ${color} ${size - t}px, ${color} ${size}px),
      repeating-linear-gradient(to bottom, transparent 0, transparent ${size - t}px, ${color} ${size - t}px, ${color} ${size}px)
    `;
    if (p.majorEvery && p.majorColor) {
      const major = size * p.majorEvery;
      const mt = p.majorThickness ?? 1.25;
      gridExtra = `
        repeating-linear-gradient(to right, transparent 0, transparent ${major - mt}px, ${p.majorColor} ${major - mt}px, ${p.majorColor} ${major}px),
        repeating-linear-gradient(to bottom, transparent 0, transparent ${major - mt}px, ${p.majorColor} ${major - mt}px, ${p.majorColor} ${major}px)
      `;
    }
  }

  if (p.kind === "dots") {
    ruleLayer = `radial-gradient(circle, ${p.color} ${p.radius}px, transparent ${p.radius + 0.5}px)`;
  }

  if (p.kind === "isometric") {
    layers.push(isometricPattern(p.size, p.color));
  }

  if (p.kind === "cornell") {
    ruleLayer = `repeating-linear-gradient(to bottom, transparent 0, transparent ${p.spacing - 1}px, ${p.color} ${p.spacing - 1}px, ${p.color} ${p.spacing}px)`;
    cueLine = `linear-gradient(to right, transparent ${p.cueWidth}px, ${p.color} ${p.cueWidth}px, ${p.color} ${p.cueWidth + 1}px, transparent ${p.cueWidth + 1}px)`;
    summaryLine = `linear-gradient(to top, ${p.color} 0, ${p.color} 1px, transparent 1px)`;
    padLeft = `${p.cueWidth + 20}px`;
    marginLeft = `${p.cueWidth}px`;
    marginWidth = "1px";
    marginColor = p.color;
  }

  if (p.kind === "exam") {
    if (p.spacing < 200) {
      ruleLayer = `repeating-linear-gradient(to bottom, transparent 0, transparent ${p.spacing - 1}px, ${p.color} ${p.spacing - 1}px, ${p.color} ${p.spacing}px)`;
    }
    headerBand = `linear-gradient(to bottom, rgba(40,50,70,0.06) 0, rgba(40,50,70,0.06) ${p.headerHeight}px, transparent ${p.headerHeight}px)`;
    if (p.footerHeight) {
      footerBand = `linear-gradient(to top, rgba(40,50,70,0.05) 0, rgba(40,50,70,0.05) ${p.footerHeight}px, transparent ${p.footerHeight}px)`;
    }
  }

  return {
    ["--paper-bg" as string]: style.bg,
    ["--paper-ink" as string]: style.ink || (style.dark ? "#e8eaf0" : "inherit"),
    ["--paper-texture" as string]: layers.length ? layers.join(", ") : "none",
    ["--paper-rule" as string]: ruleLayer,
    ["--paper-grid-extra" as string]: gridExtra,
    ["--paper-margin-color" as string]: marginColor,
    ["--paper-margin-left" as string]: marginLeft,
    ["--paper-margin-width" as string]: marginWidth,
    ["--paper-margin-dual" as string]: marginDual,
    ["--paper-cue" as string]: cueLine,
    ["--paper-summary" as string]: summaryLine,
    ["--paper-header" as string]: headerBand,
    ["--paper-footer" as string]: footerBand,
    ["--paper-pad-left" as string]: padLeft,
    ["--paper-dot-size" as string]: p.kind === "dots" ? `${p.gap}px` : "auto",
    ["--paper-pattern" as string]: p.kind,
    backgroundColor: style.bg,
    color: style.ink || undefined,
  };
}
