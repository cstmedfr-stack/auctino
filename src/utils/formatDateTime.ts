type SupportedLocale = "ro" | "fr";

function getFormattingLocale(locale: string) {
  if (locale === "fr") {
    return "fr-FR";
  }

  return "ro-RO";
}

export function formatDateTime(
  value: string | Date | null | undefined,
  locale: SupportedLocale | string = "ro"
) {
  if (!value) {
    return "";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    getFormattingLocale(locale),
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}