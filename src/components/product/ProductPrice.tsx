type ProductPriceProps = {
  currentPrice: number | null;
  startingPrice: number;
};

function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) {
    return "0 lei";
  }

  return `${price} lei`;
}

export default function ProductPrice({
  currentPrice,
  startingPrice,
}: ProductPriceProps) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Oferta actuală
      </p>

      <p className="mt-1 text-3xl font-extrabold text-gray-900">
        {formatPrice(currentPrice ?? startingPrice)}
      </p>
    </>
  );
}