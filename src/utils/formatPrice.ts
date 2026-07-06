export function formatPrice(
  value: number | null | undefined
) {
  const price = Number(value ?? 0);

  const formattedValue = price.toLocaleString(
    "ro-RO",
    {
      minimumFractionDigits:
        Number.isInteger(price) ? 0 : 2,
      maximumFractionDigits: 2,
    }
  );

  return `${formattedValue} ${
    Math.abs(price) === 1 ? "leu" : "lei"
  }`;
}