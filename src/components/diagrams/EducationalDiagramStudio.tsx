"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { listScientificTitles } from "@/lib/diagrams/registry";
import { matchScientificTopic } from "@/lib/diagrams/matcher";
import { sanitizeDiagramText } from "@/lib/diagrams/types";
import type {
  DiagramColorMode,
  DiagramKind,
  DiagramTemplateId,
  GenerationOptions,
  PlanId,
  PublicUser,
} from "@/lib/types";
import { getPlan } from "@/lib/plans";
import { canUseSource } from "@/lib/entitlements";
import { FlowchartDiagram } from "./FlowchartDiagram";
import { ScientificDiagram } from "./ScientificDiagram";
import { cn } from "@/lib/utils";

type PreviewState =
  | { status: "idle" }
  | { status: "empty" }
  | { status: "unsupported"; suggestions: string[] }
  | {
      status: "ready";
      kind: DiagramKind;
      topic: string;
      templateId: DiagramTemplateId;
      colorMode: DiagramColorMode;
      labelled: boolean;
      orientation: "vertical" | "horizontal";
    };

const DEFAULT_OPTIONS: GenerationOptions = {
  handwritingStyle: "clean-study",
  noteLength: "quick",
  language: "english",
  subject: "auto",
  smartHighlighting: false,
  importantPoints: false,
  formulas: false,
  examples: false,
  diagrams: true,
  chapterDetection: false,
  diagramStyle: "handwritten",
};

