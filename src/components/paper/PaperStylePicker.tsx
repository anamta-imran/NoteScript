"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  PAPER_STYLES,
  listPaperCategories,
  type PaperCategory,
} from "@/lib/paper-styles";
import { PaperPreview } from "./PaperPreview";

export function PaperStylePicker({
  value,
  onChange,
  allowedIds,
  compact,
}: {
  value?: string;
  onChange: (id: string) => void;
  allowedIds?: string[];
  compact?: boolean;
}) {
  const [category, setCategory] = useState<PaperCategory | "all">("all");
  const categories = listPaperCategories();

  const styles = useMemo(() => {
    let list = PAPER_STYLES;
    if (allowedIds) {
      const set = new Set(allowedIds);
      list = list.filter((s) => set.has(s.id));
    }
    if (category !== "all") list = list.filter((s) => s.category === category);
    return list;
  }, [allowedIds, category]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
          All ({allowedIds ? allowedIds.length : PAPER_STYLES.length})
        </FilterChip>
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </FilterChip>
        ))}
      </div>

      <div
        className={cn(
          "grid gap-2",
          compact ? "max-h-72 grid-cols-2 overflow-y-auto sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        )}
      >
        {styles.map((s) => {
          const selected = value === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              className={cn(
                "rounded-xl border p-2 text-start transition",
                selected ? "border-lavender bg-lavender-soft/50" : "border-line bg-white hover:bg-stone-50",
              )}
            >
              <PaperPreview paperStyleId={s.id} selected={selected} />
              <p className="mt-2 text-sm font-medium leading-tight">{s.name}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted">{s.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
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
        "rounded-full border px-3 py-1 text-xs font-medium transition",
        active ? "border-stone-800 bg-stone-900 text-white" : "border-line bg-white text-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
