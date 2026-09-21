import type { HandwritingStyle, NoteBlock, NoteLanguage } from "@/lib/types";
import { getHandwritingTheme } from "@/lib/engine/handwritingThemes";
import { normalizeHandwritingStyle } from "@/lib/plans";
import { paperStyleToCssVars, resolvePaperStyle } from "@/lib/paper-styles";
import { DiagramSvg } from "./DiagramSvg";
import { cn } from "@/lib/utils";

function Highlighted({
  text,
  highlights,
}: {
  text: string;
  highlights?: { start: number; end: number; kind: string }[];
}) {
  if (!highlights?.length) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  sorted.forEach((h, i) => {
    if (h.start > cursor) parts.push(text.slice(cursor, h.start));
    parts.push(
      <mark key={i} className={`hl-${h.kind} rounded-sm px-0.5`}>
        {text.slice(h.start, h.end)}
      </mark>,
    );
    cursor = h.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

function BlockView({ block }: { block: NoteBlock }) {
  switch (block.type) {
    case "heading":
      if (block.level === 1) return <h2 className="mb-3 text-3xl">{block.text}</h2>;
      if (block.level === 2) return <h3 className="mb-2 mt-4 text-2xl">{block.text}</h3>;
      return <h4 className="mb-2 mt-3 text-xl">{block.text}</h4>;
    case "paragraph":
      return (
        <p className="mb-2">
          <Highlighted text={block.text} highlights={block.highlights} />
        </p>
      );
    case "bullets":
      return (
        <ul className="mb-2 list-disc pl-5">
          {block.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      );
    case "numbered":
      return (
        <ol className="mb-2 list-decimal pl-5">
          {block.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ol>
      );
    case "definition":
      return (
        <div className="mb-3 rounded-lg border border-violet-200 bg-white/70 p-3">
          <p className="font-semibold">{block.term}</p>
          <p>{block.meaning}</p>
        </div>
      );
    case "formula":
      return (
        <p className="mb-3 rounded-lg bg-white/80 px-3 py-2 text-center tracking-wide">
          {block.label ? `${block.label}: ` : ""}
          {block.expression}
        </p>
      );
    case "chemistry-equation":
      return (
        <p className="mb-3 rounded-lg border border-emerald-100 bg-white/80 px-3 py-2 text-center">
          {block.expression}
        </p>
      );
    case "example":
      return (
        <p className="mb-3 border-l-2 border-amber-300 pl-3">
          <span className="opacity-70">Example — </span>
          {block.text}
        </p>
      );
    case "math-problem":
      return (
        <div className="mb-3 space-y-1 rounded-lg border p-3">
          <p><strong>Given:</strong> {block.given.join("; ")}</p>
          <p><strong>Required:</strong> {block.required.join("; ")}</p>
          {block.formula ? <p><strong>Formula:</strong> {block.formula}</p> : null}
          {block.steps.length ? (
            <p><strong>Steps:</strong> {block.steps.join(" → ")}</p>
          ) : null}
          {block.answer ? <p><strong>Answer:</strong> {block.answer}</p> : null}
        </div>
      );
    case "cs-concept":
      return (
        <div className="mb-3 space-y-1 rounded-lg border p-3">
          {block.definition ? <p><strong>Definition:</strong> {block.definition}</p> : null}
          {block.syntax ? <p><strong>Syntax:</strong> {block.syntax}</p> : null}
          {block.example ? <p><strong>Example:</strong> {block.example}</p> : null}
          {block.important?.length ? (
            <p><strong>Important:</strong> {block.important.join(", ")}</p>
          ) : null}
        </div>
      );
    case "timeline":
      return (
        <ol className="mb-3 border-l pl-4">
          {block.events.map((e) => (
            <li key={e.date + e.event} className="mb-2">
              <strong>{e.date}</strong> — {e.event}
            </li>
          ))}
        </ol>
      );
    case "code":
      return (
        <pre className="mb-3 overflow-x-auto rounded-lg bg-white/80 p-3 text-[0.95em]">
          {block.code}
        </pre>
      );
    case "diagram":
      return (
        <figure className="mb-3">
          <DiagramSvg
            id={block.templateId}
            colorMode={block.colorMode}
            labelled={block.labelled !== false}
            caption={block.caption}
            flowchartTopic={block.caption}
            flowchartSteps={block.flowchartSteps}
          />
          {block.caption ? <figcaption className="text-sm opacity-70">{block.caption}</figcaption> : null}
        </figure>
      );
    case "timestamp":
      return (
        <p className="mb-2 text-sm">
          {block.videoId ? (
            <a
              className="underline decoration-dotted"
              href={`https://www.youtube.com/watch?v=${block.videoId}&t=${block.seconds}s`}
              target="_blank"
              rel="noreferrer"
            >
              {Math.floor(block.seconds / 60)}:{String(block.seconds % 60).padStart(2, "0")} · {block.label}
            </a>
          ) : (
            <span>
              {block.seconds}s · {block.label}
            </span>
          )}
        </p>
      );
    case "callout":
      return (
        <p className={cn("mb-3 rounded-lg px-3 py-2", `hl-${block.kind}`)}>{block.text}</p>
      );
  }
}

export function NotePageView({
  blocks,
  style,
  language,
  pageNumber,
  seed,
  paperStyleId,
}: {
  blocks: NoteBlock[];
  style: HandwritingStyle;
  language: NoteLanguage;
  pageNumber: number;
  seed?: number;
  paperStyleId?: string | null;
}) {
  const theme = getHandwritingTheme(normalizeHandwritingStyle(style));
  const paper = resolvePaperStyle(paperStyleId);
  const rotate = ((seed ?? 1) % 3) - 1;
  const paperVars = paper ? paperStyleToCssVars(paper) : null;

  return (
    <article
      className={cn(
        "note-page",
        paper && "note-page--custom-paper paper-surface",
        paper?.dark && "paper-surface--dark",
        theme.fontClass,
        language === "urdu" && "font-urdu text-right",
      )}
      data-paper={paper?.id}
      data-pattern={paper?.pattern.kind}
      style={{
        ...(paperVars || {
          background: theme.paper,
          ["--rule" as string]: theme.rule,
          ["--margin-line" as string]: theme.marginLine,
        }),
        lineHeight: theme.lineHeight,
        letterSpacing: theme.letterSpacing,
        fontSize: theme.fontSize,
        transform: `rotate(${rotate * 0.15}deg)`,
      }}
    >
      {paper ? <div className="paper-surface__layers" aria-hidden /> : null}
      <div className="note-inner">
        {theme.decoration === "stars" ? <p className="mb-2 text-lavender">✦ ✦ ✦</p> : null}
        {theme.decoration === "journal" ? (
          <p className="mb-3 border-b border-dashed border-stone-300 pb-2 text-sm opacity-60">Study journal</p>
        ) : null}
        {blocks.map((b, i) => (
          <div key={i} className={theme.headingClass}>
            <BlockView block={b} />
          </div>
        ))}
        <p className="mt-8 text-right text-sm opacity-50">p. {pageNumber}</p>
      </div>
    </article>
  );
}
