import { supabase } from "@/lib/supabase";

type ClosedAuctionResult = {
  id: string;
  title: string;
  user_id: string;
  status: string | null;
  auction_end: string | null;
  winner_id: string | null;
  current_price: number | null;
};

export async function closeAuction(
  productId: string
) {
  const { data, error } = await supabase.rpc(
    "close_own_finished_auction",
    {
      p_product_id: productId,
    }
  );

  if (error) {
    throw new Error(
      error.message || "auction_close_failed"
    );
  }

  return data as ClosedAuctionResult;
}