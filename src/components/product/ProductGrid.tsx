"use client";

import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  favoriteIds?: string[];
  onToggleFavorite?: (
    productId: string
  ) => void;
  onDeleteProduct?: (
    productId: string
  ) => void;
  onRelistProduct?: (
    productId: string,
    durationDays: number
  ) => Promise<void> | void;
  relistingProductId?: string | null;
  showFavorite?: boolean;
  mode?: "marketplace" | "owner";
};

export default function ProductGrid({
  products,
  favoriteIds = [],
  onToggleFavorite,
  onDeleteProduct,
  onRelistProduct,
  relistingProductId = null,
  showFavorite = true,
  mode = "marketplace",
}: ProductGridProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          imagePriority={index === 0}
          isFavorite={favoriteIds.includes(
            product.id
          )}
          onToggleFavorite={
            onToggleFavorite
          }
          onDeleteProduct={
            onDeleteProduct
          }
          onRelistProduct={
            onRelistProduct
          }
          relisting={
            relistingProductId === product.id
          }
          showFavorite={showFavorite}
          mode={mode}
        />
      ))}
    </div>
  );
}