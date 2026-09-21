import type {
  BillingCycle,
  DiagramStyle,
  GenerationOptions,
  HandwritingStyle,
  NoteLength,
  PaperStyleId,
  PlanId,
  SourceType,
} from "./types";
import { PAPER_STYLE_ID_VALUES } from "./types";

export type PlanLimits = {
  id: PlanId;
  name: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  /** null = unlimited */
  textGenerations: number | null;
  /** free uses lifetime total; paid uses monthly period */
  textLimitIsLifetime: boolean;
  imageGenerationsPerMonth: number | null;
  diagramGenerationsPerMonth: number | null;
  allowedSources: SourceType[];
  handwritingStyles: HandwritingStyle[];
  paperStyles: PaperStyleId[];
  noteLengths: NoteLength[];
  languages: GenerationOptions["language"][];
  diagramStyles: DiagramStyle[];
  smartHighlighting: boolean;
  chapterDetection: boolean;
  subjectFormatting: boolean;
  diagrams: boolean;
  timestamps: boolean;
  regeneratePage: boolean;
  maxFolders: number;
  pdfExport: boolean;
  pngExport: boolean;
  printReady: boolean;
  shareableLinks: boolean;
  duplicateNotes: boolean;
  searchFilter: boolean;
  maxPagesPerNote: number;
  maxInputChars: number;
  maxYoutubeSeconds: number;
  maxUploadBytes: number;
  priorityProcessing: boolean;
  advancedTemplates: boolean;
  analytics: boolean;
};

const FREE_STYLES: HandwritingStyle[] = ["clean-study", "simple-student"];
/** Student gets 10 handwriting styles (within the marketed 8–10 range). */
const STUDENT_STYLES: HandwritingStyle[] = [
  ...FREE_STYLES,
  "neat-notes",
  "soft-handwritten",
  "exam-notes",
  "compact-revision",
  "academic",
  "fine-liner",
  "study-journal",
  "realistic-pen",
];
const PRO_STYLES: HandwritingStyle[] = [
  ...STUDENT_STYLES,
  "creative-handwriting",
  "detailed-handwriting",
  "personal-notes",
  "casual-notebook",
];

const ALL_DIAGRAM_STYLES: DiagramStyle[] = [
  "clean-study",
  "handwritten",
  "exam-diagram",
  "detailed",
  "minimal",
];

const FREE_PAPER_STYLES: PaperStyleId[] = [
  "plain-white",
  "plain-off-white",
  "classic-blue-ruled",
  "college-ruled",
  "soft-cream",
  "warm-ivory",
  "small-graph",
  "study-notes",
];
const ALL_PAPER_STYLES = [...PAPER_STYLE_ID_VALUES] as PaperStyleId[];

