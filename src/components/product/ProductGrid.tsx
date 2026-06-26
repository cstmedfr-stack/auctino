"use client";

import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  favoriteIds?: string[];
  onToggleFavorite?: (productId: string) => void;
  showFavorite?: boolean;
  mode?: "marketplace" | "owner";
};

export default function ProductGrid({
  products,
  favoriteIds = [],
  onToggleFavorite,
  showFavorite = true,
  mode = "marketplace",
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavorite={favoriteIds.includes(product.id)}
          onToggleFavorite={onToggleFavorite}
          showFavorite={showFavorite}
          mode={mode}
        />
      ))}
    </div>
  );
}