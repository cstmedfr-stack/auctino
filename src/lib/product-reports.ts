import { supabase } from "@/lib/supabase";

export async function reportProduct({
  productId,
  reason,
}: {
  productId: string;
  reason: string;
}) {
  const { data, error } = await supabase.rpc(
    "report_product",
    {
      p_product_id: productId,
      p_reason: reason,
    }
  );

  return {
    data: Array.isArray(data)
      ? data[0] ?? null
      : data,
    error,
  };
}