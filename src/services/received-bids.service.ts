import { supabase } from "@/lib/supabase";
import { ReceivedBidProduct } from "@/types/received-bid";

export async function getMyReceivedBidProducts() {
  const { data, error } = await supabase.rpc(
    "get_my_received_bid_products"
  );

  return {
    data: Array.isArray(data)
      ? (data as ReceivedBidProduct[])
      : [],
    error,
  };
}