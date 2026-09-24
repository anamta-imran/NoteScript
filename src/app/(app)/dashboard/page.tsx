"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/EmptyState";
import { FreeDashboard } from "@/components/dashboard/FreeDashboard";
import { PaidDashboard } from "@/components/dashboard/PaidDashboard";
import type { PublicUser, UsageSnapshot } from "@/lib/types";

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

  if (me.user.planId === "free") {
    return <FreeDashboard me={me} notes={notes} folders={folders} />;
  }

  return <PaidDashboard me={me} notes={notes} folders={folders} />;
}
