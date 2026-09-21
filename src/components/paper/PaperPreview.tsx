import { cn } from "@/lib/utils";
import { paperStyleToCssVars, resolvePaperStyle } from "@/lib/paper-styles";

export function PaperPreview({
  paperStyleId,
  selected,
  className,
}: {
  paperStyleId: string;
  selected?: boolean;
  className?: string;
}) {
  const paper = resolvePaperStyle(paperStyleId);
  if (!paper) {
    return <div className={cn("h-16 rounded-lg border bg-white", className)} />;
  }
  const vars = paperStyleToCssVars(paper);
  return (
    <div
      className={cn(
        "paper-preview relative h-16 overflow-hidden rounded-lg border",
        selected ? "border-lavender ring-2 ring-lavender/30" : "border-line",
        className,
      )}
      style={vars}
      data-paper={paper.id}
      data-pattern={paper.pattern.kind}
      aria-hidden
    >
      <div className="paper-surface__layers absolute inset-0" />
      <div className="relative z-[1] p-2">
        <div
          className="h-1.5 w-10 rounded-full opacity-40"
          style={{ background: paper.ink || (paper.dark ? "#ddd" : "#333") }}
        />
        <div
          className="mt-1.5 h-1 w-14 rounded-full opacity-25"
          style={{ background: paper.ink || (paper.dark ? "#ddd" : "#333") }}
        />
      </div>
    </div>
  );
}
