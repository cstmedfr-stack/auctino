"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import {
  getFavoriteProducts,
  removeFavorite,
} from "@/services/favorite.service";
import { useMessages } from "@/i18n/useMessages";
import type { Product } from "@/types/product";

type FavoriteWithProduct = {
  id: string;
  product_id: string;
  products: Product | null;
};

type FavoriteProductRow = {
  id: string;
  product_id: string;
  products: Product | Product[] | null;
};

export function useFavoriteProducts() {
  const messages = useMessages();
  const t = messages.favoritesPage;

  const [favorites, setFavorites] =
    useState<FavoriteWithProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const products = useMemo(() => {
    return favorites
      .map((favorite) => favorite.products)
      .filter(
        (product): product is Product =>
          product !== null
      );
  }, [favorites]);

  const favoriteIds = useMemo(() => {
    return products.map((product) => product.id);
  }, [products]);

  const loadFavoriteProducts = useCallback(
    async () => {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setFavorites([]);
        setError(t.authRequired);
        setLoading(false);
        return;
      }

      const {
        data,
        error: favoritesError,
      } = await getFavoriteProducts(user.id);

      if (favoritesError) {
        console.error(
          t.loadError,
          favoritesError.message
        );

        setFavorites([]);
        setError(t.loadError);
        setLoading(false);
        return;
      }

      const normalizedFavorites = (
            (data ?? []) as unknown as FavoriteProductRow[]
            ).map((favorite) => {
            const product = Array.isArray(favorite.products)
                ? favorite.products[0] ?? null
                : favorite.products;

            return {
                id: favorite.id,
                product_id: favorite.product_id,
                products: product,
            };
            });

           setFavorites(normalizedFavorites);

      setLoading(false);
    },
    [t.authRequired, t.loadError]
  );

  const removeFavoriteProduct = useCallback(
    async (productId: string) => {
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(t.authRequired);
        return false;
      }

      const { error: removeError } =
        await removeFavorite(
          user.id,
          productId
        );

      if (removeError) {
        console.error(
          t.removeError,
          removeError.message
        );

        setError(t.removeError);
        return false;
      }

      setFavorites(
        (previousFavorites) =>
          previousFavorites.filter(
            (favorite) =>
              favorite.product_id !== productId
          )
      );

      return true;
    },
    [t.authRequired, t.removeError]
  );

  useEffect(() => {
    void loadFavoriteProducts();
  }, [loadFavoriteProducts]);

  return {
    products,
    favoriteIds,
    loading,
    error,
    loadFavoriteProducts,
    removeFavoriteProduct,
  };
}