export function EducationalDiagramStudio() {
  const router = useRouter();
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [topic, setTopic] = useState("");
  const [kind, setKind] = useState<DiagramKind>("scientific");
  const [colorMode, setColorMode] = useState<DiagramColorMode>("color");
  const [labelled, setLabelled] = useState(true);
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [preview, setPreview] = useState<PreviewState>({ status: "idle" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");

  useEffect(() => {
    api<{ user: PublicUser }>("/api/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  const plan = user ? getPlan(user.planId as PlanId) : getPlan("free");
  const allowed = canUseSource(plan.id, "diagram");

  function generate() {
    setError("");
    const cleaned = sanitizeDiagramText(topic, 120);
    if (!cleaned) {
      setPreview({ status: "empty" });
      return;
    }

    if (kind === "scientific") {
      const match = matchScientificTopic(cleaned);
      if (!match.ok) {
        setPreview({ status: "unsupported", suggestions: match.suggestions });
        return;
      }
      setPreview({
        status: "ready",
        kind: "scientific",
        topic: cleaned,
        templateId: match.id,
        colorMode,
        labelled,
        orientation,
      });
      return;
    }

    setPreview({
      status: "ready",
      kind: "flowchart",
      topic: cleaned,
      templateId: "flowchart",
      colorMode,
      labelled,
      orientation,
    });
  }

  async function saveToNotes() {
    if (preview.status !== "ready") return;
    if (!allowed) {
      setError(`${plan.name} plan does not include diagram generation.`);
      return;
    }
    setBusy(true);
    setError("");
    setStage("Saving…");
    try {
      const options: GenerationOptions = {
        ...DEFAULT_OPTIONS,
        handwritingStyle: plan.handwritingStyles[0] || "clean-study",
        noteLength: plan.noteLengths[0] || "quick",
        language: plan.languages[0] || "english",
        diagrams: true,
        diagramStyle: "clean-study",
        diagramPrompt: preview.topic,
        diagramTemplate: preview.templateId,
        diagramKind: preview.kind,
        diagramColorMode: preview.kind === "scientific" ? preview.colorMode : undefined,
        diagramLabelled: preview.kind === "scientific" ? preview.labelled : undefined,
      };
      const { jobId } = await api<{ jobId: string }>("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          sourceType: "diagram",
          title: preview.topic.slice(0, 80),
          text: preview.topic,
          options,
        }),
      });
      for (let i = 0; i < 90; i++) {
        await new Promise((r) => setTimeout(r, 600));
        const job = await api<{
          state: string;
          stage: string;
          progress: number;
          noteId?: string;
          error?: string;
        }>(`/api/jobs/${jobId}`);
        setStage(job.stage || "Working…");
        if (job.state === "completed" && job.noteId) {
          router.push(`/notes/${job.noteId}`);
          return;
        }
        if (job.state === "failed") {
          throw new Error(job.error || "Could not save diagram.");
        }
      }
      throw new Error("Timed out while saving. Try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
      setStage("");
    }
  }

  function downloadSvg() {
    try {
      const svg = svgWrapRef.current?.querySelector("svg");
      if (!svg) {
        setError("Nothing to download yet. Generate a diagram first.");
        return;
      }
      const clone = svg.cloneNode(true) as SVGElement;
      if (!clone.getAttribute("xmlns")) {
        clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      }
      const blob = new Blob([new XMLSerializer().serializeToString(clone)], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const name =
        preview.status === "ready"
          ? `${preview.topic.replace(/\s+/g, "-").toLowerCase() || "diagram"}.svg`
          : "diagram.svg";
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Download failed. Try again.");
    }
  }

  function printDiagram() {
    const svg = svgWrapRef.current?.querySelector("svg");
    if (!svg) {
      setError("Nothing to print yet. Generate a diagram first.");
      return;
    }
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!w) {
      setError("Pop-up blocked. Allow pop-ups to print.");
      return;
    }
    const markup = new XMLSerializer().serializeToString(svg);
    w.document.write(`<!doctype html><html><head><title>Print diagram</title>
      <style>
        @page { margin: 12mm; }
        html, body { margin: 0; background: #fff; }
        .wrap { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        svg { max-width: 100%; max-height: 90vh; }
      </style></head><body><div class="wrap">${markup}</div>
      <script>window.onload=()=>{window.print();}</script></body></html>`);
    w.document.close();
  }

  function createAnother() {
    setPreview({ status: "idle" });
    setTopic("");
    setError("");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Educational Diagram Generator</h1>
        <p className="mt-1 text-sm text-muted">
          Deterministic SVG templates and flowcharts — no generative AI, no external image APIs.
        </p>
      </div>

      {!allowed ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          Diagram generation is not included in the {plan.name} plan.{" "}
          <a className="underline" href="/billing">
            Upgrade
          </a>
        </p>
      ) : null}

      <Field label="Topic" htmlFor="diag-topic">
        <Input
          id="diag-topic"
          placeholder="e.g. Human Kidney"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") generate();
          }}
        />
      </Field>

      <div>
        <p className="mb-2 text-sm font-medium">Diagram Type</p>
        <div className="flex flex-wrap gap-2">
          <ToggleBtn active={kind === "flowchart"} onClick={() => setKind("flowchart")}>
            Flowchart
          </ToggleBtn>
          <ToggleBtn active={kind === "scientific"} onClick={() => setKind("scientific")}>
            Scientific Diagram
          </ToggleBtn>
        </div>
      </div>

      {kind === "scientific" ? (
        <>
          <div>
            <p className="mb-2 text-sm font-medium">Style</p>
            <div className="flex flex-wrap gap-2">
              <ToggleBtn active={colorMode === "color"} onClick={() => setColorMode("color")}>
                Color
              </ToggleBtn>
              <ToggleBtn active={colorMode === "bw"} onClick={() => setColorMode("bw")}>
                Black & White
              </ToggleBtn>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Labels</p>
            <div className="flex flex-wrap gap-2">
              <ToggleBtn active={labelled} onClick={() => setLabelled(true)}>
                Labelled
              </ToggleBtn>
              <ToggleBtn active={!labelled} onClick={() => setLabelled(false)}>
                Unlabelled
              </ToggleBtn>
            </div>
          </div>
          <p className="text-xs text-muted">
            Supported: {listScientificTitles().join(" · ")}
          </p>
        </>
      ) : (
        <div>
          <p className="mb-2 text-sm font-medium">Layout</p>
          <div className="flex flex-wrap gap-2">
            <ToggleBtn active={orientation === "vertical"} onClick={() => setOrientation("vertical")}>
              Vertical
            </ToggleBtn>
            <ToggleBtn
              active={orientation === "horizontal"}
              onClick={() => setOrientation("horizontal")}
            >
              Horizontal
            </ToggleBtn>
          </div>
        </div>
      )}

      <Button onClick={generate} disabled={!allowed}>
        Generate Diagram
      </Button>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {stage ? <p className="text-sm text-muted">{stage}</p> : null}

      {preview.status === "empty" ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted">
          Enter a topic to generate a diagram.
        </p>
      ) : null}

      {preview.status === "unsupported" ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-5">
          <p className="font-medium">
            That diagram isn&apos;t available yet. Try one of our supported educational diagrams.
          </p>
          <p className="mt-3 text-sm text-muted">Suggested:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {preview.suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-stone-100"
                  onClick={() => {
                    setTopic(s);
                    setKind("scientific");
                  }}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {preview.status === "ready" ? (
        <div className="space-y-4">
          <div
            ref={svgWrapRef}
            className="diagram-print-root overflow-x-auto rounded-xl border bg-white p-3 sm:p-6"
          >
            {preview.kind === "scientific" ? (
              <ScientificDiagram
                templateId={preview.templateId}
                colorMode={preview.colorMode}
                labelled={preview.labelled}
                title={preview.topic}
              />
            ) : (
              <FlowchartDiagram topic={preview.topic} orientation={preview.orientation} />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveToNotes} disabled={busy || !allowed}>
              {busy ? "Saving…" : "Save to Notes"}
            </Button>
            <Button variant="secondary" onClick={downloadSvg}>
              Download
            </Button>
            <Button variant="secondary" onClick={printDiagram}>
              Print
            </Button>
            <Button variant="ghost" onClick={createAnother}>
              Create Another
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm transition",
        active ? "border-stone-800 bg-stone-900 text-white" : "bg-white hover:bg-stone-50",
      )}
    >
      {children}
    </button>
  );
}
