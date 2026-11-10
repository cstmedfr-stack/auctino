
import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const RO_URL = "https://vandivo.ro";
const FR_URL = "https://vandivo.fr";

const staticRoutes = [
  "",
  "/categories",
  "/licitatii",
  "/terms",
  "/privacy",
  "/safety",
  "/contact",
];

type SitemapProduct = {
  id: string;
};

async function getActiveRomanianProducts(): Promise<SitemapProduct[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Sitemap: Supabase configuration missing");
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const now = new Date().toISOString();
  const pageSize = 1000;
  const maxProducts = 10000;
  const products: SitemapProduct[] = [];

  for (let offset = 0; offset < maxProducts; offset += pageSize) {
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .eq("market_code", "RO")
      .eq("status", "active")
      .or(`auction_end.is.null,auction_end.gt.${now}`)
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Sitemap products error:", error.message);
      return [];
    }

    const batch = data ?? [];

    products.push(...batch);

    if (batch.length < pageSize) {
      break;
    }
  }

  return products;
}

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

  const staticPages: MetadataRoute.Sitemap =
    staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      changeFrequency: route === "" ? "daily" : "weekly",
      priority: route === "" ? 1 : 0.7,
      alternates: {
        languages: {
          ro: `${RO_URL}${route}`,
          fr: `${FR_URL}${route}`,
          "x-default": `${RO_URL}${route}`,
        },
      },
    }));

  // Momentan nu indexam produse pe domeniul francez.
  if (isFrench) {
    return staticPages;
  }

  const products = await getActiveRomanianProducts();

  const productPages: MetadataRoute.Sitemap =
    products.map((product) => ({
      url: `${RO_URL}/products/${encodeURIComponent(product.id)}`,
      changeFrequency: "daily",
      priority: 0.6,
    }));

  return [...staticPages, ...productPages];
}
