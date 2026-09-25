import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo/structured-data";

/**
 * Shared public marketing metadata: unique title/description, canonical,
 * Open Graph, and Twitter — without touching Search Console verification.
 */
export function buildMarketingMetadata(input: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  const canonical = absoluteUrl(input.path);

  return {
    title: {
      absolute: input.title,
    },
    description: input.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.path === "/" ? "/" : input.path,
      siteName: "NoteScript",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
    ...(input.index === false
      ? { robots: { index: false, follow: false } }
      : input.index === true
        ? { robots: { index: true } }
        : {}),
  };
}
