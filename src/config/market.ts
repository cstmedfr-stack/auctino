export type MarketCode = "RO" | "FR";
export type MarketCurrency = "RON" | "EUR";
export type MarketLocale = "ro" | "fr";

type MarketConfiguration = {
  code: MarketCode;
  locale: MarketLocale;
  formattingLocale: string;
  currency: MarketCurrency;
  timeZone: string;
  countryName: string;
};

export const MARKET_CONFIG: Record<
  MarketCode,
  MarketConfiguration
> = {
  RO: {
    code: "RO",
    locale: "ro",
    formattingLocale: "ro-RO",
    currency: "RON",
    timeZone: "Europe/Bucharest",
    countryName: "România",
  },

  FR: {
    code: "FR",
    locale: "fr",
    formattingLocale: "fr-FR",
    currency: "EUR",
    timeZone: "Europe/Paris",
    countryName: "France",
  },
};

const environmentMarket =
  process.env.NEXT_PUBLIC_MARKET?.toUpperCase();

export const MARKET_CODE: MarketCode =
  environmentMarket === "FR" ? "FR" : "RO";

export const currentMarket =
  MARKET_CONFIG[MARKET_CODE];