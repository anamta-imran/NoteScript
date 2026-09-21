"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { wordCount, cn } from "@/lib/utils";
import { getPlan } from "@/lib/plans";
import { SELECTABLE_STYLES, getHandwritingTheme } from "@/lib/engine/handwritingThemes";
import type {
  DiagramStyle,
  DiagramTemplateId,
  GenerationOptions,
  HandwritingStyle,
  PaperStyleId,
  PlanId,
  PublicUser,
  SourceType,
} from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { PaperStylePicker } from "@/components/paper/PaperStylePicker";
import { DEFAULT_PAPER_STYLE_ID } from "@/lib/paper-styles";

const DEFAULT_OPTIONS: GenerationOptions = {
  handwritingStyle: "clean-study",
  noteLength: "quick",
  language: "english",
  subject: "auto",
  smartHighlighting: false,
  importantPoints: true,
  formulas: true,
  examples: true,
  diagrams: false,
  chapterDetection: false,
  diagramStyle: "handwritten",
  paperStyleId: DEFAULT_PAPER_STYLE_ID as PaperStyleId,
};

export function CreateNoteForm({ sourceType }: { sourceType: SourceType }) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [fileId, setFileId] = useState("");
  const [fileName, setFileName] = useState("");
  const [ocrPreview, setOcrPreview] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [options, setOptions] = useState<GenerationOptions>(DEFAULT_OPTIONS);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState("");

  useEffect(() => {
    api<{ user: PublicUser }>("/api/auth/me").then((d) => {
      setUser(d.user);
      const plan = getPlan(d.user.planId as PlanId);
      const style = plan.handwritingStyles.includes(d.user.preferredHandwritingStyle)
        ? d.user.preferredHandwritingStyle
        : plan.handwritingStyles[0];
      setOptions((o) => ({
        ...o,
        handwritingStyle: style,
        noteLength: plan.noteLengths.includes(d.user.preferredNoteLength)
          ? d.user.preferredNoteLength
          : plan.noteLengths[0],
        language: plan.languages.includes(d.user.preferredLanguage)
          ? d.user.preferredLanguage
          : plan.languages[0],
        diagrams: sourceType === "diagram" ? true : o.diagrams,
      }));
    });
  }, [sourceType]);

  const plan = user ? getPlan(user.planId as PlanId) : getPlan("free");
  const allowed = plan.allowedSources.includes(sourceType);

  const optionFields = useMemo(() => {
    const showHighlight = sourceType !== "diagram";
    return { showHighlight };
  }, [sourceType]);

  async function upload(kind: "pdf" | "image", file: File) {
    setError("");
    const fd = new FormData();
    fd.set("file", file);
    fd.set("kind", kind);
    const res = await fetch("/api/uploads", { method: "POST", body: fd, credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed.");
    setFileId(data.fileId);
    setFileName(data.name);
    if (data.ocrText) {
      setOcrPreview(data.ocrText);
      setText(data.ocrText);
    }
    setWarnings(data.warnings || []);
  }

  async function fetchTranscript() {
    setError("");
    setBusy(true);
    try {
      const res = await api<{ text: string }>("/api/youtube/preview", {
        method: "POST",
        body: JSON.stringify({ url: youtubeUrl }),
      });
      setText(res.text);
      setWarnings([]);
    } catch (e) {
      setText("");
      setError(
        e instanceof Error
          ? e.message
          : "This video doesn't have an accessible transcript. Try another video or paste the transcript manually.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    setError("");
    setBusy(true);
    try {
      const payload = {
        sourceType,
        title,
        text:
          sourceType === "diagram"
            ? options.diagramPrompt || text
            : sourceType === "image"
              ? text || ocrPreview
              : text,
        youtubeUrl: sourceType === "youtube" ? youtubeUrl : undefined,
        fileId: fileId || undefined,
        options: {
          ...options,
          diagrams: sourceType === "diagram" ? true : options.diagrams,
          diagramPrompt: sourceType === "diagram" ? options.diagramPrompt || text : undefined,
        },
      };
      const { jobId } = await api<{ jobId: string }>("/api/jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const timer = window.setInterval(async () => {
        const job = await api<{
          state: string;
          stage: string;
          progress: number;
          error?: string;
          noteId: string | null;
        }>(`/api/jobs/${jobId}`);
        setStage(job.stage);
        setProgress(job.progress);
        if (job.state === "completed" && job.noteId) {
          window.clearInterval(timer);
          router.push(`/notes/${job.noteId}`);
        }
        if (job.state === "failed") {
          window.clearInterval(timer);
          setBusy(false);
          setError(job.error || "Processing failed.");
        }
      }, 800);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not start generation.";
      if (msg.toLowerCase().includes("upgrade") || msg.includes("generations") || msg.includes("plan")) {
        setUpgradeMsg(msg);
        setUpgradeOpen(true);
      } else {
        setError(msg);
      }
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold capitalize">
        {sourceType === "diagram" ? "Add diagram" : `Create from ${sourceType}`}
      </h1>
      {!allowed ? (
        <p className="rounded-xl bg-lavender-soft p-4 text-sm">
          {sourceType} is not included in the {plan.name} plan.{" "}
          <a className="underline" href="/billing">
            Upgrade
          </a>
        </p>
      ) : null}

      <Field label="Title (optional)" htmlFor="title">
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>

      {sourceType === "text" ? (
        <div>
          <Field label="Study text" htmlFor="text">
            <Textarea
              id="text"
              rows={14}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={plan.maxInputChars}
            />
          </Field>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
            <span>{text.length} characters</span>
            <span>{wordCount(text)} words</span>
            <Button type="button" size="sm" variant="ghost" onClick={() => setText("")}>
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={async () => setText(await navigator.clipboard.readText())}
            >
              Paste
            </Button>
          </div>
        </div>
      ) : null}

      {sourceType === "youtube" ? (
        <div className="space-y-3">
          <Field label="YouTube URL" htmlFor="yt">
            <Input id="yt" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
          </Field>
          <Button type="button" variant="secondary" onClick={fetchTranscript} disabled={busy}>
            Fetch captions
          </Button>
          <Field
            label="Transcript (editable — paste manually if captions are unavailable)"
            htmlFor="transcript"
          >
            <Textarea id="transcript" rows={10} value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
        </div>
      ) : null}

      {sourceType === "pdf" || sourceType === "image" ? (
        <div className="space-y-3">
          <Field label={sourceType === "pdf" ? "PDF file" : "Image (JPG, PNG, WEBP)"} htmlFor="file">
            <Input
              id="file"
              type="file"
              accept={sourceType === "pdf" ? "application/pdf" : "image/jpeg,image/png,image/webp"}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(sourceType === "pdf" ? "pdf" : "image", f).catch((err) => setError(err.message));
              }}
            />
          </Field>
          {fileName ? <p className="text-sm text-muted">Uploaded: {fileName}</p> : null}
          {sourceType === "image" ? (
            <Field label="Extracted text (edit before generating)" htmlFor="ocr">
              <Textarea id="ocr" rows={10} value={text} onChange={(e) => setText(e.target.value)} />
            </Field>
          ) : null}
        </div>
      ) : null}

      {sourceType === "diagram" ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Turn a description or reference into a clean handwritten study sketch — not generative AI art.
          </p>
          <Field label="Option A — describe the diagram" htmlFor="diag-prompt">
            <Textarea
              id="diag-prompt"
              rows={5}
              placeholder='e.g. "Draw the water cycle with evaporation, condensation, precipitation and collection."'
              value={options.diagramPrompt || ""}
              onChange={(e) => setOptions({ ...options, diagramPrompt: e.target.value })}
            />
          </Field>
          <Field label="Option B — upload a reference diagram (optional)" htmlFor="diag-file">
            <Input
              id="diag-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload("image", f).catch((err) => setError(err.message));
              }}
            />
          </Field>
          {fileName ? <p className="text-sm text-muted">Reference: {fileName}</p> : null}
          <Field label="Diagram style" htmlFor="diag-style">
            <Select
              id="diag-style"
              value={options.diagramStyle || "handwritten"}
              onChange={(e) =>
                setOptions({ ...options, diagramStyle: e.target.value as DiagramStyle })
              }
            >
              {plan.diagramStyles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Template (optional)" htmlFor="diag-tpl">
            <Select
              id="diag-tpl"
              value={options.diagramTemplate || ""}
              onChange={(e) =>
                setOptions({
                  ...options,
                  diagramTemplate: (e.target.value || undefined) as DiagramTemplateId | undefined,
                })
              }
            >
              <option value="">Auto from description</option>
              {[
                "water-cycle",
                "flowchart",
                "process-arrows",
                "cell-simple",
                "atom-simple",
                "circuit-simple",
                "force-diagram",
                "timeline",
                "algorithm-box",
                "blank-labeled",
              ].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      ) : null}

      {warnings.map((w) => (
        <p key={w} className="text-sm text-muted">
          {w}
        </p>
      ))}

      <div>
        <p className="mb-2 text-sm font-medium">Handwriting style</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SELECTABLE_STYLES.map((s) => {
            const theme = getHandwritingTheme(s);
            const locked = !plan.handwritingStyles.includes(s);
            const selected = options.handwritingStyle === s;
            return (
              <button
                key={s}
                type="button"
                disabled={locked}
                onClick={() => setOptions({ ...options, handwritingStyle: s as HandwritingStyle })}
                className={cn(
                  "rounded-xl border p-3 text-start transition",
                  selected ? "border-lavender bg-lavender-soft/60" : "border-line bg-white",
                  locked && "opacity-60",
                )}
              >
                <p className={`${theme.fontClass} text-lg`}>{theme.label}</p>
                <p className="mt-1 text-xs text-muted">{theme.description}</p>
                <p className={`${theme.fontClass} mt-2 text-base opacity-80`}>{theme.sample}</p>
                {locked ? (
                  <p className="mt-2 text-xs font-medium text-muted">
                    🔒 Available with {theme.minPlan}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {sourceType !== "diagram" ? (
        <div>
          <p className="mb-1 text-sm font-medium">Paper style</p>
          <p className="mb-3 text-xs text-muted">
            Choose what the notes are written on — independent from handwriting.
          </p>
          <PaperStylePicker
            value={options.paperStyleId || DEFAULT_PAPER_STYLE_ID}
            allowedIds={plan.paperStyles}
            compact
            onChange={(id) =>
              setOptions({ ...options, paperStyleId: id as PaperStyleId })
            }
          />
        </div>
      ) : null}

      {sourceType !== "diagram" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Note length" htmlFor="len">
            <Select
              id="len"
              value={options.noteLength}
              onChange={(e) =>
                setOptions({
                  ...options,
                  noteLength: e.target.value as GenerationOptions["noteLength"],
                })
              }
            >
              {plan.noteLengths.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Note language" htmlFor="lang">
            <Select
              id="lang"
              value={options.language}
              onChange={(e) =>
                setOptions({
                  ...options,
                  language: e.target.value as GenerationOptions["language"],
                })
              }
            >
              {plan.languages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Subject" htmlFor="subj">
            <Select
              id="subj"
              value={options.subject}
              onChange={(e) =>
                setOptions({ ...options, subject: e.target.value as GenerationOptions["subject"] })
              }
            >
              {[
                "auto",
                "mathematics",
                "computer-science",
                "biology",
                "chemistry",
                "physics",
                "history",
                "general",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      ) : null}

      {sourceType !== "diagram" ? (
        <fieldset className="grid gap-2 text-sm">
          <legend className="mb-1 font-medium">Options</legend>
          {optionFields.showHighlight ? (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.smartHighlighting}
                disabled={!plan.smartHighlighting}
                onChange={(e) => setOptions({ ...options, smartHighlighting: e.target.checked })}
              />
              Smart highlighting
            </label>
          ) : null}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.importantPoints}
              onChange={(e) => setOptions({ ...options, importantPoints: e.target.checked })}
            />
            Important points
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.formulas}
              onChange={(e) => setOptions({ ...options, formulas: e.target.checked })}
            />
            Formulas
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.examples}
              onChange={(e) => setOptions({ ...options, examples: e.target.checked })}
            />
            Examples
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.diagrams}
              disabled={!plan.diagrams}
              onChange={(e) => setOptions({ ...options, diagrams: e.target.checked })}
            />
            Diagram templates
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.chapterDetection}
              disabled={!plan.chapterDetection}
              onChange={(e) => setOptions({ ...options, chapterDetection: e.target.checked })}
            />
            Chapter detection
          </label>
        </fieldset>
      ) : null}

      {stage ? (
        <div>
          <p className="text-sm">{stage}</p>
          <div className="mt-2 h-2 rounded-full bg-lavender-soft">
            <div className="h-full rounded-full bg-lavender" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button onClick={generate} disabled={busy || !allowed}>
        {busy ? "Working…" : sourceType === "diagram" ? "Generate diagram" : "Generate notes"}
      </Button>

      <Modal open={upgradeOpen} title="Plan limit reached" onClose={() => setUpgradeOpen(false)}>
        <p className="text-sm text-muted">{upgradeMsg}</p>
        <div className="mt-4 flex gap-2">
          <Button href="/billing">See plans</Button>
          <Button variant="secondary" onClick={() => setUpgradeOpen(false)}>
            Stay on this plan
          </Button>
        </div>
      </Modal>
    </div>
  );
}
