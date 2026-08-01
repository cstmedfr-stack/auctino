"use client";

import {
  Loader2,
  PackageSearch,
  Store,
} from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import { Product } from "@/types/product";
import { useMessages } from "@/i18n/useMessages";

type PublicProfileProductsSectionProps = {
  products: Product[];
  loading: boolean;
  favoriteIds: string[];
  onToggleFavorite: (
    productId: string
  ) => void;
};

export default function PublicProfileProductsSection({
  products,
  loading,
  favoriteIds,
  onToggleFavorite,
}: PublicProfileProductsSectionProps) {
  const messages = useMessages();
  const t = messages.publicProfile;

  const productsCountText =
    t.productsCount.replace(
      "{count}",
      String(products.length)
    );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
            <Store size={16} />
            {t.productsEyebrow}
          </p>

          <h2 className="text-2xl font-bold text-slate-950">
            {t.productsTitle}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t.productsDescription}
          </p>
        </div>

        {!loading && products.length > 0 && (
          <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
            {productsCountText}
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600">
            <Loader2
              size={24}
              className="animate-spin"
            />
          </div>

          <p className="text-sm font-medium text-slate-600">
            {t.productsLoading}
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500">
            <PackageSearch size={24} />
          </div>

          <p className="font-semibold text-slate-900">
            {t.noProductsTitle}
          </p>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {t.noProductsDescription}
          </p>
        </div>
      ) : (
        <ProductGrid
          products={products}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          mode="marketplace"
        />
      )}
    </section>
  );
}