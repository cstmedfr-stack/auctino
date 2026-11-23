
import {
  currentMarket,
  MARKET_CONFIG,
  type MarketCode,
} from "@/config/market";

export function formatPrice(
  value: number | string | null | undefined,
  marketCode?: MarketCode
): string {
  const market = marketCode
    ? MARKET_CONFIG[marketCode]
    : currentMarket;

  const numericValue =
    value === null || value === undefined
      ? 0
      : typeof value === "number"
        ? value
        : Number(value);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return new Intl.NumberFormat(
    market.formattingLocale,
    {
      style: "currency",
      currency: market.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  ).format(numericValue);
}

export default formatPrice;
