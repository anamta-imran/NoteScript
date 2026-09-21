"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/EmptyState";
import { NotePageView } from "@/components/notes/NotePageView";
import { useToast } from "@/components/ui/Toast";
import type { HandwritingStyle, NoteLanguage, NotePage } from "@/lib/types";
import { getPlan } from "@/lib/plans";
import type { PlanId } from "@/lib/types";

type NoteDetail = {
  id: string;
  title: string;
  pages: NotePage[];
  handwritingStyle: HandwritingStyle;
  paperStyleId?: string | null;
  language: NoteLanguage;
  pageCount: number;
  subject: string;
  sourceType: string;
};

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const [note, setNote] = useState<NoteDetail | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [planId, setPlanId] = useState<PlanId>("free");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api<{ note: NoteDetail }>(`/api/notes/${id}`),
      api<{ user: { planId: PlanId } }>("/api/auth/me"),
      api<{ enabled: boolean; url: string | null }>(`/api/notes/${id}/share`).catch(() => ({
        enabled: false,
        url: null,
      })),
    ])
      .then(([n, me, share]) => {
        setNote(n.note);
        setPlanId(me.user.planId);
        setShareUrl(share.url);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Note not found."));
  }, [id]);

  const plan = getPlan(planId);
  const page = note?.pages[pageIndex];

  async function exportPng() {
    if (!pageRef.current || !plan.pngExport) {
      push("PNG export requires Student or Pro.", "err");
      return;
    }
    const dataUrl = await toPng(pageRef.current, { pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${note?.title || "note"}-p${pageIndex + 1}.png`;
    a.click();
    push("PNG exported");
  }

  async function exportPdf() {
    if (!pageRef.current || !plan.pdfExport) {
      push("PDF export requires Student or Pro.", "err");
      return;
    }
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    for (let i = 0; i < (note?.pages.length || 0); i++) {
      setPageIndex(i);
      await new Promise((r) => setTimeout(r, 80));
      if (!pageRef.current) continue;
      const dataUrl = await toPng(pageRef.current, { pixelRatio: 2 });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      if (i > 0) pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, 0, w, h);
    }
    pdf.save(`${note?.title || "note"}.pdf`);
    push("PDF exported");
  }

  async function regenerate() {
    if (!plan.regeneratePage) {
      push("Page regeneration requires Student or Pro.", "err");
      return;
    }
    const res = await api<{ pages: NotePage[] }>(`/api/notes/${id}/regenerate`, {
      method: "POST",
      body: JSON.stringify({ pageIndex }),
    });
    setNote((n) => (n ? { ...n, pages: res.pages } : n));
    push("Page layout regenerated");
  }

  async function toggleShare(enabled: boolean) {
    try {
      const res = await api<{ enabled: boolean; url: string | null }>(`/api/notes/${id}/share`, {
        method: "POST",
        body: JSON.stringify({ enabled }),
      });
      setShareUrl(res.url);
      push(enabled ? "Share link enabled" : "Sharing disabled");
    } catch (e) {
      push(e instanceof Error ? e.message : "Share failed.", "err");
    }
  }

  if (error) return <p className="text-danger">{error}</p>;
  if (!note || !page) return <Skeleton className="h-96" />;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="no-print flex flex-wrap items-start justify-between gap-3">
        <div>
          <button className="text-sm text-muted" onClick={() => router.push("/notes")}>
            ← Library
          </button>
          <h1 className="mt-1 text-2xl font-semibold">{note.title}</h1>
          <p className="text-sm text-muted">
            {note.subject} · {note.sourceType} · {note.pageCount} pages
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            Print
          </Button>
          <Button size="sm" variant="secondary" onClick={exportPng} disabled={!plan.pngExport}>
            PNG
          </Button>
          <Button size="sm" variant="secondary" onClick={exportPdf} disabled={!plan.pdfExport}>
            PDF
          </Button>
          <Button size="sm" variant="secondary" onClick={regenerate} disabled={!plan.regeneratePage}>
            Regenerate page
          </Button>
          {plan.shareableLinks ? (
            shareUrl ? (
              <Button size="sm" variant="ghost" onClick={() => toggleShare(false)}>
                Disable share
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => toggleShare(true)}>
                Share link
              </Button>
            )
          ) : null}
        </div>
      </div>

      {shareUrl ? (
        <p className="no-print rounded-xl bg-lavender-soft px-3 py-2 text-sm break-all">{shareUrl}</p>
      ) : null}

      <div className="no-print flex flex-wrap items-center gap-3 text-sm">
        <button disabled={pageIndex <= 0} onClick={() => setPageIndex((p) => p - 1)}>
          Prev
        </button>
        <span>
          Page {pageIndex + 1} / {note.pages.length}
        </span>
        <button
          disabled={pageIndex >= note.pages.length - 1}
          onClick={() => setPageIndex((p) => p + 1)}
        >
          Next
        </button>
        <label className="ms-auto flex items-center gap-2">
          Zoom
          <input
            type="range"
            min={0.6}
            max={1.4}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="no-print mb-3 flex gap-2 overflow-x-auto lg:hidden">
        {note.pages.map((_, i) => (
          <button
            key={i}
            className={`shrink-0 rounded-lg border px-3 py-1 text-xs ${i === pageIndex ? "border-lavender bg-lavender-soft" : "border-line"}`}
            onClick={() => setPageIndex(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[120px_1fr]">
        <aside className="no-print hidden space-y-2 lg:block">
          {note.pages.map((_, i) => (
            <button
              key={i}
              className={`block w-full rounded-lg border px-2 py-3 text-xs ${i === pageIndex ? "border-lavender bg-lavender-soft" : "border-line bg-white"}`}
              onClick={() => setPageIndex(i)}
            >
              Page {i + 1}
            </button>
          ))}
        </aside>
        <div className="overflow-auto">
          <div ref={pageRef} style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
            <NotePageView
              blocks={page.blocks}
              style={note.handwritingStyle}
              paperStyleId={note.paperStyleId}
              language={note.language}
              pageNumber={pageIndex + 1}
              seed={page.seed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
