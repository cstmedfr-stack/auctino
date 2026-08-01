type SupportedLocale = "ro" | "fr";

function getFormattingLocale(locale: string = "ro") {
  if (locale === "fr") {
    return "fr-FR";
  }

  return "ro-RO";
}

export function formatTime(
  value: string | Date | null | undefined,
  locale: SupportedLocale = "ro"
) {
  if (!value) {
    return "";
  }

  const date =
    value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(
    getFormattingLocale(locale),
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export function formatDate(
  value: string | Date | null | undefined,
  locale: SupportedLocale = "ro"
) {
  if (!value) {
    return "";
  }

  const date =
    value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    getFormattingLocale(locale),
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

export function formatDateTime(
  value: string | Date | null | undefined,
  locale: SupportedLocale = "ro"
) {
  if (!value) {
    return "";
  }

  const date =
    value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
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