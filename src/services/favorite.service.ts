import { supabase } from "@/lib/supabase";

export async function getUserFavorites(
  userId: string
) {
  /*
   * Parametrul este păstrat pentru compatibilitate.
   * RLS returnează automat doar favoritele contului
   * autentificat.
   */
  void userId;

  return await supabase
    .from("favorites")
    .select("product_id");
}

export async function addFavorite(
  userId: string,
  productId: string
) {
  /*
   * Identitatea reală este stabilită prin auth.uid().
   */
  void userId;

  return await supabase.rpc(
    "set_own_favorite",
    {
      p_product_id: productId,
      p_should_be_favorite: true,
    }
  );
}

export async function removeFavorite(
  userId: string,
  productId: string
) {
  void userId;

  return await supabase.rpc(
    "set_own_favorite",
    {
      p_product_id: productId,
      p_should_be_favorite: false,
    }
  );
}

export async function isFavorite(
  userId: string,
  productId: string
) {
  void userId;

  return await supabase.rpc(
    "is_own_favorite",
    {
      p_product_id: productId,
    }
  );
}

export async function getFavoriteProducts(
  userId: string
) {
  void userId;

  return await supabase
    .from("favorites")
    .select(`
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
    `);
}