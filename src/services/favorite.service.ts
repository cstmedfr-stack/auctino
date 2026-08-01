import { currentMarket } from "@/config/market";
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
    .select(`
      product_id,
      products!inner (
        id
      )
    `)
    .eq(
      "products.market_code",
      currentMarket.code
    );
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
    p_market_code: currentMarket.code,
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
    p_market_code: currentMarket.code,
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
    p_market_code: currentMarket.code,
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
      products!inner (
        id,
        user_id,
        title,
        description,
        category,
        category_id,
        subcategory_id,
        condition,
        starting_price,
        current_price,
        location,
        image_url,
        status,
        created_at,
        auction_end,
        bid_count,
        winner_id,
        market_code
      )
    `)
    .eq(
      "products.market_code",
      currentMarket.code
    );
}