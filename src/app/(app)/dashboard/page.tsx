"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { UsageMeter } from "@/components/ui/UsageMeter";
import { EmptyState, Skeleton } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { PublicUser, UsageSnapshot } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Me = {
  user: PublicUser;
  usage: UsageSnapshot & { used: number; limit: number; remaining: number };
  stats: { notes: number; folders: number };
};

type NoteItem = { id: string; title: string; subject: string; updatedAt: string; pageCount: number };

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [folders, setFolders] = useState<{ id: string; name: string; noteCount: number }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<Me>("/api/auth/me"),
      api<{ items: NoteItem[] }>("/api/notes?sort=updated"),
      api<{ folders: { id: string; name: string; noteCount: number }[] }>("/api/folders"),
    ])
      .then(([a, b, c]) => {
        setMe(a);
        setNotes(b.items);
        setFolders(c.folders);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load dashboard."));
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!me) return <Skeleton className="h-64" />;

  const planId = me.user.planId;
  const isPro = planId === "pro";
  const planHeadline =
    planId === "pro"
      ? "PRO PLAN · All features unlocked"
      : planId === "student"
        ? "STUDENT PLAN · Active · Unlimited text generations"
        : `FREE PLAN · ${me.usage.textUsed} / ${me.usage.textLimit ?? 3} generations used`;

  return (
    <div className={cn("mx-auto max-w-5xl space-y-8", isPro && "pro-dashboard")}>
      <div
        className={cn(
          "rounded-2xl border p-5",
          isPro ? "border-[#302838]/30 bg-gradient-to-br from-[#302838] to-[#4a3d5c] text-white" : "border-line bg-white",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isPro ? "muted" : "lavender"}>{planId.toUpperCase()}</Badge>
          <p className={cn("text-sm font-medium", isPro ? "text-[#E9E1F0]" : "text-lavender-deep")}>
            {planHeadline}
          </p>
        </div>
        <h1 className="mt-3 text-2xl font-semibold">Welcome back, {me.user.name}</h1>
        <p className={cn("mt-1 text-sm", isPro ? "text-white/70" : "text-muted")}>
          Choose a source, pick a style, generate, then save or export.
        </p>
        {!me.user.emailVerified ? (
          <p className="mt-3 rounded-xl bg-white/10 px-4 py-3 text-sm">
            Verify your email before generating notes.{" "}
            <button
              className="underline"
              onClick={() => api("/api/auth/resend-verification", { method: "POST" })}
            >
              Resend verification
            </button>
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["/create/text", "Text", true],
          ["/create/pdf", "PDF", planId !== "free"],
          ["/create/image", "Image", planId !== "free"],
          ["/create/youtube", "YouTube", planId === "pro"],
          ["/create/diagram", "Diagram", planId !== "free"],
        ].map(([href, label, unlocked]) =>
          unlocked ? (
            <Button key={String(href)} href={String(href)} variant="secondary" className="h-auto py-4">
              {String(label)}
            </Button>
          ) : (
            <Link
              key={String(href)}
              href="/billing"
              className="rounded-xl border border-dashed border-line bg-white/60 px-3 py-4 text-center text-sm text-muted"
            >
              {String(label)} 🔒
            </Link>
          ),
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 lg:col-span-2">
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
          {planId === "free" ? (
            <div className="mt-4">
              <Button href="/billing" size="sm">
                Upgrade
              </Button>
            </div>
          ) : null}
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 text-sm">
          <p>Notes: {me.stats.notes}</p>
          <p className="mt-2">Folders: {me.stats.folders}</p>
          {isPro ? <p className="mt-2 text-lavender-deep">Premium handwriting + YouTube unlocked</p> : null}
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent notes</h2>
          <Link href="/notes" className="text-sm text-lavender-deep">
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
                <Link href={`/notes/${n.id}`} className="block rounded-2xl border border-line bg-white p-4">
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
          <Link href="/folders" className="text-sm text-lavender-deep">
            Manage
          </Link>
        </div>
        {folders.length === 0 ? (
          <p className="text-sm text-muted">No folders yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {folders.map((f) => (
              <li key={f.id}>
                <Link href={`/folders/${f.id}`} className="rounded-full bg-white px-3 py-1 text-sm shadow-sm">
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
