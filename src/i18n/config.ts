export const supportedLocales = [
  "ro",
  "fr",
] as const;

export type Locale =
  (typeof supportedLocales)[number];

export const defaultLocale: Locale =
  "ro";

export const localeLabels: Record<
  Locale,
  string
> = {
  ro: "Română",
  fr: "Français",
};

export function isSupportedLocale(
  value: string
): value is Locale {
  return supportedLocales.includes(
    value as Locale
  );
}