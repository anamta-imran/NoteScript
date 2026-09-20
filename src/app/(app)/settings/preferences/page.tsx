"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { SELECTABLE_STYLES, getHandwritingTheme } from "@/lib/engine/handwritingThemes";
import { getPlan } from "@/lib/plans";
import type { HandwritingStyle, InterfaceLanguage, NoteLanguage, NoteLength, PlanId, PublicUser } from "@/lib/types";

export default function PreferencesPage() {
  const { push } = useToast();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage>("en");
  const [preferredLanguage, setPreferredLanguage] = useState<NoteLanguage>("english");
  const [preferredHandwritingStyle, setPreferredHandwritingStyle] =
    useState<HandwritingStyle>("clean-study");
  const [preferredNoteLength, setPreferredNoteLength] = useState<NoteLength>("standard");

  useEffect(() => {
    api<{ user: PublicUser }>("/api/auth/me").then((d) => {
      setUser(d.user);
      setInterfaceLanguage(d.user.interfaceLanguage || "en");
      setPreferredLanguage(d.user.preferredLanguage);
      setPreferredHandwritingStyle(d.user.preferredHandwritingStyle || "clean-study");
      setPreferredNoteLength(d.user.preferredNoteLength);
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await api<{ user: PublicUser }>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({
        interfaceLanguage,
        preferredLanguage,
        preferredHandwritingStyle,
        preferredNoteLength,
      }),
    });
    setUser(res.user);
    push("Preferences saved");
  }

  if (!user) return <Skeleton className="h-48" />;
  const plan = getPlan(user.planId as PlanId);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Preferences</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Interface language" htmlFor="ui-lang">
          <Select
            id="ui-lang"
            value={interfaceLanguage}
            onChange={(e) => setInterfaceLanguage(e.target.value as InterfaceLanguage)}
          >
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </Select>
        </Field>
        <Field label="Default note language" htmlFor="note-lang">
          <Select
            id="note-lang"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value as NoteLanguage)}
          >
            {plan.languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Default handwriting style" htmlFor="style">
          <Select
            id="style"
            value={preferredHandwritingStyle}
            onChange={(e) => setPreferredHandwritingStyle(e.target.value as HandwritingStyle)}
          >
            {SELECTABLE_STYLES.map((s) => {
              const theme = getHandwritingTheme(s);
              const locked = !plan.handwritingStyles.includes(s);
              return (
                <option key={s} value={s} disabled={locked}>
                  {theme.label}
                  {locked ? ` (🔒 ${theme.minPlan})` : ""}
                </option>
              );
            })}
          </Select>
        </Field>
        <Field label="Default note length" htmlFor="len">
          <Select
            id="len"
            value={preferredNoteLength}
            onChange={(e) => setPreferredNoteLength(e.target.value as NoteLength)}
          >
            {plan.noteLengths.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit">Save preferences</Button>
      </form>
    </div>
  );
}
