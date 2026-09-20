import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-lavender text-white hover:bg-lavender-deep shadow-sm",
  secondary:
    "bg-white text-ink border border-line hover:bg-lavender-soft/60",
  ghost: "bg-transparent text-ink hover:bg-lavender-soft/50",
  danger: "bg-white text-danger border border-red-200 hover:bg-red-50",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...rest
}: Props) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
