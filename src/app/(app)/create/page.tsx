import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import type { PlanId } from "@/lib/types";

export default async function CreateIndexPage() {
  const user = await requireUser();
  const plan = getPlan(user.planId as PlanId);

  const items = [
    {
      href: "/create/text",
      title: "Text",
      body: "Paste a chapter, lecture notes, or outline.",
      unlocked: plan.allowedSources.includes("text"),
      lock: "",
    },
    {
      href: "/create/pdf",
      title: "PDF",
      body: "Extract selectable text from a document.",
      unlocked: plan.allowedSources.includes("pdf"),
      lock: "Student or Pro",
    },
    {
      href: "/create/image",
      title: "Image",
      body: "OCR a photo, edit the text, then format.",
      unlocked: plan.allowedSources.includes("image"),
      lock: "Student or Pro",
    },
    {
      href: "/create/youtube",
      title: "YouTube",
      body: "Use captions, or paste a transcript.",
      unlocked: plan.allowedSources.includes("youtube"),
      lock: "Pro only",
    },
    {
      href: "/create/diagram",
      title: "Diagram",
      body: "Text or reference image → handwritten study sketch.",
      unlocked: plan.allowedSources.includes("diagram"),
      lock: "Student or Pro",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Create notes</h1>
      <p className="mt-2 text-sm text-muted">Pick a source. Locked options show the required plan.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((i) =>
          i.unlocked ? (
            <Link key={i.href} href={i.href} className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-semibold">{i.title}</h2>
              <p className="mt-2 text-sm text-muted">{i.body}</p>
            </Link>
          ) : (
            <div
              key={i.href}
              className="rounded-2xl border border-dashed border-line bg-white/70 p-6 opacity-90"
            >
              <h2 className="font-semibold">
                {i.title} <span className="text-xs text-muted">🔒 {i.lock}</span>
              </h2>
              <p className="mt-2 text-sm text-muted">{i.body}</p>
              <Link href="/billing" className="mt-3 inline-block text-sm text-lavender-deep underline">
                Upgrade
              </Link>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
