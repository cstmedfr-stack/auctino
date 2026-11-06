"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "./Container";
import { useMessages } from "@/i18n/useMessages";
import Image from "next/image";
import { useLocale } from "@/i18n/LocaleProvider";
export function Footer() {
  const messages = useMessages();
  const t = messages.footer;
const { locale } = useLocale();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container>
        <div className="grid gap-8 py-10 sm:py-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <Link
  href="/"
  className="inline-flex items-center"
  aria-label="Auctino"
>
  <Image
    src="/images/auctino-logo.png"
    alt="Auctino"
    width={150}
    height={54}
    className="h-10 w-auto object-contain"
  />
</Link>

            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              {t.tagline}
            </p>
          </div>

          <nav className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end">
            <FooterLink href="/dashboard">
              {t.auctions}
            </FooterLink>

            <FooterLink href="/add-product">
              {t.sell}
            </FooterLink>

            <FooterLink href="/login">
              {t.login}
            </FooterLink>

            <FooterLink href="/register">
              {t.register}
            </FooterLink>

<FooterLink href="/sugestii">
  {locale === "fr"
    ? "Suggestions et améliorations"
    : "Sugestii și îmbunătățiri"}
</FooterLink>

            <FooterLink href="/terms">
              {t.terms}
            </FooterLink>

            <FooterLink href="/privacy">
              {t.privacy}
            </FooterLink>

            <FooterLink href="/safety">
              {t.safety}
            </FooterLink>

            <FooterLink href="/contact">
              {t.contact}
            </FooterLink>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Auctino.</p>
          <p>{t.rights}</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 sm:justify-center"
    >
      {children}
      <ArrowRight size={14} />
    </Link>
  );
}