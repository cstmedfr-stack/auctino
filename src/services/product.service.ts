import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { currentMarket } from "@/config/market";

export type CreateProductInput = {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  condition: string;
  startingPrice: number;
  location: string;
  durationDays: number;
};

export type UpdateProductInput = {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  condition: string;
  location: string;
};

export type MarketplaceSort =
  | "newest"
  | "ending"
  | "price_asc"
  | "price_desc"
  | "bids";

export type MarketplaceProductFilters = {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  county?: string;
  condition?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: MarketplaceSort;
};

export type MarketplaceProductsPage = {
  items: Product[];
  totalCount: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
};

export async function getMarketplaceProducts(
  filters: MarketplaceProductFilters,
  page = 1,
  pageSize = 24
) {
  const safePage = Math.max(page, 1);
  const safePageSize = Math.min(
    Math.max(pageSize, 1),
    48
  );

  const minPrice =
    typeof filters.minPrice === "number" &&
    Number.isFinite(filters.minPrice)
      ? filters.minPrice
      : null;

  const maxPrice =
    typeof filters.maxPrice === "number" &&
    Number.isFinite(filters.maxPrice)
      ? filters.maxPrice
      : null;

  const { data, error } =
    await supabase.rpc(
      "get_marketplace_products",
      {
        p_search:
          filters.search?.trim() ||
          null,

        p_category_id:
          filters.categoryId || null,

        p_subcategory_id:
          filters.subcategoryId || null,

        p_county:
          filters.county?.trim() ||
          null,

        p_condition:
          filters.condition?.trim() ||
          null,

        p_min_price: minPrice,
        p_max_price: maxPrice,

        p_sort:
          filters.sort ?? "newest",

        p_page: safePage,
        p_page_size: safePageSize,
        p_market_code:  currentMarket.code,
      }
    );

  if (error) {
    return {
      data: null,
      error,
    };
  }

  const payload = (data ?? {}) as {
    items?: unknown;
    total_count?: unknown;
    has_more?: unknown;
  };

  const result: MarketplaceProductsPage =
    {
      items: Array.isArray(
        payload.items
      )
        ? (payload.items as Product[])
        : [],

      totalCount: Number(
        payload.total_count ?? 0
      ),

      hasMore: Boolean(
        payload.has_more
      ),

      page: safePage,
      pageSize: safePageSize,
    };

  return {
    data: result,
    error: null,
  };
}

/*
 * Păstrăm funcția veche pentru alte pagini
 * care ar putea încă să o folosească.
 */
export async function getProducts() {
  const now =
    new Date().toISOString();

  return await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name_ro,
        icon
      ),
      subcategories (
        id,
        name_ro
      )
    `)
          .eq(
        "market_code",
        currentMarket.code
      )
    .eq("status", "active")
    .or(
      `auction_end.is.null,auction_end.gt.${now}`
    )
    .order("created_at", {
      ascending: false,
    });
}

export async function getProductById(
  id: string
) {
  return await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq(
      "market_code",
      currentMarket.code
    )
    .single();
}

export async function getUserProducts(
  userId: string
) {
  return await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name_ro,
        icon
      ),
      subcategories (
        id,
        name_ro
      )
    `)
    .eq(  "market_code",  currentMarket.code)
    .eq("user_id", userId)    .order("created_at", {      ascending: false,
    });
}

export async function getPublicUserProducts(
  userId: string
) {
  const now =
    new Date().toISOString();

  return await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name_ro,
        icon
      ),
      subcategories (
        id,
        name_ro
      )
    `)
    .eq("user_id", userId)
    .eq("status", "active")
    .or(
      `auction_end.is.null,auction_end.gt.${now}`
    )
    .order("created_at", {
      ascending: false,
    });
}

export async function createProduct(
  values: CreateProductInput
) {
  const { data, error } =
    await supabase.rpc(
      "create_own_product",
      {
        p_title: values.title,
        p_description:
          values.description,

        p_category_id:
          values.categoryId,

        p_subcategory_id:
          values.subcategoryId,

        p_condition:
          values.condition,

        p_starting_price:
          values.startingPrice,

        p_location:
          values.location,

        p_duration_days:
          values.durationDays,
          p_market_code:
  currentMarket.code,
      }
    );

  return {
    data:
      (data as Product | null) ??
      null,

    error,
  };
}

export async function updateProduct(
  productId: string,
  values: UpdateProductInput
) {
  const { data, error } =
    await supabase.rpc(
      "update_own_product",
      {
        p_product_id: productId,
        p_title: values.title,
        p_description:
          values.description,

        p_category_id:
          values.categoryId,

        p_subcategory_id:
          values.subcategoryId,

        p_condition:
          values.condition,

        p_location:
          values.location,
      }
    );

  return {
    data:
      (data as Product | null) ??
      null,

    error,
  };
}

export async function refreshProductMainImage(
  productId: string
) {
  return await supabase.rpc(
    "refresh_own_product_main_image_secure",
    {
      p_product_id: productId,
    }
  );
}

export async function deleteProduct(
  id: string
) {
  return await supabase.rpc(
    "delete_own_product",
    {
      p_product_id: id,
    }
  );
}

export async function markProductAsEnded(
  id: string
) {
  return await supabase.rpc(
    "close_own_finished_auction",
    {
      p_product_id: id,
    }
  );
}

export async function setProductWinner(
  productId: string,
  winnerId: string | null
) {
  void winnerId;

  return await supabase.rpc(
    "close_own_finished_auction",
    {
      p_product_id: productId,
    }
  );
}

export async function relistExpiredProduct(
  productId: string,
  durationDays: number
) {
  return await supabase.rpc(
    "relist_expired_product",
    {
      p_product_id: productId,
      p_duration_days: durationDays,
    }
  );
}