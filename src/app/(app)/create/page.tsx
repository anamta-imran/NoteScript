import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canUseSource, pricingHighlightHref, requiredPlanForSource } from "@/lib/entitlements";
import { getPlanTheme } from "@/lib/plan-theme";
import { LockedFeatureCard } from "@/components/billing/UpgradePrompt";
import { PlanBadge } from "@/components/billing/PlanBadge";
import type { PlanId, SourceType } from "@/lib/types";
import { cn } from "@/lib/utils";

export default async function CreateIndexPage() {
  const user = await requireUser();
  const planId = user.planId as PlanId;
  const theme = getPlanTheme(planId);

  const items: {
    href: string;
    title: string;
    body: string;
    source: SourceType;
  }[] = [
    {
      href: "/create/text",
      title: "Text",
      body: "Paste a chapter, lecture notes, or outline.",
      source: "text",
    },
    {
      href: "/create/pdf",
      title: "PDF",
      body: "Extract selectable text from a document.",
      source: "pdf",
    },
    {
      href: "/create/image",
      title: "Image",
      body: "OCR a photo, edit the text, then format.",
      source: "image",
    },
    {
      href: "/create/youtube",
      title: "YouTube",
      body: "Transform lecture captions into structured study notes.",
      source: "youtube",
    },
    {
      href: "/create/diagram",
      title: "Diagram",
      body: "Text or reference image → handwritten study sketch.",
      source: "diagram",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Create notes</h1>
        <PlanBadge planId={planId} />
      </div>
      <p className="mt-2 text-sm text-muted">
        Pick a source. Locked options stay visible so you can discover premium features.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((i) => {
          const unlocked = canUseSource(planId, i.source);
          const required = requiredPlanForSource(i.source);
          if (unlocked) {
            return (
              <Link
                key={i.href}
                href={i.href}
                className={cn(
                  "rounded-2xl border p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(103,76,145,0.1)]",
                  theme.cardClass,
                )}
              >
                <h2 className="font-semibold">{i.title}</h2>
                <p className="mt-2 text-sm text-muted">{i.body}</p>
              </Link>
            );
          }
          return (
            <LockedFeatureCard
              key={i.href}
              href={i.source === "youtube" ? "/create/youtube" : pricingHighlightHref(required)}
              title={i.title}
              body={i.body}
              requiredPlan={required}
            />
          );
        })}
      </div>
    </div>
  );
}
