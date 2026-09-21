import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Official NoteScript mark (same bytes as the original screenshot filename). */
export const NOTESCRIPT_LOGO_PATH = "/brand/notescript-logo.png";

/** Original filename kept on disk under public/brand/. */
export const NOTESCRIPT_LOGO_ORIGINAL_FILENAME =
  "screenshot From 2026-09-21 17-18-53.png";

/** Intrinsic pixel size of the source PNG (do not stretch). */
export const NOTESCRIPT_LOGO_WIDTH = 181;
export const NOTESCRIPT_LOGO_HEIGHT = 158;

const SIZE_HEIGHT = {
  sm: 28,
  md: 36,
  lg: 44,
} as const;

type BrandLogoProps = {
  href?: string;
  className?: string;
  /** Show the NoteScript wordmark beside the mark. Default true. */
  showWordmark?: boolean;
  size?: keyof typeof SIZE_HEIGHT;
  priority?: boolean;
};

export function BrandLogo({
  href = "/",
  className,
  showWordmark = true,
  size = "md",
  priority = false,
}: BrandLogoProps) {
  const height = SIZE_HEIGHT[size];
  const width = Math.round((height * NOTESCRIPT_LOGO_WIDTH) / NOTESCRIPT_LOGO_HEIGHT);

  const mark = (
    <Image
      src={NOTESCRIPT_LOGO_PATH}
      alt={showWordmark ? "" : "NoteScript"}
      width={NOTESCRIPT_LOGO_WIDTH}
      height={NOTESCRIPT_LOGO_HEIGHT}
      priority={priority}
      className="block h-auto max-h-full w-auto max-w-full object-contain"
      style={{ width, height }}
    />
  );

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-lavender-deep transition hover:opacity-90",
        className,
      )}
      aria-label="NoteScript home"
    >
      {mark}
      {showWordmark ? (
        <span className="font-hand-clean text-xl leading-none sm:text-2xl">NoteScript</span>
      ) : null}
    </Link>
  );
}
