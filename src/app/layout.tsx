import type {
  Metadata,
  Viewport,
} from "next";

import "./globals.css";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import AccountStatusGuard from "@/components/auth/AccountStatusGuard";
import { LocaleProvider } from "@/i18n/LocaleProvider";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://vandivo.ro";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vandivo",
    template: "%s | Vandivo",
  },
  description:
    "Vandivo is a modern online auction marketplace for buying and selling products through trusted bidding.",
  applicationName: "Vandivo",
  keywords: [
    "Vandivo",
    "online auctions",
    "auction marketplace",
    "second-hand marketplace",
    "buy and sell online",
    "Romania auctions",
    "France auctions",
  ],
  authors: [
    {
      name: "Vandivo",
    },
  ],
  creator: "Vandivo",
  publisher: "Vandivo",
  alternates: {
    canonical: siteUrl,
    languages: {
      ro: "https://vandivo.ro",
      fr: "https://vandivo.fr",
      "x-default": "https://vandivo.ro",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Vandivo",
    title: "Vandivo",
    description:
      "A modern online auction marketplace for trusted buying and selling.",
    locale: "ro_RO",
    alternateLocale: ["fr_FR"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vandivo",
    description:
      "A modern online auction marketplace for trusted buying and selling.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>
        <LocaleProvider>
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