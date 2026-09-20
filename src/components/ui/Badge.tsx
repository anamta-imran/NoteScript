import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "lavender",
}: {
  children: React.ReactNode;
  tone?: "lavender" | "green" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "lavender" && "bg-lavender-soft text-lavender-deep",
        tone === "green" && "bg-success-soft text-success",
        tone === "muted" && "bg-line text-muted",
      )}
    >
      {children}
    </span>
  );
}
