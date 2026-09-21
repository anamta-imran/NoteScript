export const SOURCE_TYPES = ["text", "youtube", "pdf", "image", "diagram"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const HANDWRITING_STYLES = [
  "clean-study",
  "simple-student",
  "neat-notes",
  "soft-handwritten",
  "exam-notes",
  "realistic-pen",
  "fine-liner",
  "academic",
  "compact-revision",
  "creative-handwriting",
  "study-journal",
  "detailed-handwriting",
  "personal-notes",
  "casual-notebook",
  // legacy aliases (existing notes)
  "clean",
  "class-notes",
  "aesthetic",
  "quick-revision",
] as const;
export type HandwritingStyle = (typeof HANDWRITING_STYLES)[number];

export const NOTE_LENGTHS = ["quick", "standard", "detailed"] as const;
export type NoteLength = (typeof NOTE_LENGTHS)[number];

export const LANGUAGES = ["english", "easy-english", "urdu", "roman-urdu"] as const;
export type NoteLanguage = (typeof LANGUAGES)[number];

export const INTERFACE_LANGUAGES = ["en", "ur"] as const;
export type InterfaceLanguage = (typeof INTERFACE_LANGUAGES)[number];

export const SUBJECTS = [
  "auto",
  "mathematics",
  "computer-science",
  "biology",
  "chemistry",
  "physics",
  "history",
  "general",
] as const;
export type Subject = (typeof SUBJECTS)[number];

export const PLAN_IDS = ["free", "student", "pro"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const BILLING_CYCLES = ["monthly", "annual"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const JOB_STATES = [
  "queued",
  "processing",
  "completed",
  "failed",
  "cancelled",
] as const;
export type JobState = (typeof JOB_STATES)[number];

export const DIAGRAM_STYLES = [
  "clean-study",
  "handwritten",
  "exam-diagram",
  "detailed",
  "minimal",
] as const;
export type DiagramStyle = (typeof DIAGRAM_STYLES)[number];

export type HighlightKind =
  | "definition"
  | "important"
  | "formula"
  | "example"
  | "exam"
  | "conclusion";

export type DiagramTemplateId =
  | "flowchart"
  | "process-arrows"
  | "cell-simple"
  | "atom-simple"
  | "circuit-simple"
  | "force-diagram"
  | "timeline"
  | "algorithm-box"
  | "water-cycle"
  | "blank-labeled"
  | "sci-heart"
  | "sci-kidney"
  | "sci-liver"
  | "sci-eye"
  | "sci-brain"
  | "sci-neuron"
  | "sci-plant-cell"
  | "sci-animal-cell"
  | "sci-leaf"
  | "sci-flower"
  | "sci-digestive"
  | "sci-respiratory"
  | "sci-ear"
  | "sci-tooth"
  | "sci-dna"
  | "sci-lungs"
  | "sci-stomach"
  | "sci-mitochondria";

export type DiagramColorMode = "color" | "bw";
export type DiagramKind = "flowchart" | "scientific";

export type NoteBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string; chapterId?: string }
  | { type: "paragraph"; text: string; highlights?: HighlightSpan[] }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "definition"; term: string; meaning: string }
  | { type: "formula"; expression: string; label?: string }
  | { type: "example"; text: string }
  | {
      type: "math-problem";
      given: string[];
      required: string[];
      formula?: string;
      steps: string[];
      answer?: string;
    }
  | {
      type: "cs-concept";
      definition?: string;
      syntax?: string;
      example?: string;
      important?: string[];
    }
  | { type: "timeline"; events: { date: string; event: string }[] }
  | { type: "code"; code: string }
  | {
      type: "diagram";
      templateId: DiagramTemplateId;
      caption?: string;
      style?: DiagramStyle;
      kind?: DiagramKind;
      colorMode?: DiagramColorMode;
      labelled?: boolean;
      flowchartSteps?: string[];
    }
  | { type: "timestamp"; seconds: number; label: string; videoId?: string }
  | { type: "callout"; kind: HighlightKind; text: string }
  | { type: "chemistry-equation"; expression: string };

export type HighlightSpan = { start: number; end: number; kind: HighlightKind };

export type Chapter = {
  id: string;
  title: string;
  startBlock: number;
  endBlock: number;
};

export type StructuredNote = {
  title: string;
  subject: Exclude<Subject, "auto">;
  language: NoteLanguage;
  chapters: Chapter[];
  blocks: NoteBlock[];
  keywords: string[];
  source: {
    type: SourceType;
    youtubeVideoId?: string;
    youtubeUrl?: string;
    fileName?: string;
    pageCount?: number;
  };
};

export type NotePage = {
  index: number;
  blocks: NoteBlock[];
  seed: number;
};

export type GenerationOptions = {
  handwritingStyle: HandwritingStyle;
  noteLength: NoteLength;
  language: NoteLanguage;
  subject: Subject;
  smartHighlighting: boolean;
  importantPoints: boolean;
  formulas: boolean;
  examples: boolean;
  diagrams: boolean;
  chapterDetection: boolean;
  diagramTemplate?: DiagramTemplateId;
  diagramStyle?: DiagramStyle;
  diagramPrompt?: string;
  diagramKind?: DiagramKind;
  diagramColorMode?: DiagramColorMode;
  diagramLabelled?: boolean;
  flowchartSteps?: string[];
};

export type ExtractedContent = {
  text: string;
  titleHint?: string;
  pageMarkers?: number[];
  transcript?: { text: string; offset: number; duration: number }[];
  youtubeVideoId?: string;
  youtubeUrl?: string;
  fileName?: string;
  warnings: string[];
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string;
  preferredLanguage: NoteLanguage;
  preferredHandwritingStyle: HandwritingStyle;
  preferredNoteLength: NoteLength;
  timezone: string;
  interfaceLanguage: InterfaceLanguage;
  planId: PlanId;
  billingCycle?: BillingCycle;
  subscriptionStatus: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
};

export type UsageSnapshot = {
  planId: PlanId;
  textUsed: number;
  textLimit: number | null;
  imageUsed: number;
  imageLimit: number | null;
  diagramUsed: number;
  diagramLimit: number | null;
  periodStart: string;
  periodEnd: string;
};
