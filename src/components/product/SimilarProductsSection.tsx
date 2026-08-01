"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Loader2,
} from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import { Product } from "@/types/product";
import { useMessages } from "@/i18n/useMessages";

type SimilarProductsSectionProps = {
  products: Product[];
  favoriteIds: string[];
  loading: boolean;
  categoryId: string | null;
  onToggleFavorite: (
    productId: string
  ) => void;
};

export default function SimilarProductsSection({
  products,
  favoriteIds,
  loading,
  categoryId,
  onToggleFavorite,
}: SimilarProductsSectionProps) {
  const messages = useMessages();
  const t = messages.productPage;

  return (
    <section className="mt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
            {t.similarEyebrow}
          </p>

          <h2 className="mt-1 text-3xl font-black text-slate-950">
            {t.similarTitle}
          </h2>

          <p className="mt-2 text-slate-600">
            {t.similarDescription}
          </p>
        </div>

        {categoryId && (
          <Link
            href={`/dashboard?category=${categoryId}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
          >
            {t.viewEntireCategory}
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Loader2
              size={24}
              className="animate-spin"
            />
          </div>

          <p className="text-slate-600">
            {t.loadingSimilarProducts}
          </p>
        </div>
      ) : products.length > 0 ? (
        <ProductGrid
          products={products}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          mode="marketplace"
        />
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <Boxes size={24} />
          </div>

          <p className="font-semibold text-slate-800">
            {t.noSimilarProducts}
          </p>

          <Link
            href="/dashboard"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-indigo-700"
          >
            {t.exploreAllAuctions}
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}