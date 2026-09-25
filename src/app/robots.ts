import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/seo/structured-data";

/**
 * Allow public marketing pages; block authenticated/app and preview surfaces.
 * Sitemap always points at the production origin (not localhost).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/create",
        "/notes",
        "/folders",
        "/settings",
        "/billing",
        "/api/",
        "/preview",
      ],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
