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
  createContext<LocaleContextValue | null>(
    null
  );

type LocaleProviderProps = {
  children: ReactNode;
};

export function LocaleProvider({
  children,
}: LocaleProviderProps) {
  const [locale, setLocaleState] =
    useState<Locale>(defaultLocale);

  useEffect(() => {
    const savedLocale =
      window.localStorage.getItem(
        "auctino-locale"
      );

    if (
      savedLocale &&
      isSupportedLocale(savedLocale)
    ) {
      setLocaleState(savedLocale);
      document.documentElement.lang =
        savedLocale;
    }
  }, []);

  function setLocale(
    newLocale: Locale
  ) {
    setLocaleState(newLocale);

    window.localStorage.setItem(
      "auctino-locale",
      newLocale
    );

    document.documentElement.lang =
      newLocale;
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale]
  );

  return (
    <LocaleContext.Provider
      value={value}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context =
    useContext(LocaleContext);

  if (!context) {
    throw new Error(
      "useLocale trebuie folosit în interiorul LocaleProvider."
    );
  }

  return context;
}