"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { NotePageView } from "@/components/notes/NotePageView";
import { Skeleton } from "@/components/ui/EmptyState";
import type { HandwritingStyle, NoteLanguage, NotePage } from "@/lib/types";

export default function SharedNotePage() {
  const { token } = useParams<{ token: string }>();
  const [note, setNote] = useState<{
    title: string;
    pages: NotePage[];
    handwritingStyle: HandwritingStyle;
    language: NoteLanguage;
  } | null>(null);
  const [error, setError] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    api<{ note: typeof note }>(`/api/share/${token}`)
      .then((d) => setNote(d.note))
      .catch((e) => setError(e instanceof Error ? e.message : "Not available."));
  }, [token]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold">Shared note</h1>
        <p className="mt-3 text-danger">{error}</p>
      </main>
    );
  }
  if (!note) return <main className="p-8"><Skeleton className="h-64" /></main>;
  const page = note.pages[pageIndex];

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">{note.title}</h1>
      <div className="flex gap-2 text-sm">
        <button disabled={pageIndex <= 0} onClick={() => setPageIndex((p) => p - 1)}>
          Prev
        </button>
        <span>
          {pageIndex + 1} / {note.pages.length}
        </span>
        <button
          disabled={pageIndex >= note.pages.length - 1}
          onClick={() => setPageIndex((p) => p + 1)}
        >
          Next
        </button>
      </div>
      {page ? (
        <NotePageView
          blocks={page.blocks}
          style={note.handwritingStyle}
          language={note.language}
          pageNumber={pageIndex + 1}
          seed={page.seed}
        />
      ) : null}
    </main>
  );
}
