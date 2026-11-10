
"use client";

import { useEffect, useState } from "react";

import {
  localeLabels,
  supportedLocales,
} from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";
import { useMessages } from "@/i18n/useMessages";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const messages = useMessages();

  const [isPublicDomain, setIsPublicDomain] =
    useState(true);

  useEffect(() => {
    const hostname =
      window.location.hostname.toLowerCase();

    const publicDomains = [
      "vandivo.ro",
      "www.vandivo.ro",
      "vandivo.fr",
      "www.vandivo.fr",
    ];

    setIsPublicDomain(
      publicDomains.includes(hostname)
    );
  }, []);

  // Nu afisam selectorul pe domeniile publice.
  if (isPublicDomain) {
    return null;
  }

  return (
    <div
      className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
      aria-label={messages.navbar.languageSelector}
    >
      {supportedLocales.map((availableLocale) => {
        const isActive =
          locale === availableLocale;

        return (
          <button
            key={availableLocale}
            type="button"
            onClick={() =>
              setLocale(availableLocale)
            }
            aria-pressed={isActive}
            title={localeLabels[availableLocale]}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
              isActive
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            {availableLocale.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
