"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import {
  addFavorite,
  getUserFavorites,
  removeFavorite,
} from "@/services/favorite.service";
import { useMessages } from "@/i18n/useMessages";

export function useFavorites() {
  const messages = useMessages();
  const t = messages.favoritesPage;

  const [favoriteIds, setFavoriteIds] =
    useState<string[]>([]);

  const [
    loadingFavorites,
    setLoadingFavorites,
  ] = useState(true);

  const [error, setError] =
    useState("");

  const fetchFavorites = useCallback(
    async () => {
      setLoadingFavorites(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setFavoriteIds([]);
        setLoadingFavorites(false);
        return;
      }

      const {
        data,
        error: favoritesError,
      } = await getUserFavorites(user.id);

      if (favoritesError) {
        console.error(
          t.loadError,
          favoritesError.message
        );

        setError(t.loadError);
        setLoadingFavorites(false);
        return;
      }

      setFavoriteIds(
        (data ?? []).map(
          (favorite) => favorite.product_id
        )
      );

      setLoadingFavorites(false);
    },
    [t.loadError]
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(t.authRequiredToggle);
        return false;
      }

      const isAlreadyFavorite =
        favoriteIds.includes(productId);

      if (isAlreadyFavorite) {
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

        setFavoriteIds((previousIds) =>
          previousIds.filter(
            (id) => id !== productId
          )
        );

        return true;
      }

      const { error: addError } =
        await addFavorite(
          user.id,
          productId
        );

      if (addError) {
        console.error(
          t.addError,
          addError.message
        );

        setError(t.addError);
        return false;
      }

      setFavoriteIds((previousIds) => {
        if (previousIds.includes(productId)) {
          return previousIds;
        }

        return [...previousIds, productId];
      });

      return true;
    },
    [
      favoriteIds,
      t.addError,
      t.authRequiredToggle,
      t.removeError,
    ]
  );

  useEffect(() => {
    void fetchFavorites();
  }, [fetchFavorites]);

  return {
    favoriteIds,
    loadingFavorites,
    error,
    toggleFavorite,
    refreshFavorites: fetchFavorites,
  };
}