"use client";

import Link from "next/link";
import { useUserProducts } from "@/hooks/useUserProducts";
import ProductGrid from "@/components/product/ProductGrid";

export default function MyProductsPage() {
  const { products, loading } = useUserProducts();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Produsele mele
            </h1>
            <p className="mt-2 text-gray-600">
              Aici vezi toate produsele pe care le-ai adăugat.
            </p>
          </div>

          <Link
            href="/add-product"
            className="rounded-xl bg-black px-5 py-3 text-center font-semibold text-white hover:bg-gray-800"
          >
            Adaugă produs
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-600">Se încarcă produsele tale...</p>
        ) : products.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Nu ai adăugat produse încă
            </h2>

            <p className="mb-6 text-gray-600">
              Adaugă primul produs pentru a începe să vinzi.
            </p>

            <Link
              href="/add-product"
              className="rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Adaugă primul produs
            </Link>
          </div>
        ) : (
          <ProductGrid products={products} showFavorite={false} mode="owner" />
        )}
      </div>
    </main>
  );
}