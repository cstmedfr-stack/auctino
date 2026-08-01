import { currentMarket } from "@/config/market";

export function formatPrice(
  value: number | string | null | undefined
) {
  if (value === null || value === undefined) {
    return new Intl.NumberFormat(
      currentMarket.formattingLocale,
      {
        style: "currency",
        currency: currentMarket.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    ).format(0);
  }

  const numericValue =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return new Intl.NumberFormat(
    currentMarket.formattingLocale,
    {
      style: "currency",
      currency: currentMarket.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  ).format(numericValue);
}

export default formatPrice;