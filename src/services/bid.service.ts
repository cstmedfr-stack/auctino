import { supabase } from "@/lib/supabase";

type PlaceBidProduct = {
  id: string;
  user_id: string;
  title: string;
  current_price: number | null;
  starting_price: number;
  bid_count: number | null;
  status: string | null;
  auction_end: string | null;
  
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
  /*
   * Verificări rapide în interfață.
   * Funcția SQL repetă toate verificările și rămâne
   * sursa reală de adevăr.
   */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "Trebuie să fii autentificat pentru a licita."
    );
  }

  if (user.id !== bidderId) {
    throw new Error(
      "Identitatea ofertantului nu este validă."
    );
  }

  if (user.id === product.user_id) {
    throw new Error(
      "Nu poți licita la propriul produs."
    );
  }

  const currentPrice =
    product.current_price ??
    product.starting_price;

  if (
    !Number.isFinite(amount) ||
    amount <= currentPrice
  ) {
    throw new Error(
      `Oferta trebuie să fie mai mare decât ${currentPrice} lei.`
    );
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
    throw new Error(
      "Licitația este încheiată."
    );
  }

  const { data, error } = await supabase.rpc(
    "place_bid_atomic",
    {
      p_product_id: product.id,
      p_amount: amount,
    }
  );

  if (error) {
    throw new Error(
      error.message ||
        "Oferta nu a putut fi plasată."
    );
  }

  if (!data || typeof data !== "object") {
    throw new Error(
      "Răspunsul primit după plasarea ofertei nu este valid."
    );
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
  auction_extended:
    Boolean(result.auction_extended),
};
}