import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

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
        <Navbar />
        {children}
          <Footer />
      </body>
    </html>
  );
}