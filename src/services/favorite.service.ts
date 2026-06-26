import { supabase } from "@/lib/supabase";

export async function getUserFavorites(userId: string) {
  return await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", userId);
}

export async function addFavorite(
  userId: string,
  productId: string
) {
  return await supabase.from("favorites").insert({
    user_id: userId,
    product_id: productId,
  });
}

export async function removeFavorite(
  userId: string,
  productId: string
) {
  return await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
}

export async function isFavorite(
  userId: string,
  productId: string
) {
  return await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
}
export async function getFavoriteProducts(userId: string) {
  return await supabase
    .from("favorites")
    .select(
      `
      id,
      product_id,
      products (
        id,
        user_id,
        title,
        description,
        category,
        condition,
        starting_price,
        current_price,
        location,
        image_url,
        status,
        created_at
      )
    `
    )
    .eq("user_id", userId);
}