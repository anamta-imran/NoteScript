export { SCIENTIFIC_TEMPLATES, getScientificTemplate, listScientificTitles, SCIENTIFIC_IDS } from "./registry";
export { matchScientificTopic } from "./matcher";
export type { MatchResult } from "./matcher";
export { buildFlowchartLayout } from "./flowchart";
export type { FlowchartLayout, FlowNode, FlowEdge } from "./flowchart";
export {
  palette,
  sanitizeDiagramText,
  normalizeTopic,
} from "./types";
export type { DiagramLabel, ScientificPalette, ScientificTemplateDef } from "./types";
