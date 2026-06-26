"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/product/ProductGrid";
import { Product } from "@/types/product";
import {
  getFavoriteProducts,
  removeFavorite,
} from "@/services/favorite.service";

type FavoriteWithProduct = {
  id: string;
  product_id: string;
  products: Product | null;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const products = favorites
    .map((favorite) => favorite.products)
    .filter((product): product is Product => product !== null);

  const favoriteIds = products.map((product) => product.id);

  useEffect(() => {
    const fetchFavorites = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await getFavoriteProducts(user.id);

      if (error) {
        console.error("Eroare favorite:", error.message);
      } else {
        setFavorites((data || []) as FavoriteWithProduct[]);
      }

      setLoading(false);
    };

    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (productId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await removeFavorite(user.id, productId);

    if (!error) {
      setFavorites((prev) =>
        prev.filter((favorite) => favorite.product_id !== productId)
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Favoritele mele</h1>
          <p className="mt-2 text-gray-600">
            Produsele pe care le-ai salvat pentru mai târziu.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-600">Se încarcă favoritele...</p>
        ) : products.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Nu ai produse favorite încă
            </h2>

            <p className="mb-6 text-gray-600">
              Salvează produse din dashboard apăsând pe inimioară.
            </p>

            <Link
              href="/dashboard"
              className="rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Mergi la dashboard
            </Link>
          </div>
        ) : (
          <ProductGrid
            products={products}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </div>
    </main>
  );
}