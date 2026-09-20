"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { PublicUser } from "@/lib/types";

export default function ProfileSettingsPage() {
  const { push } = useToast();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    api<{ user: PublicUser }>("/api/auth/me").then((d) => {
      setUser(d.user);
      setName(d.user.name);
      setTimezone(d.user.timezone);
      setAvatarUrl(d.user.avatarUrl || "");
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await api<{ user: PublicUser }>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({ name, timezone, avatarUrl: avatarUrl || undefined }),
    });
    setUser(res.user);
    push("Profile saved");
  }

  async function uploadAvatar(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("kind", "avatar");
    const res = await fetch("/api/uploads", { method: "POST", body: fd, credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    setAvatarUrl(data.url);
  }

  if (!user) return <Skeleton className="h-48" />;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Name" htmlFor="name">
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Email" htmlFor="email" hint="Email cannot be changed here.">
          <Input id="email" value={user.email} disabled />
        </Field>
        <Field label="Timezone" htmlFor="tz">
          <Input id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        </Field>
        <Field label="Avatar" htmlFor="avatar">
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadAvatar(f).catch((err) => push(err.message, "err"));
            }}
          />
        </Field>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : null}
        <Button type="submit">Save profile</Button>
      </form>
    </div>
  );
}
