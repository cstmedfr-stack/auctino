"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name_ro: string;
  icon: string | null;
  display_order: number | null;
};

type Subcategory = {
  id: string;
  category_id: string;
  name_ro: string;
  display_order: number | null;
};

export default function CategoriesPage() {
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

  useEffect(() => {
    let cancelled = false;

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

      if (cancelled) {
        return;
      }

      if (categoriesResult.error) {
        setError(
          categoriesResult.error.message ||
            "Categoriile nu au putut fi încărcate."
        );

        setLoading(false);
        return;
      }

      if (subcategoriesResult.error) {
        setError(
          subcategoriesResult.error.message ||
            "Subcategoriile nu au putut fi încărcate."
        );

        setLoading(false);
        return;
      }

      setCategories(
        (categoriesResult.data ??
          []) as Category[]
      );

      setSubcategories(
        (subcategoriesResult.data ??
          []) as Subcategory[]
      );

      setLoading(false);
    }

    void loadCategories();

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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl bg-slate-950 px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-400">
            Vendora
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-5xl">
            Explorează categoriile
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Descoperă rapid produsele și licitațiile care te interesează.
          </p>
        </section>

        {loading ? (
          <div className="mt-10 rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-black" />

            <p className="text-slate-600">
              Se încarcă categoriile...
            </p>
          </div>
        ) : error ? (
          <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold">
              Nu există categorii active
            </h2>
          </div>
        ) : (
          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.map(
              (category) => {
                const categorySubcategories =
                  subcategoriesByCategory.get(
                    category.id
                  ) ?? [];

                return (
                  <article
                    key={category.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link
                      href={`/dashboard?category=${category.id}`}
                      className="block bg-slate-950 px-6 py-6 text-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                          {category.icon ||
                            "📦"}
                        </div>

                        <div>
                          <h2 className="text-xl font-black">
                            {category.name_ro}
                          </h2>

                          <p className="mt-1 text-sm text-slate-300">
                            Vezi toate produsele
                          </p>
                        </div>
                      </div>
                    </Link>

                    <div className="p-6">
                      {categorySubcategories.length >
                      0 ? (
                        <div className="flex flex-wrap gap-2">
                          {categorySubcategories.map(
                            (
                              subcategory
                            ) => (
                              <Link
                                key={
                                  subcategory.id
                                }
                                href={`/dashboard?category=${category.id}&subcategory=${subcategory.id}`}
                                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                              >
                                {
                                  subcategory.name_ro
                                }
                              </Link>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Nu există subcategorii disponibile.
                        </p>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}
      </div>
    </main>
  );
}