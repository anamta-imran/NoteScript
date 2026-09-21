import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { paperStyleToCssVars, resolvePaperStyle } from "@/lib/paper-styles";

export function PaperBackground({
  paperStyleId,
  className,
  style,
  children,
}: {
  paperStyleId?: string | null;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  const paper = resolvePaperStyle(paperStyleId);
  if (!paper) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const vars = paperStyleToCssVars(paper);
  return (
    <div
      className={cn("paper-surface", paper.dark && "paper-surface--dark", className)}
      style={{ ...vars, ...style }}
      data-paper={paper.id}
    >
      <div className="paper-surface__layers" aria-hidden />
      {children}
    </div>
  );
}
