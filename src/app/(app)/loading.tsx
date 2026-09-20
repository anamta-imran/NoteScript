export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-line/70" />
      <div className="h-24 rounded-2xl bg-line/50" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-28 rounded-2xl bg-line/40" />
        <div className="h-28 rounded-2xl bg-line/40" />
      </div>
    </div>
  );
}
