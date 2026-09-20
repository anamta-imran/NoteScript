"use client";

import { cn } from "@/lib/utils";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: number; message: string; tone?: "ok" | "err" };

const Ctx = createContext<{ push: (message: string, tone?: "ok" | "err") => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: "ok" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, message, tone }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4200);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(100%-2rem,360px)] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg bg-white",
              t.tone === "err" ? "border-red-200 text-danger" : "border-line text-ink",
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("ToastProvider missing");
  return ctx;
}
