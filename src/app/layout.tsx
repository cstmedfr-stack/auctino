
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import "./globals.css";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import AccountStatusGuard from "@/components/auth/AccountStatusGuard";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";

async function getDomainSettings(): Promise<{
  locale: Locale;
  siteUrl: string;
}> {
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

  if (
    hostname === "vandivo.fr" ||
    hostname === "www.vandivo.fr"
  ) {
    return {
      locale: "fr",
      siteUrl: "https://vandivo.fr",
    };
  }

  return {
    locale: "ro",
    siteUrl: "https://vandivo.ro",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, siteUrl } = await getDomainSettings();

  const isFrench = locale === "fr";

  const description = isFrench
    ? "Vandivo, plateforme de ventes aux enchères en ligne pour acheter et vendre des produits."
    : "Vandivo, platformă de licitații online pentru cumpărarea și vânzarea produselor.";

  return {
    metadataBase: new URL(siteUrl),

    title: {
      default: "Vandivo",
      template: "%s | Vandivo",
    },

    description,

    applicationName: "Vandivo",

    keywords: isFrench
      ? [
          "Vandivo",
          "enchères en ligne",
          "ventes aux enchères",
          "acheter en ligne",
          "vendre en ligne",
        ]
      : [
          "Vandivo",
          "licitații online",
          "platformă de licitații",
          "cumpără online",
          "vinde online",
        ],

    authors: [{ name: "Vandivo" }],
    creator: "Vandivo",
    publisher: "Vandivo",

    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: "Vandivo",
      title: "Vandivo",
      description,
      locale: isFrench ? "fr_FR" : "ro_RO",
      alternateLocale: isFrench
        ? ["ro_RO"]
        : ["fr_FR"],
    },

    twitter: {
      card: "summary_large_image",
      title: "Vandivo",
      description,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = await getDomainSettings();

  return (
    <html lang={locale}>
      <body>
        <LocaleProvider initialLocale={locale}>
          <AccountStatusGuard>
            <Navbar />
            {children}
            <Footer />
          </AccountStatusGuard>
        </LocaleProvider>
      </body>
    </html>
  );
}
