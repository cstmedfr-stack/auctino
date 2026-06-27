import { supabase } from "@/lib/supabase";
import { createNotification } from "./notification.service";

export async function placeBid({
  product,
  bidderId,
  amount,
}: {
  product: {
    id: string;
    user_id: string;
    title: string;
    current_price: number | null;
    starting_price: number;
    bid_count: number | null;
    status: string | null;
    auction_end: string | null;
  };
  bidderId: string;
  amount: number;
}) {
  const currentPrice = product.current_price ?? product.starting_price;

  if (amount <= currentPrice) {
    throw new Error(
      `Oferta trebuie să fie mai mare decât ${currentPrice} lei.`
    );
  }

  const auctionEnded =
    product.auction_end !== null &&
    new Date(product.auction_end).getTime() <= Date.now();

  if (auctionEnded || product.status === "ended") {
    throw new Error("Licitația este încheiată.");
  }

  const { data: previousHighestBid } = await supabase
    .from("bids")
    .select("user_id, amount")
    .eq("product_id", product.id)
    .order("amount", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: bidError } = await supabase.from("bids").insert({
    product_id: product.id,
    user_id: bidderId,
    amount,
  });

  if (bidError) {
    throw new Error(bidError.message);
  }

  const { error: productError } = await supabase
    .from("products")
    .update({
      current_price: amount,
      bid_count: (product.bid_count ?? 0) + 1,
    })
    .eq("id", product.id);

  if (productError) {
    throw new Error(productError.message);
  }

  if (bidderId !== product.user_id) {
    await createNotification({
      userId: product.user_id,
      productId: product.id,
      title: "Ai primit o ofertă nouă",
      message: `Produsul tău "${product.title}" a primit o ofertă de ${amount} lei.`,
      type: "new_bid",
    });
  }

  if (
    previousHighestBid &&
    previousHighestBid.user_id !== bidderId &&
    previousHighestBid.user_id !== product.user_id
  ) {
    await createNotification({
      userId: previousHighestBid.user_id,
      productId: product.id,
      title: "Ai fost depășit la licitație",
      message: `Oferta ta pentru "${product.title}" a fost depășită. Noua ofertă este ${amount} lei.`,
      type: "outbid",
    });
  }

  return {
    current_price: amount,
    bid_count: (product.bid_count ?? 0) + 1,
  };
}