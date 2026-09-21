import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL || "http://localhost:3000";
  const paths = [
    "",
    "/features",
    "/how-it-works",
    "/pricing",
    "/templates",
    "/faq",
    "/about",
    "/terms",
    "/privacy",
    "/refund",
    "/login",
    "/signup",
  ];
  return paths.map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: new Date(),
  }));
}
