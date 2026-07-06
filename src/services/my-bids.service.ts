import { supabase } from "@/lib/supabase";
import { MyBidProduct } from "@/types/my-bid";

export async function getMyBidProducts() {
  const { data, error } = await supabase.rpc(
    "get_my_bid_products"
  );

  return {
    data: Array.isArray(data)
      ? (data as MyBidProduct[])
      : [],
    error,
  };
}