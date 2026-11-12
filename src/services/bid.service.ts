import { supabase } from "@/lib/supabase";
import { currentMarket } from "@/config/market";

type PlaceBidProduct = {
  id: string;
  user_id: string;
  title: string;
  current_price: number | null;
  starting_price: number;
  bid_count: number | null;
  status: string | null;
  auction_end: string | null;
  market_code: "RO" | "FR";
};

type PlaceBidArguments = {
  product: PlaceBidProduct;
  bidderId: string;
  amount: number;
};

type PlaceBidRpcResult = {
  bid_id: string;
  current_price: number;
  bid_count: number;
  previous_highest_amount: number | null;
  auction_end: string | null;
  auction_extended: boolean;
};

export async function placeBid({
  product,
  bidderId,
  amount,
}: PlaceBidArguments) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("bid_auth_required");
  }

  if (user.id !== bidderId) {
    throw new Error("bid_invalid_identity");
  }

  if (user.id === product.user_id) {
    throw new Error("bid_own_product");
  }

  if (
    product.market_code !== currentMarket.code
  ) {
    throw new Error("bid_foreign_market");
  }

  
const currentPrice =
  product.current_price ??
  product.starting_price;

const minimumAmount =
  (product.bid_count ?? 0) > 0
    ? currentPrice + 1
    : product.starting_price;

if (
  !Number.isFinite(amount) ||
  amount < minimumAmount
) {
  throw new Error("bid_amount_too_low");
}


  const auctionEnded =
    product.auction_end !== null &&
    new Date(product.auction_end).getTime() <=
      Date.now();

  const closedStatuses = [
    "ended",
    "expired",
    "transaction_pending",
    "sold",
    "removed",
  ];

  if (
    auctionEnded ||
    closedStatuses.includes(
      product.status ?? ""
    )
  ) {
    throw new Error("bid_auction_ended");
  }

  const { data, error } =
    await supabase.rpc(
      "place_bid_atomic",
      {
        p_product_id: product.id,
        p_amount: amount,
        p_market_code: currentMarket.code,
      }
    );

  if (error) {
    throw new Error(
      error.message || "bid_failed"
    );
  }

  if (!data || typeof data !== "object") {
    throw new Error("bid_invalid_response");
  }

  const result =
    data as PlaceBidRpcResult;

  return {
    current_price: Number(
      result.current_price
    ),
    bid_count: Number(
      result.bid_count
    ),
    auction_end:
      result.auction_end ?? null,
    auction_extended: Boolean(
      result.auction_extended
    ),
  };
}