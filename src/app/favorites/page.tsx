"use client";

import ProductGrid from "@/components/product/ProductGrid";
import FavoritesPageHeader from "@/components/favorites/FavoritesPageHeader";
import FavoritesPageState from "@/components/favorites/FavoritesPageState";
import { useFavoriteProducts } from "@/hooks/useFavoriteProducts";

export default function FavoritesPage() {
  const {
    products,
    favoriteIds,
    loading,
    error,
    loadFavoriteProducts,
    removeFavoriteProduct,
  } = useFavoriteProducts();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FavoritesPageHeader
          count={products.length}
        />

        {loading ? (
          <FavoritesPageState type="loading" />
        ) : error ? (
          <FavoritesPageState
            type="error"
            message={error}
            onRetry={() => {
              void loadFavoriteProducts();
            }}
          />
        ) : products.length === 0 ? (
          <FavoritesPageState type="empty" />
        ) : (
          <ProductGrid
            products={products}
            favoriteIds={favoriteIds}
            onToggleFavorite={(
              productId
            ) => {
              void removeFavoriteProduct(
                productId
              );
            }}
          />
        )}
      </div>
    </main>
  );
}