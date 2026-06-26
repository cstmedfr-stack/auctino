"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
} from "@/services/favorite.service";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  const fetchFavorites = async () => {
    setLoadingFavorites(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFavoriteIds([]);
      setLoadingFavorites(false);
      return;
    }

    const { data, error } = await getUserFavorites(user.id);

    if (!error && data) {
      setFavoriteIds(data.map((favorite) => favorite.product_id));
    }

    setLoadingFavorites(false);
  };

  const toggleFavorite = async (productId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Trebuie să fii logat ca să salvezi produsul la favorite.");
      return;
    }

    const isAlreadyFavorite = favoriteIds.includes(productId);

    if (isAlreadyFavorite) {
      const { error } = await removeFavorite(user.id, productId);

      if (!error) {
        setFavoriteIds((prev) => prev.filter((id) => id !== productId));
      }
    } else {
      const { error } = await addFavorite(user.id, productId);

      if (!error) {
        setFavoriteIds((prev) => [...prev, productId]);
      }
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return {
    favoriteIds,
    loadingFavorites,
    toggleFavorite,
    refreshFavorites: fetchFavorites,
  };
}