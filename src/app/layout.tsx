import "./globals.css";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import AccountStatusGuard from "@/components/auth/AccountStatusGuard";

export const metadata = {
  title: "Vendora",
  description: "Marketplace de licitații second-hand",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>
        <AccountStatusGuard>
          <Navbar />

          {children}

          <Footer />
        </AccountStatusGuard>
      </body>
    </html>
  );
}