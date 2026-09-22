import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PlanBadge } from "@/components/billing/PlanBadge";
import {
  featureLabel,
  pricingHighlightHref,
  type FeatureKey,
} from "@/lib/entitlements";
import type { PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";

const COPY: Partial<
  Record<
    FeatureKey,
    {
      title: string;
      body: (current: PlanId) => string;
      benefits: string[];
    }
  >
> = {
  youtube: {
    title: "Turn YouTube Lectures into Notes",
    body: (current) =>
      current === "student"
        ? "You're on the Student plan. Upgrade to Pro to unlock YouTube lecture-to-notes conversion."
        : "This feature is available on the Pro plan. Upgrade to transform YouTube lectures into structured study notes.",
    benefits: [
      "Fetch captions from lecture videos",
      "Clean conversational filler into study notes",
      "Structured headings, definitions, and takeaways",
      "Handwritten-style pages ready to revise",
    ],
  },
  pdf: {
    title: "PDF → Handwritten Notes",
    body: () => "Extract study material from PDFs and format it as handwritten notes. Available on Student and Pro.",
    benefits: ["Selectable PDF text extraction", "Structured study pages", "Export-ready notes"],
  },
  image: {
    title: "Image → Handwritten Notes",
    body: () => "OCR a photo of notes or slides, then turn it into structured handwritten study notes.",
    benefits: ["OCR from photos", "Editable extracted text", "Clean study formatting"],
  },
  diagram: {
    title: "Educational Diagrams",
    body: () => "Generate labelled study diagrams and flowcharts. Included on Student and Pro.",
    benefits: ["Flowcharts & science diagrams", "Labelled / unlabelled modes", "Print-ready sketches"],
  },
};

export function UpgradePrompt({
  feature,
  currentPlan,
  requiredPlan = "pro",
  className,
  compact = false,
}: {
  feature: FeatureKey;
  currentPlan: PlanId;
  requiredPlan?: PlanId;
  className?: string;
  compact?: boolean;
}) {
  const copy = COPY[feature] || {
    title: featureLabel(feature),
    body: () => `Unlock ${featureLabel(feature)} on the ${requiredPlan} plan.`,
    benefits: ["Premium study workflow", "Higher limits", "More export options"],
  };
  const pricingHref = pricingHighlightHref(requiredPlan);

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-[#e2d8ec] bg-gradient-to-br from-[#faf7fd] to-white p-5",
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg" aria-hidden>
            🔒
          </span>
          <PlanBadge planId={requiredPlan} />
          <p className="text-sm font-semibold text-ink">{copy.title}</p>
        </div>
        <p className="mt-2 text-sm text-muted">{copy.body(currentPlan)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button href={pricingHref} size="sm">
            Upgrade to {requiredPlan === "pro" ? "Pro" : "Student"}
          </Button>
          <Button href="/create" variant="ghost" size="sm">
            Maybe later
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-[#d8cce8] bg-gradient-to-br from-[#302838] via-[#3a3148] to-[#4a3d5c] p-8 text-white shadow-[0_24px_60px_rgba(48,40,56,0.28)] sm:p-10",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#80639d]/35 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg backdrop-blur"
            aria-hidden
          >
            🔒
          </span>
          <PlanBadge planId={requiredPlan} className="!bg-white/15 !text-white !ring-white/25" />
          {currentPlan !== "free" ? (
            <span className="text-xs text-white/60">Current: {currentPlan}</span>
          ) : null}
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">{copy.title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">{copy.body(currentPlan)}</p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {copy.benefits.map((b) => (
            <li
              key={b}
              className="flex gap-2 rounded-xl bg-white/8 px-3 py-2.5 text-sm text-white/85 ring-1 ring-white/10"
            >
              <span className="text-[#E9E1F0]" aria-hidden>
                ✦
              </span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            href={pricingHref}
            className="bg-white text-[#302838] hover:bg-[#E9E1F0] shadow-[0_8px_28px_rgba(0,0,0,0.2)]"
          >
            Upgrade to {requiredPlan === "pro" ? "Pro" : "Student"}
          </Button>
          <Button
            href="/create"
            variant="ghost"
            className="text-white/80 hover:bg-white/10 hover:text-white"
          >
            Back to create
          </Button>
        </div>
        <p className="mt-4 text-xs text-white/50">
          YouTube → Notes is included on Pro.{" "}
          <Link href={pricingHref} className="underline underline-offset-2 hover:text-white/80">
            Compare plans
          </Link>
        </p>
      </div>
    </div>
  );
}

export function LockedFeatureCard({
  href,
  title,
  body,
  requiredPlan,
  className,
}: {
  href: string;
  title: string;
  body: string;
  requiredPlan: PlanId;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-dashed border-[#d8cce8] bg-white/70 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#c4b0db] hover:bg-white hover:shadow-[0_12px_32px_rgba(103,76,145,0.1)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-ink">{title}</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#302838] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E9E1F0]">
          {requiredPlan} 🔒
        </span>
      </div>
      <p className="mt-2 flex-1 text-sm text-muted">{body}</p>
      <p className="mt-3 text-sm font-medium text-lavender-deep group-hover:underline">View upgrade</p>
    </Link>
  );
}
