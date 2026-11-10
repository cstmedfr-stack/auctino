
import type { Metadata } from "next";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

const RO_URL = "https://vandivo.ro";
const FR_URL = "https://vandivo.fr";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;
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
  const canonical = `${siteUrl}/products/${encodeURIComponent(id)}`;

  const unavailableMetadata: Metadata = {
    title: "Produs indisponibil | Vandivo",
    robots: {
      index: false,
      follow: false,
    },
  };

  // Piata FR nu este inca separata functional.
  // Evitam indexarea unor produse RO sub domeniul FR.
  if (isFrench) {
    return {
      title: "Vandivo France",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id,title,description,image_url,status,auction_end,market_code"
    )
    .eq("id", id)
    .eq("market_code", "RO")
    .eq("status", "active")
    .maybeSingle();

  if (error || !product) {
    return unavailableMetadata;
  }

  if (
    product.auction_end &&
    new Date(product.auction_end).getTime() <= Date.now()
  ) {
    return unavailableMetadata;
  }

  const title = `${product.title} – Licitație online`;
  const description =
    product.description?.trim().slice(0, 155) ||
    `Descoperă ${product.title} pe Vandivo, platforma de licitații online.`;

  const images = product.image_url
    ? [{ url: product.image_url, alt: product.title }]
    : [];

  return {
    title,
    description,

    alternates: {
      canonical,
    },

    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Vandivo",
      title,
      description,
      locale: "ro_RO",
      images,
    },

    twitter: {
      card: images.length
        ? "summary_large_image"
        : "summary",
      title,
      description,
      images: product.image_url
        ? [product.image_url]
        : [],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function ProductLayout({
  children,
}: Props) {
  return <>{children}</>;
}
