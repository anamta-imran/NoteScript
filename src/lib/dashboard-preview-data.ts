import type { BillingCycle, PlanId, PublicUser, UsageSnapshot } from "@/lib/types";

export type DashboardMe = {
  user: PublicUser;
  usage: UsageSnapshot & { used: number; limit: number; remaining: number };
  stats: { notes: number; folders: number };
};

export type DashboardNoteItem = {
  id: string;
  title: string;
  subject: string;
  updatedAt: string;
  pageCount: number;
};

export type DashboardFolderItem = {
  id: string;
  name: string;
  noteCount: number;
};

const SAMPLE_NOTES: DashboardNoteItem[] = [
  {
    id: "preview-note-1",
    title: "Cell Biology — Membrane Transport",
    subject: "Biology",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    pageCount: 4,
  },
  {
    id: "preview-note-2",
    title: "Organic Chemistry: Functional Groups",
    subject: "Chemistry",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    pageCount: 6,
  },
  {
    id: "preview-note-3",
    title: "World History — Industrial Revolution",
    subject: "History",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    pageCount: 3,
  },
  {
    id: "preview-note-4",
    title: "Calculus — Derivatives Review",
    subject: "Math",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    pageCount: 5,
  },
];

const SAMPLE_FOLDERS: DashboardFolderItem[] = [
  { id: "preview-folder-1", name: "Exam Prep", noteCount: 8 },
  { id: "preview-folder-2", name: "Lectures", noteCount: 12 },
  { id: "preview-folder-3", name: "Quick Revision", noteCount: 4 },
];

function previewUser(
  planId: Extract<PlanId, "student" | "pro">,
  billingCycle: BillingCycle,
): PublicUser {
  return {
    id: `preview-${planId}`,
    name: planId === "pro" ? "Ava Chen" : "Sam Rivera",
    email: `preview.${planId}@notescript.local`,
    emailVerified: true,
    preferredLanguage: "english",
    preferredHandwritingStyle: "clean-study",
    preferredNoteLength: "standard",
    timezone: "UTC",
    interfaceLanguage: "en",
    planId,
    billingCycle,
    subscriptionStatus: "active",
    currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    cancelAtPeriodEnd: false,
  };
}

function previewUsage(
  planId: Extract<PlanId, "student" | "pro">,
): DashboardMe["usage"] {
  const periodStart = new Date();
  periodStart.setUTCDate(1);
  periodStart.setUTCHours(0, 0, 0, 0);
  const periodEnd = new Date(periodStart);
  periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);

  if (planId === "pro") {
    return {
      planId: "pro",
      textUsed: 24,
      textLimit: null,
      imageUsed: 7,
      imageLimit: null,
      diagramUsed: 5,
      diagramLimit: null,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      used: 24,
      limit: Number.POSITIVE_INFINITY,
      remaining: Number.POSITIVE_INFINITY,
    };
  }

  return {
    planId: "student",
    textUsed: 18,
    textLimit: null,
    imageUsed: 3,
    imageLimit: 10,
    diagramUsed: 4,
    diagramLimit: 10,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    used: 18,
    limit: Number.POSITIVE_INFINITY,
    remaining: Number.POSITIVE_INFINITY,
  };
}

/** Sample payload for public UI previews — never persisted, never billed. */
export function getPaidDashboardPreview(
  planId: Extract<PlanId, "student" | "pro">,
  billingCycle: BillingCycle,
): {
  me: DashboardMe;
  notes: DashboardNoteItem[];
  folders: DashboardFolderItem[];
} {
  return {
    me: {
      user: previewUser(planId, billingCycle),
      usage: previewUsage(planId),
      stats: { notes: 14, folders: 3 },
    },
    notes: SAMPLE_NOTES,
    folders: SAMPLE_FOLDERS,
  };
}
