import type { MyBidProduct } from "@/types/my-bid";

export type BidFilter =
  | "all"
  | "active"
  | "leading"
  | "outbid"
  | "won"
  | "closed";

export type BidStatusMessages = {
  removedLabel: string;
  removedDescription: string;
  wonSoldLabel: string;
  wonSoldDescription: string;
  wonPendingLabel: string;
  wonPendingDescription: string;
  wonLabel: string;
  wonDescription: string;
  leadingLabel: string;
  leadingDescription: string;
  outbidLabel: string;
  outbidDescription: string;
  expiredLabel: string;
  expiredDescription: string;
  closedLabel: string;
  closedDescription: string;
};

export function isAuctionActive(
  product: MyBidProduct
) {
  const status = product.status ?? "active";

  const endedByDate = product.auction_end
    ? new Date(product.auction_end).getTime() <=
      Date.now()
    : false;

  return status === "active" && !endedByDate;
}

export function getBidStatus(
  product: MyBidProduct,
  messages: BidStatusMessages
) {
  const status = product.status ?? "active";
  const active = isAuctionActive(product);

  if (status === "removed") {
    return {
      label: messages.removedLabel,
      className:
        "bg-red-100 text-red-800",
      description:
        messages.removedDescription,
    };
  }

  if (
    product.is_winner &&
    status === "sold"
  ) {
    return {
      label: messages.wonSoldLabel,
      className:
        "bg-emerald-100 text-emerald-800",
      description:
        messages.wonSoldDescription,
    };
  }

  if (
    product.is_winner &&
    status === "transaction_pending"
  ) {
    return {
      label: messages.wonPendingLabel,
      className:
        "bg-green-100 text-green-800",
      description:
        messages.wonPendingDescription,
    };
  }

  if (
    product.is_winner &&
    !active
  ) {
    return {
      label: messages.wonLabel,
      className:
        "bg-green-100 text-green-800",
      description:
        messages.wonDescription,
    };
  }

  if (
    active &&
    product.is_leading
  ) {
    return {
      label: messages.leadingLabel,
      className:
        "bg-blue-100 text-blue-800",
      description:
        messages.leadingDescription,
    };
  }

  if (
    active &&
    !product.is_leading
  ) {
    return {
      label: messages.outbidLabel,
      className:
        "bg-orange-100 text-orange-800",
      description:
        messages.outbidDescription,
    };
  }

  if (status === "expired") {
    return {
      label: messages.expiredLabel,
      className:
        "bg-slate-100 text-slate-700",
      description:
        messages.expiredDescription,
    };
  }

  return {
    label: messages.closedLabel,
    className:
      "bg-slate-100 text-slate-700",
    description:
      messages.closedDescription,
  };
}

export function getMyBidsStatistics(
  products: MyBidProduct[]
) {
  const active = products.filter(
    isAuctionActive
  );

  const leading = active.filter(
    (product) => product.is_leading
  );

  const outbid = active.filter(
    (product) => !product.is_leading
  );

  const won = products.filter(
    (product) =>
      product.is_winner &&
      !isAuctionActive(product) &&
      product.status !== "removed"
  );

  const closed = products.filter(
    (product) =>
      !isAuctionActive(product)
  );

  return {
    all: products.length,
    active: active.length,
    leading: leading.length,
    outbid: outbid.length,
    won: won.length,
    closed: closed.length,
  };
}

export function filterMyBidProducts(
  products: MyBidProduct[],
  filter: BidFilter
) {
  switch (filter) {
    case "active":
      return products.filter(isAuctionActive);

    case "leading":
      return products.filter(
        (product) =>
          isAuctionActive(product) &&
          product.is_leading
      );

    case "outbid":
      return products.filter(
        (product) =>
          isAuctionActive(product) &&
          !product.is_leading
      );

    case "won":
      return products.filter(
        (product) =>
          product.is_winner &&
          !isAuctionActive(product) &&
          product.status !== "removed"
      );

    case "closed":
      return products.filter(
        (product) =>
          !isAuctionActive(product)
      );

    default:
      return products;
  }
}