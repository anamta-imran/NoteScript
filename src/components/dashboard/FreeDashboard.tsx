"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { UsageMeter } from "@/components/ui/UsageMeter";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlanBadge } from "@/components/billing/PlanBadge";
import { canUseSource, pricingHighlightHref, requiredPlanForSource } from "@/lib/entitlements";
import type { PublicUser, SourceType, UsageSnapshot } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Me = {
  user: PublicUser;
  usage: UsageSnapshot & { used: number; limit: number; remaining: number };
  stats: { notes: number; folders: number };
};

type NoteItem = { id: string; title: string; subject: string; updatedAt: string; pageCount: number };

const SOURCES: { href: string; label: string; source: SourceType; blurb: string }[] = [
  { href: "/create/text", label: "Text", source: "text", blurb: "Paste chapters & outlines" },
  { href: "/create/pdf", label: "PDF", source: "pdf", blurb: "Extract from documents" },
  { href: "/create/image", label: "Image", source: "image", blurb: "OCR photos & slides" },
  { href: "/create/youtube", label: "YouTube", source: "youtube", blurb: "Lectures → study notes" },
  { href: "/create/diagram", label: "Diagram", source: "diagram", blurb: "Study sketches" },
];

/** Preserved Free-plan dashboard — polished entry-level, intentionally not premium. */
export function FreeDashboard({
  me,
  notes,
  folders,
}: {
  me: Me;
  notes: NoteItem[];
  folders: { id: string; name: string; noteCount: number }[];
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-line bg-white p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <PlanBadge planId="free" size="md" />
          <p className="text-sm font-medium text-lavender-deep">
            {me.usage.textUsed} / {me.usage.textLimit ?? 3} text generations used
          </p>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back, {me.user.name}
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted">
          Choose a source, pick a style, generate, then save or export.
        </p>
        {!me.user.emailVerified ? (
          <p className="mt-4 rounded-xl bg-lavender-soft/80 px-4 py-3 text-sm text-lavender-deep">
            Verify your email before generating notes.{" "}
            <button
              type="button"
              className="underline"
              onClick={() => api("/api/auth/resend-verification", { method: "POST" })}
            >
              Resend verification
            </button>
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button href="/pricing?highlight=student" size="sm">
            Upgrade to Student
          </Button>
          <Button href="/pricing?highlight=pro" variant="secondary" size="sm">
            See Pro
          </Button>
        </div>
      </div>

      <section>
        <div className="mb-3">
          <h2 className="font-semibold tracking-tight">Create notes</h2>
          <p className="text-sm text-muted">Unlocked sources and Pro discoveries</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SOURCES.map((s) => {
            const unlocked = canUseSource("free", s.source);
            const required = requiredPlanForSource(s.source);
            if (unlocked) {
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group rounded-2xl border border-line bg-white p-4 shadow-[0_8px_24px_rgba(45,31,58,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(103,76,145,0.12)]"
                >
                  <p className="font-semibold">{s.label}</p>
                  <p className="mt-1 text-xs text-muted">{s.blurb}</p>
                </Link>
              );
            }
            return (
              <Link
                key={s.href}
                href={s.source === "youtube" ? "/create/youtube" : pricingHighlightHref(required)}
                className="group relative rounded-2xl border border-dashed border-[#d8cce8] bg-white/60 p-4 transition hover:border-[#c4b0db] hover:bg-white"
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="font-semibold text-ink/80">{s.label}</p>
                  <span className="rounded-full bg-[#302838] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#E9E1F0]">
                    {required} 🔒
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{s.blurb}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(45,31,58,0.04)] lg:col-span-2">
          {me.usage.textLimit !== null ? (
            <UsageMeter used={me.usage.textUsed} limit={me.usage.textLimit} label="Text generations" />
          ) : (
            <p className="text-sm font-medium">Unlimited text generations</p>
          )}
          <div className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
            <p>
              Images:{" "}
              {me.usage.imageLimit === null
                ? "Unlimited"
                : `${me.usage.imageUsed} / ${me.usage.imageLimit}`}
            </p>
            <p>
              Diagrams:{" "}
              {me.usage.diagramLimit === null
                ? "Unlimited"
                : `${me.usage.diagramUsed} / ${me.usage.diagramLimit}`}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 text-sm shadow-[0_8px_24px_rgba(45,31,58,0.04)]">
          <p className="font-medium">Library</p>
          <p className="mt-2 text-muted">Notes: {me.stats.notes}</p>
          <p className="mt-1 text-muted">Folders: {me.stats.folders}</p>
          <p className="mt-3 text-muted">PDF, image, diagrams & YouTube locked</p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent notes</h2>
          <Link href="/notes" className="text-sm text-lavender-deep hover:underline">
            View all
          </Link>
        </div>
        {notes.length === 0 ? (
          <EmptyState
            title="No handwritten notes yet."
            body="Create your first one in seconds."
            cta="Create Notes"
            href="/create"
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {notes.slice(0, 6).map((n) => (
              <li key={n.id}>
                <Link
                  href={`/notes/${n.id}`}
                  className="block rounded-2xl border border-line bg-white p-4 shadow-[0_8px_24px_rgba(45,31,58,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(103,76,145,0.1)]"
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {n.subject} · {n.pageCount} pages · {formatDate(n.updatedAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Folders</h2>
          <Link href="/folders" className="text-sm text-lavender-deep hover:underline">
            Manage
          </Link>
        </div>
        {folders.length === 0 ? (
          <p className="text-sm text-muted">No folders yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {folders.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/folders/${f.id}`}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-sm shadow-sm transition hover:border-lavender/40"
                >
                  {f.name} ({f.noteCount})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
