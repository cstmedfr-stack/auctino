import type { ReceivedBidProduct } from "@/types/received-bid";

export type ReceivedBidFilter =
  | "all"
  | "active"
  | "ended"
  | "transaction"
  | "sold";

export type ReceivedBidStatusMessages = {
  removedLabel: string;
  removedDescription: string;
  soldLabel: string;
  soldDescription: string;
  transactionLabel: string;
  transactionDescription: string;
  finalizeLabel: string;
  finalizeDescription: string;
  activeLabel: string;
  activeDescription: string;
  expiredLabel: string;
  expiredDescription: string;
  endedLabel: string;
  endedDescription: string;
};

export function getReceivedBidStatus(
  product: ReceivedBidProduct,
  messages: ReceivedBidStatusMessages
) {
  const status = product.status ?? "active";

  if (status === "removed") {
    return {
      label: messages.removedLabel,
      className: "bg-red-100 text-red-800",
      description: messages.removedDescription,
    };
  }

  if (
    status === "sold" ||
    product.transaction_status === "completed"
  ) {
    return {
      label: messages.soldLabel,
      className: "bg-emerald-100 text-emerald-800",
      description: messages.soldDescription,
    };
  }

  if (
    status === "transaction_pending" ||
    product.transaction_status ===
      "pending_confirmation"
  ) {
    return {
      label: messages.transactionLabel,
      className: "bg-blue-100 text-blue-800",
      description: messages.transactionDescription,
    };
  }

  if (product.can_finalize) {
    return {
      label: messages.finalizeLabel,
      className: "bg-orange-100 text-orange-800",
      description: messages.finalizeDescription,
    };
  }

  if (product.is_active) {
    return {
      label: messages.activeLabel,
      className: "bg-green-100 text-green-800",
      description: messages.activeDescription,
    };
  }

  if (status === "expired") {
    return {
      label: messages.expiredLabel,
      className: "bg-slate-100 text-slate-700",
      description: messages.expiredDescription,
    };
  }

  return {
    label: messages.endedLabel,
    className: "bg-slate-100 text-slate-700",
    description: messages.endedDescription,
  };
}

export function getReceivedBidStatistics(
  products: ReceivedBidProduct[]
): Record<ReceivedBidFilter, number> {
  return {
    all: products.length,
    active: products.filter(
      (product) => product.is_active
    ).length,
    ended: products.filter(
      (product) =>
        product.can_finalize ||
        product.status === "ended" ||
        product.status === "expired"
    ).length,
    transaction: products.filter(
      (product) =>
        product.status ===
          "transaction_pending" ||
        product.transaction_status ===
          "pending_confirmation"
    ).length,
    sold: products.filter(
      (product) =>
        product.status === "sold" ||
        product.transaction_status ===
          "completed"
    ).length,
  };
}

export function filterReceivedBidProducts(
  products: ReceivedBidProduct[],
  filter: ReceivedBidFilter
) {
  switch (filter) {
    case "active":
      return products.filter(
        (product) => product.is_active
      );

    case "ended":
      return products.filter(
        (product) =>
          product.can_finalize ||
          product.status === "ended" ||
          product.status === "expired"
      );

    case "transaction":
      return products.filter(
        (product) =>
          product.status ===
            "transaction_pending" ||
          product.transaction_status ===
            "pending_confirmation"
      );

    case "sold":
      return products.filter(
        (product) =>
          product.status === "sold" ||
          product.transaction_status ===
            "completed"
      );

    default:
      return products;
  }
}

export function canViewReceivedBidTransaction(
  product: ReceivedBidProduct
) {
  return (
    product.status === "transaction_pending" ||
    product.status === "sold" ||
    Boolean(product.transaction_id)
  );
}