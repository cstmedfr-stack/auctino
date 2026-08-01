import { formatPrice } from "@/utils/formatPrice";

type ProductPriceProps = {
  currentPrice: number | null;
  startingPrice: number;
  label?: string;
  size?: "compact" | "default";
};

export default function ProductPrice({
  currentPrice,
  startingPrice,
  label,
  size = "default",
}: ProductPriceProps) {
  const price =
    currentPrice ?? startingPrice ?? 0;

  const priceClassName =
    size === "compact"
    ? "text-2xl"
: "text-2xl sm:text-3xl";

  return (
    <>
      {label && (
        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>
      )}

      <p
        className={`mt-1 font-extrabold tracking-tight text-slate-950 ${priceClassName}`}
      >
        {formatPrice(price)}
      </p>
    </>
  );
}