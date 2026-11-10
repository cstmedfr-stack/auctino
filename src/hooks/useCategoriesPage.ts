
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { useMessages } from "@/i18n/useMessages";

export type Category = {
  id: string;
  name_ro: string;
  name_fr: string | null;
  icon: string | null;
  display_order: number | null;
};

export type Subcategory = {
  id: string;
  category_id: string;
  name_ro: string;
  name_fr: string | null;
  display_order: number | null;
};

export function useCategoriesPage() {
  const messages = useMessages();
  const t = messages.categoriesPage;

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [subcategories, setSubcategories] =
    useState<Subcategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    const [categoriesResult, subcategoriesResult] =
      await Promise.all([
        supabase
          .from("categories")
          .select(
            "id, name_ro, name_fr, icon, display_order"
          )
          .eq("is_active", true)
          .order("display_order", {
            ascending: true,
          }),

        supabase
          .from("subcategories")
          .select(
            "id, category_id, name_ro, name_fr, display_order"
          )
          .eq("is_active", true)
          .order("display_order", {
            ascending: true,
          }),
      ]);

    if (categoriesResult.error) {
      console.error(
        "Categories load error:",
        categoriesResult.error.message
      );
      setError(t.loadError);
      setLoading(false);
      return;
    }

    if (subcategoriesResult.error) {
      console.error(
        "Subcategories load error:",
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
      (subcategoriesResult.data ?? []) as Subcategory[]
    );

    setLoading(false);
  }, [t.loadError, t.subcategoriesLoadError]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const subcategoriesByCategory = useMemo(() => {
    const grouped = new Map<string, Subcategory[]>();

    for (const subcategory of subcategories) {
      const current =
        grouped.get(subcategory.category_id) ?? [];

      current.push(subcategory);
      grouped.set(subcategory.category_id, current);
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
