"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Field";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

type NoteItem = {
  id: string;
  title: string;
  subject: string;
  sourceType: string;
  pageCount: number;
  favorite: boolean;
  archived: boolean;
  updatedAt: string;
  handwritingStyle: string;
};

export default function NotesPage() {
  const { push } = useToast();
  const [items, setItems] = useState<NoteItem[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [subject, setSubject] = useState("all");
  const [archived, setArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [planId, setPlanId] = useState<"free" | "student" | "pro">("free");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        sort,
        archived: String(archived),
      });
      if (q.trim()) params.set("q", q.trim());
      if (subject !== "all") params.set("subject", subject);
      const data = await api<{ items: NoteItem[] }>(`/api/notes?${params}`);
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load notes.");
    } finally {
      setLoading(false);
    }
  }, [q, sort, subject, archived]);

  useEffect(() => {
    const t = window.setTimeout(load, q ? 250 : 0);
    return () => window.clearTimeout(t);
  }, [load, q]);

  useEffect(() => {
    api<{ user: { planId: "free" | "student" | "pro" } }>("/api/auth/me")
      .then((d) => setPlanId(d.user.planId))
      .catch(() => {});
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this note?")) return;
    await api(`/api/notes/${id}`, { method: "DELETE" });
    push("Note deleted");
    load();
  }

  async function duplicate(id: string) {
    try {
      const res = await api<{ id: string }>(`/api/notes/${id}/duplicate`, { method: "POST" });
      push("Note duplicated");
      window.location.href = `/notes/${res.id}`;
    } catch (e) {
      push(e instanceof Error ? e.message : "Could not duplicate.", "err");
    }
  }

  const canDuplicate = planId !== "free";
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notes library</h1>
          <p className="mt-1 text-sm text-muted">Search, filter, and open your handwritten notes.</p>
        </div>
        <Button href="/create">Create notes</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Search notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search notes"
        />
        <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="updated">Recently updated</option>
          <option value="alpha">Alphabetical</option>
        </Select>
        <Select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject">
          <option value="all">All subjects</option>
          {["mathematics", "computer-science", "biology", "chemistry", "physics", "history", "general"].map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ),
          )}
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {loading ? <Skeleton className="h-40" /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState
          title="No handwritten notes yet."
          body="Create your first one in seconds."
          cta="Create Notes"
          href="/create"
        />
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((n) => (
          <li key={n.id} className="rounded-2xl border border-line bg-white p-4">
            <Link href={`/notes/${n.id}`} className="block">
              <p className="font-medium">{n.title}</p>
              <p className="mt-1 text-xs text-muted">
                {n.subject} · {n.sourceType} · {n.pageCount} pages · {formatDate(n.updatedAt)}
              </p>
            </Link>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" href={`/notes/${n.id}`}>
                Open
              </Button>
              {canDuplicate ? (
                <Button size="sm" variant="ghost" onClick={() => duplicate(n.id)}>
                  Duplicate
                </Button>
              ) : null}
              <Button size="sm" variant="danger" onClick={() => remove(n.id)}>
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
