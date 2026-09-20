export function UsageMeter({
  used,
  limit,
  label,
}: {
  used: number;
  limit: number;
  label?: string;
}) {
  const pct = limit === Number.POSITIVE_INFINITY ? 0 : Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label || "Usage this month"}</span>
        <span className="text-muted">
          {used} / {limit === Number.POSITIVE_INFINITY ? "∞" : limit} notes used
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-lavender-soft">
        <div className="h-full rounded-full bg-lavender transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
