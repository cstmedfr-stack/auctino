"use client";

import {
  defaultLocale,
  Locale,
} from "@/i18n/config";

import { useLocale } from "@/i18n/LocaleProvider";
import { roMessages } from "@/i18n/messages/ro";
import { frMessages } from "@/i18n/messages/fr";

const messagesByLocale = {
  ro: roMessages,
  fr: frMessages,
} as const;

export function getMessages(
  locale: Locale = defaultLocale
) {
  return messagesByLocale[locale];
}

export function useMessages() {
  const { locale } = useLocale();

  return getMessages(locale);
}