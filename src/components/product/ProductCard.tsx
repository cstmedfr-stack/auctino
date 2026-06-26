"use client";

import Link from "next/link";
import { Product } from "@/types/product";
import FavoriteButton from "./FavoriteButton";

type ProductCardProps = {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
  showFavorite?: boolean;
  mode?: "marketplace" | "owner";
};

export default function ProductCard({
  product,
  isFavorite = false,
  onToggleFavorite,
  showFavorite = true,
  mode = "marketplace",
}: ProductCardProps) {
  return (
    <article className="w-full min-w-0 overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-48 items-center justify-center bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm text-gray-400">Fără imagine</span>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {product.category || "Fără categorie"}
          </span>

          <span className="text-xs text-gray-500">
            {product.location || "Fără locație"}
          </span>
        </div>

        <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900">
          {product.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
          {product.description || "Fără descriere."}
        </p>

        <div className="mb-4 rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Preț curent</p>
          <p className="text-2xl font-bold text-gray-900">
            {product.current_price ?? product.starting_price} €
          </p>
        </div>

        {mode === "marketplace" ? (
          <div className="flex gap-2">
            {showFavorite && onToggleFavorite && (
              <FavoriteButton
                isFavorite={isFavorite}
                onClick={() => onToggleFavorite(product.id)}
              />
            )}

            <Link
              href={`/products/${product.id}`}
              className="flex-[2] rounded-xl bg-black px-4 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
            >
              Vezi licitația
            </Link>
          </div>
        ) : (
         <div className="flex gap-2">
            <Link
              href={`/edit-product/${product.id}`}
              className="flex-1 rounded-xl bg-black px-4 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
            >
              Editează
            </Link>

           <button className="flex-1 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
             Șterge
            </button>
          </div>
        )}
      </div>
    </article>
  );
}