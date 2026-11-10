
"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  defaultLocale,
  isSupportedLocale,
  Locale,
} from "@/i18n/config";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext =
  createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  children: ReactNode;
};

function getDomainLocale(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const hostname = window.location.hostname.toLowerCase();

  if (
    hostname === "vandivo.fr" ||
    hostname === "www.vandivo.fr"
  ) {
    return "fr";
  }

  if (
    hostname === "vandivo.ro" ||
    hostname === "www.vandivo.ro"
  ) {
    return "ro";
  }

  return null;
}

export function LocaleProvider({
  children,
}: LocaleProviderProps) {
  const [locale, setLocaleState] =
    useState<Locale>(defaultLocale);

  useEffect(() => {
    const domainLocale = getDomainLocale();

    if (domainLocale) {
      setLocaleState(domainLocale);
      document.documentElement.lang = domainLocale;
      return;
    }

    const savedLocale =
      window.localStorage.getItem("auctino-locale");

    const resolvedLocale =
      savedLocale && isSupportedLocale(savedLocale)
        ? savedLocale
        : defaultLocale;

    setLocaleState(resolvedLocale);
    document.documentElement.lang = resolvedLocale;
  }, []);

  function setLocale(newLocale: Locale) {
    const domainLocale = getDomainLocale();

    // Domeniile publice au limba fixa.
    if (domainLocale) {
      setLocaleState(domainLocale);
      document.documentElement.lang = domainLocale;
      return;
    }

    // Pe localhost si domeniile de test
    // pastram posibilitatea schimbarii limbii.
    setLocaleState(newLocale);

    window.localStorage.setItem(
      "auctino-locale",
      newLocale
    );

    document.documentElement.lang = newLocale;
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error(
      "useLocale trebuie folosit în interiorul LocaleProvider."
    );
  }

  return context;
}
