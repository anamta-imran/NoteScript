import { Button } from "./Button";

export function EmptyState({
  title,
  body,
  cta,
  href,
}: {
  title: string;
  body: string;
  cta?: string;
  href?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      {cta && href ? (
        <div className="mt-5">
          <Button href={href}>{cta}</Button>
        </div>
      ) : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-line/70 ${className || "h-24"}`} />;
}
