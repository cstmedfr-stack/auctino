import { supabase } from "@/lib/supabase";

export async function getTransactionByProductId(productId: string) {
  return await supabase
    .from("transactions")
    .select("*")
    .eq("product_id", productId)
    .single();
}

export async function getTransactionById(transactionId: string) {
  return await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .single();
}


export async function confirmTransaction(transactionId: string) {
  return await supabase.rpc("confirm_transaction", {
    p_transaction_id: transactionId,
  });
}

export async function finalizeAuctionAndCreateTransaction(productId: string) {
  return await supabase.rpc("finalize_auction_and_create_transaction", {
    p_product_id: productId,
  });
}

export async function getMyTransactions(userId: string) {
  return await supabase
    .from("transactions")
    .select("*")
    .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
    .order("created_at", { ascending: false });
}
export async function cancelTransaction(
  transactionId: string,
  reason: string
) {
  const { data, error } = await supabase.rpc("cancel_transaction", {
    p_transaction_id: transactionId,
    p_reason: reason,
  });

  return {
    data: Array.isArray(data) ? data[0] ?? null : data,
    error,
  };
}

export async function openTransactionDispute(
  transactionId: string,
  reason: string
) {
  const { data, error } = await supabase.rpc(
    "open_transaction_dispute",
    {
      p_transaction_id: transactionId,
      p_reason: reason,
    }
  );

  return {
    data: Array.isArray(data) ? data[0] ?? null : data,
    error,
  };
}

export async function getAdminDisputes() {
  return await supabase.rpc("get_admin_disputes");
}

export async function resolveTransactionDispute({
  transactionId,
  decision,
  reason,
}: {
  transactionId: string;
  decision: "completed" | "cancelled";
  reason: string;
}) {
  const { data, error } = await supabase.rpc(
    "resolve_transaction_dispute",
    {
      p_transaction_id: transactionId,
      p_decision: decision,
      p_reason: reason,
    }
  );

  return {
    data: Array.isArray(data) ? data[0] ?? null : data,
    error,
  };
}