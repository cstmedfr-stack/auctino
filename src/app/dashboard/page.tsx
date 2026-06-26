"use client";

import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { useFavorites } from "@/hooks/useFavorites";
import ProductGrid from "@/components/product/ProductGrid";

export default function DashboardPage() {
  const { products, loading } = useProducts();
  const { favoriteIds, toggleFavorite } = useFavorites();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto w-full max-w-7xl">
        <section className="mb-10 rounded-3xl bg-black p-8 text-white">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-sm text-gray-300">Vendora Dashboard</p>
              <h1 className="text-3xl font-bold md:text-4xl">
                Marketplace-ul tău de licitații
              </h1>
              <p className="mt-3 max-w-2xl text-gray-300">
                Adaugă produse, urmărește licitații și descoperă oferte active.
              </p>
            </div>

            <Link
              href="/add-product"
              className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-black hover:bg-gray-100"
            >
              Adaugă produs
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Toate licitațiile
            </h2>
            <p className="text-gray-600">
              Produse active adăugate de utilizatori.
            </p>
          </div>

          {loading ? (
            <p className="text-gray-600">Se încarcă produsele...</p>
          ) : products.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Nu există produse încă
              </h3>

              <p className="mb-6 text-gray-600">
                Adaugă primul produs pentru a testa marketplace-ul.
              </p>

              <Link
                href="/add-product"
                className="rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
              >
                Adaugă primul produs
              </Link>
            </div>
          ) : (
            <ProductGrid
              products={products}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              mode="marketplace"
            />
          )}
        </section>
      </div>
    </main>
  );
}