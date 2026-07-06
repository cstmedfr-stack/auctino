export const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) {
    return "0 lei";
  }

  return `${price} lei`;
};

export default formatPrice;