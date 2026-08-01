"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { useMessages } from "@/i18n/useMessages";

export type Category = {
  id: string;
  name_ro: string;
  icon: string | null;
  display_order: number | null;
};

export type Subcategory = {
  id: string;
  category_id: string;
  name_ro: string;
  display_order: number | null;
};

export function useCategoriesPage() {
  const messages = useMessages();
  const t = messages.categoriesPage;

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [
    subcategories,
    setSubcategories,
  ] = useState<Subcategory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");

    const [
      categoriesResult,
      subcategoriesResult,
    ] = await Promise.all([
      supabase
        .from("categories")
        .select(
          "id, name_ro, icon, display_order"
        )
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        }),

      supabase
        .from("subcategories")
        .select(
          "id, category_id, name_ro, display_order"
        )
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        }),
    ]);

    if (categoriesResult.error) {
      console.error(
        t.loadError,
        categoriesResult.error.message
      );

      setError(t.loadError);
      setLoading(false);
      return;
    }

    if (subcategoriesResult.error) {
      console.error(
        t.subcategoriesLoadError,
        subcategoriesResult.error.message
      );

      setError(t.subcategoriesLoadError);
      setLoading(false);
      return;
    }

    setCategories(
      (categoriesResult.data ?? []) as Category[]
    );

    setSubcategories(
      (subcategoriesResult.data ??
        []) as Subcategory[]
    );

    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      await loadCategories();

      if (cancelled) {
        return;
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  const subcategoriesByCategory =
    useMemo(() => {
      const grouped =
        new Map<string, Subcategory[]>();

      for (const subcategory of subcategories) {
        const current =
          grouped.get(
            subcategory.category_id
          ) ?? [];

        current.push(subcategory);

        grouped.set(
          subcategory.category_id,
          current
        );
      }

      return grouped;
    }, [subcategories]);

  return {
    categories,
    subcategoriesByCategory,
    loading,
    error,
    loadCategories,
  };
}