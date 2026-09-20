"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

export default function FolderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { push } = useToast();
  const [folder, setFolder] = useState<{ id: string; name: string } | null>(null);
  const [notes, setNotes] = useState<
    { id: string; title: string; subject: string; pageCount: number; updatedAt: string }[]
  >([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<{
      folder: { id: string; name: string };
      notes: { id: string; title: string; subject: string; pageCount: number; updatedAt: string }[];
    }>(`/api/folders/${id}`)
      .then((d) => {
        setFolder(d.folder);
        setName(d.folder.name);
        setNotes(d.notes);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Folder not found."));
  }, [id]);

  async function rename() {
    await api(`/api/folders/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
    push("Folder renamed");
    setFolder((f) => (f ? { ...f, name } : f));
  }

  if (error) return <p className="text-danger">{error}</p>;
  if (!folder) return <Skeleton className="h-40" />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/folders" className="text-sm text-muted">
        ← Folders
      </Link>
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Folder name" htmlFor="name">
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Button onClick={rename}>Rename</Button>
      </div>
      {notes.length === 0 ? (
        <p className="text-sm text-muted">No notes in this folder yet.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id}>
              <Link href={`/notes/${n.id}`} className="block rounded-xl border border-line bg-white p-4">
                <p className="font-medium">{n.title}</p>
                <p className="text-xs text-muted">
                  {n.subject} · {n.pageCount} pages · {formatDate(n.updatedAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
