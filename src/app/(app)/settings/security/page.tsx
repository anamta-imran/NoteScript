"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export default function SecuritySettingsPage() {
  const { push } = useToast();
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await api("/api/settings", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: form.get("currentPassword"),
          password: form.get("password"),
          confirmPassword: form.get("confirmPassword"),
        }),
      });
      push("Password updated");
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    }
  }

  async function deleteAccount() {
    if (!confirm("Permanently delete your account and all notes?")) return;
    await api("/api/settings", { method: "DELETE" });
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Security</h1>
        <p className="mt-1 text-sm text-muted">Change password or delete your account.</p>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Current password" htmlFor="currentPassword">
          <Input id="currentPassword" name="currentPassword" type="password" required />
        </Field>
        <Field label="New password" htmlFor="password">
          <Input id="password" name="password" type="password" required />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword">
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit">Update password</Button>
      </form>
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <h2 className="font-medium text-danger">Delete account</h2>
        <p className="mt-1 text-sm text-muted">This permanently removes your notes and folders.</p>
        <Button variant="danger" className="mt-3" onClick={deleteAccount}>
          Delete my account
        </Button>
      </div>
    </div>
  );
}
