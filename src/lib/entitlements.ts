import { getPlan } from "./plans";
import type { PlanId, SourceType } from "./types";

/** Feature keys used for gating UI + API responses. */
export type FeatureKey =
  | "text"
  | "youtube"
  | "pdf"
  | "image"
  | "diagram"
  | "pdfExport"
  | "pngExport"
  | "shareableLinks"
  | "duplicateNotes"
  | "searchFilter"
  | "smartHighlighting"
  | "chapterDetection"
  | "timestamps"
  | "regeneratePage"
  | "priorityProcessing"
  | "advancedTemplates";

const SOURCE_FEATURES: SourceType[] = ["text", "youtube", "pdf", "image", "diagram"];

const FEATURE_REQUIRED_PLAN: Record<FeatureKey, PlanId> = {
  text: "free",
  pdf: "student",
  image: "student",
  diagram: "student",
  youtube: "pro",
  pdfExport: "student",
  pngExport: "student",
  shareableLinks: "student",
  duplicateNotes: "student",
  searchFilter: "student",
  smartHighlighting: "student",
  chapterDetection: "student",
  regeneratePage: "student",
  advancedTemplates: "student",
  timestamps: "pro",
  priorityProcessing: "pro",
};

const PLAN_RANK: Record<PlanId, number> = { free: 0, student: 1, pro: 2 };

export function planRank(plan: PlanId): number {
  return PLAN_RANK[plan];
}

export function planMeetsMinimum(current: PlanId, required: PlanId): boolean {
  return planRank(current) >= planRank(required);
}

export function requiredPlanForFeature(feature: FeatureKey): PlanId {
  return FEATURE_REQUIRED_PLAN[feature];
}

export function requiredPlanForSource(source: SourceType): PlanId {
  if (source === "youtube") return "pro";
  if (source === "text") return "free";
  return "student";
}

export function canUseSource(planId: PlanId, source: SourceType): boolean {
  return getPlan(planId).allowedSources.includes(source);
}

export function canUseFeature(planId: PlanId, feature: FeatureKey): boolean {
  if (SOURCE_FEATURES.includes(feature as SourceType)) {
    return canUseSource(planId, feature as SourceType);
  }
  const plan = getPlan(planId);
  switch (feature) {
    case "pdfExport":
      return plan.pdfExport;
    case "pngExport":
      return plan.pngExport;
    case "shareableLinks":
      return plan.shareableLinks;
    case "duplicateNotes":
      return plan.duplicateNotes;
    case "searchFilter":
      return plan.searchFilter;
    case "smartHighlighting":
      return plan.smartHighlighting;
    case "chapterDetection":
      return plan.chapterDetection;
    case "timestamps":
      return plan.timestamps;
    case "regeneratePage":
      return plan.regeneratePage;
    case "priorityProcessing":
      return plan.priorityProcessing;
    case "advancedTemplates":
      return plan.advancedTemplates;
    default:
      return false;
  }
}

export function featureLabel(feature: FeatureKey | SourceType): string {
  const labels: Record<string, string> = {
    text: "Text → Notes",
    youtube: "YouTube → Notes",
    pdf: "PDF → Notes",
    image: "Image → Notes",
    diagram: "Diagram Studio",
    pdfExport: "PDF export",
    pngExport: "PNG export",
    shareableLinks: "Shareable links",
    duplicateNotes: "Duplicate notes",
    searchFilter: "Search & filter",
    smartHighlighting: "Smart highlighting",
    chapterDetection: "Chapter detection",
    timestamps: "YouTube timestamps",
    regeneratePage: "Regenerate page",
    priorityProcessing: "Priority processing",
    advancedTemplates: "Advanced templates",
  };
  return labels[feature] || feature;
}

export function upgradePath(current: PlanId, required: PlanId): PlanId | null {
  if (planMeetsMinimum(current, required)) return null;
  return required;
}

export function pricingHighlightHref(requiredPlan: PlanId, cycle: "monthly" | "annual" = "monthly"): string {
  return `/pricing?highlight=${requiredPlan}&cycle=${cycle}`;
}
