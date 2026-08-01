type ProductCardMessages = {
  status: {
    removed: string;
    sold: string;
    transactionPending: string;
    expired: string;
    ended: string;
    live: string;
  };
};

export function getProductStatusBadge(
  status: string,
  t: ProductCardMessages
) {
  switch (status) {
    case "removed":
      return {
        label: t.status.removed,
        className:
          "bg-red-600 text-white",
      };

    case "sold":
      return {
        label: t.status.sold,
        className:
          "bg-emerald-600 text-white",
      };

    case "transaction_pending":
      return {
        label: t.status.transactionPending,
        className:
          "bg-blue-600 text-white",
      };

    case "expired":
      return {
        label: t.status.expired,
        className:
          "bg-slate-700 text-white",
      };

    case "ended":
      return {
        label: t.status.ended,
        className:
          "bg-slate-700 text-white",
      };

    default:
      return {
        label: t.status.live,
        className:
          "bg-red-500 text-white",
      };
  }
}

export function isProductEditable({
  mode,
  isLive,
  hasBids,
}: {
  mode: "marketplace" | "owner";
  isLive: boolean;
  hasBids: boolean;
}) {
  return mode === "owner" && isLive && !hasBids;
}

export function isProductDeleteAllowed({
  mode,
  isLive,
  hasBids,
}: {
  mode: "marketplace" | "owner";
  isLive: boolean;
  hasBids: boolean;
}) {
  return mode === "owner" && isLive && !hasBids;
}

export function isProductRelistAllowed({
  mode,
  status,
  hasBids,
}: {
  mode: "marketplace" | "owner";
  status: string;
  hasBids: boolean;
}) {
  return (
    mode === "owner" &&
    status === "expired" &&
    !hasBids
  );
}