import { Locale } from "@/i18n/config";

const intlLocaleByLocale: Record<
  Locale,
  string
> = {
  ro: "ro-RO",
  fr: "fr-FR",
};

export function formatLocalizedDate(
  value: string | Date | null | undefined,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
) {
  if (!value) {
    return "-";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    intlLocaleByLocale[locale],
    options ?? {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

export function formatLocalizedDateTime(
  value: string | Date | null | undefined,
  locale: Locale
) {
  return formatLocalizedDate(
    value,
    locale,
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export function formatLocalizedPrice(
  value: number | string | null | undefined,
  locale: Locale,
  currency: "RON" | "EUR" = "RON"
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "-";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat(
    intlLocaleByLocale[locale],
    {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }
  ).format(numericValue);
}