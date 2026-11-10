
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

const RO_URL = "https://vandivo.ro";
const FR_URL = "https://vandivo.fr";

// Pagini publice care pot fi indexate de Google.
const staticRoutes = [
  "",
  "/categories",
  "/licitatii",
  "/terms",
  "/privacy",
  "/safety",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();

  const hostname = (
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    ""
  )
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();

  const isFrench =
    hostname === "vandivo.fr" ||
    hostname === "www.vandivo.fr";

  const siteUrl = isFrench ? FR_URL : RO_URL;

  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,

    changeFrequency:
      route === "" ? "daily" as const : "weekly" as const,

    priority: route === "" ? 1 : 0.7,

    alternates: {
      languages: {
        ro: `${RO_URL}${route}`,
        fr: `${FR_URL}${route}`,
        "x-default": `${RO_URL}${route}`,
      },
    },
  }));
}
