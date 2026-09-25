import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/seo/structured-data";

/**
 * Public marketing routes only. lastModified is omitted because exact
 * content change dates are not tracked — prefer no date over a fresh
 * `new Date()` on every request.
 */
const PUBLIC_PATHS = [
  "/",
  "/features",
  "/how-it-works",
  "/pricing",
  "/templates",
  "/faq",
  "/about",
  "/terms",
  "/privacy",
  "/refund",
  "/text-to-handwritten-notes",
  "/image-to-handwritten-notes",
  "/pdf-to-handwritten-notes",
  "/youtube-to-handwritten-notes",
  "/handwritten-notes-maker",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`,
  }));
}