export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    id: "free",
    name: "Free",
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    textGenerations: 3,
    textLimitIsLifetime: true,
    imageGenerationsPerMonth: 0,
    diagramGenerationsPerMonth: 0,
    allowedSources: ["text"],
    handwritingStyles: FREE_STYLES,
    paperStyles: FREE_PAPER_STYLES,
    noteLengths: ["quick", "standard"],
    languages: ["english"],
    diagramStyles: [],
    smartHighlighting: false,
    chapterDetection: false,
    subjectFormatting: false,
    diagrams: false,
    timestamps: false,
    regeneratePage: false,
    maxFolders: 3,
    pdfExport: false,
    pngExport: false,
    printReady: true,
    shareableLinks: false,
    duplicateNotes: false,
    searchFilter: false,
    maxPagesPerNote: 4,
    maxInputChars: 4000,
    maxYoutubeSeconds: 0,
    maxUploadBytes: 2 * 1024 * 1024,
    priorityProcessing: false,
    advancedTemplates: false,
    analytics: false,
  },
  student: {
    id: "student",
    name: "Student",
    monthlyPriceUsd: 14.99,
    annualPriceUsd: 99.99,
    textGenerations: null,
    textLimitIsLifetime: false,
    imageGenerationsPerMonth: 10,
    diagramGenerationsPerMonth: 10,
    allowedSources: ["text", "pdf", "image", "diagram"],
    handwritingStyles: STUDENT_STYLES,
    paperStyles: ALL_PAPER_STYLES,
    noteLengths: ["quick", "standard", "detailed"],
    languages: ["english", "easy-english", "urdu", "roman-urdu"],
    diagramStyles: ALL_DIAGRAM_STYLES,
    smartHighlighting: true,
    chapterDetection: true,
    subjectFormatting: true,
    diagrams: true,
    timestamps: false,
    regeneratePage: true,
    maxFolders: Number.POSITIVE_INFINITY,
    pdfExport: true,
    pngExport: true,
    printReady: true,
    shareableLinks: true,
    duplicateNotes: true,
    searchFilter: true,
    maxPagesPerNote: 30,
    maxInputChars: 60000,
    maxYoutubeSeconds: 0,
    maxUploadBytes: 15 * 1024 * 1024,
    priorityProcessing: false,
    advancedTemplates: true,
    analytics: true,
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPriceUsd: 18.99,
    annualPriceUsd: 139.99,
    textGenerations: null,
    textLimitIsLifetime: false,
    imageGenerationsPerMonth: null,
    diagramGenerationsPerMonth: null,
    allowedSources: ["text", "youtube", "pdf", "image", "diagram"],
    handwritingStyles: PRO_STYLES,
    paperStyles: ALL_PAPER_STYLES,
    noteLengths: ["quick", "standard", "detailed"],
    languages: ["english", "easy-english", "urdu", "roman-urdu"],
    diagramStyles: ALL_DIAGRAM_STYLES,
    smartHighlighting: true,
    chapterDetection: true,
    subjectFormatting: true,
    diagrams: true,
    timestamps: true,
    regeneratePage: true,
    maxFolders: Number.POSITIVE_INFINITY,
    pdfExport: true,
    pngExport: true,
    printReady: true,
    shareableLinks: true,
    duplicateNotes: true,
    searchFilter: true,
    maxPagesPerNote: 80,
    maxInputChars: 150000,
    maxYoutubeSeconds: 3 * 60 * 60,
    maxUploadBytes: 30 * 1024 * 1024,
    priorityProcessing: true,
    advancedTemplates: true,
    analytics: true,
  },
};

export function getPlan(id: PlanId): PlanLimits {
  return PLANS[id];
}

export function annualMonthlyEquivalent(plan: PlanId): number {
  return Number((PLANS[plan].annualPriceUsd / 12).toFixed(2));
}

export function annualSavingsPercent(plan: PlanId): number {
  const monthly = PLANS[plan].monthlyPriceUsd * 12;
  if (monthly <= 0) return 0;
  return Math.round(((monthly - PLANS[plan].annualPriceUsd) / monthly) * 100);
}

export function priceIdEnv(plan: PlanId, cycle: BillingCycle): string {
  const key = `PADDLE_PRICE_${plan.toUpperCase()}_${cycle.toUpperCase()}`;
  return process.env[key] ?? "";
}

export function styleMinPlan(style: HandwritingStyle): PlanId {
  if (FREE_STYLES.includes(style) || style === "clean") return "free";
  if (
    STUDENT_STYLES.includes(style) ||
    style === "class-notes" ||
    style === "aesthetic" ||
    style === "quick-revision"
  ) {
    return "student";
  }
  return "pro";
}

export function normalizeHandwritingStyle(style: string): HandwritingStyle {
  const map: Record<string, HandwritingStyle> = {
    clean: "clean-study",
    "class-notes": "neat-notes",
    aesthetic: "soft-handwritten",
    "quick-revision": "compact-revision",
  };
  return (map[style] || style) as HandwritingStyle;
}
