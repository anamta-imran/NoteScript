"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

type Folder = { id: string; name: string; noteCount: number };

export default function FoldersPage() {
  const { push } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ folders: Folder[] }>("/api/folders");
      setFolders(data.folders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load folders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/folders", { method: "POST", body: JSON.stringify({ name }) });
      setName("");
      push("Folder created");
      load();
    } catch (err) {
      push(err instanceof Error ? err.message : "Could not create folder.", "err");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this folder? Notes will be unassigned, not deleted.")) return;
    await api(`/api/folders/${id}`, { method: "DELETE" });
    push("Folder deleted");
    load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Folders</h1>
        <p className="mt-1 text-sm text-muted">Organize notes by subject or semester.</p>
      </div>

      <form onSubmit={create} className="flex flex-wrap gap-2">
        <Field label="New folder" htmlFor="folder">
          <Input id="folder" value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <div className="flex items-end">
          <Button type="submit">Create</Button>
        </div>
      </form>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {loading ? <Skeleton className="h-32" /> : null}

      {!loading && folders.length === 0 ? (
        <EmptyState title="No folders yet." body="Create a folder to organize your notes." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {folders.map((f) => (
            <li key={f.id} className="rounded-2xl border border-line bg-white p-4">
              <Link href={`/folders/${f.id}`} className="font-medium">
                {f.name}
              </Link>
              <p className="mt-1 text-xs text-muted">{f.noteCount} notes</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" href={`/folders/${f.id}`}>
                  Open
                </Button>
                <Button size="sm" variant="danger" onClick={() => remove(f.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
