import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://auctino.ro";

const staticRoutes = [
  "",
  "/dashboard",
  "/categories",
  "/login",
  "/register",
  "/terms",
  "/privacy",
  "/safety",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency:
      route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}