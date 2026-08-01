"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Loader2,
  Package,
  Tags,
} from "lucide-react";

import { useCategoriesPage } from "@/hooks/useCategoriesPage";
import { useMessages } from "@/i18n/useMessages";

export default function CategoriesPage() {
  const messages = useMessages();
  const t = messages.categoriesPage;

  const {
    categories,
    subcategoriesByCategory,
    loading,
    error,
    loadCategories,
  } = useCategoriesPage();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl bg-slate-950 px-6 py-10 text-white sm:px-10">
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-200">
            <Tags size={17} />
            {t.eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-5xl">
            {t.title}
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            {t.description}
          </p>
        </section>

        {loading ? (
          <section className="mt-10 rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Loader2
                size={28}
                className="animate-spin"
              />
            </div>

            <h2 className="text-xl font-bold text-slate-950">
              {t.loadingTitle}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {t.loadingDescription}
            </p>
          </section>
        ) : error ? (
          <section className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-700">
              <AlertTriangle size={24} />
            </div>

            <h2 className="text-xl font-bold text-red-950">
              {t.errorTitle}
            </h2>

            <p className="mt-2 text-sm">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                void loadCategories();
              }}
              className="mt-5 rounded-2xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800"
            >
              {t.retry}
            </button>
          </section>
        ) : categories.length === 0 ? (
          <section className="mt-10 rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <Package size={24} />
            </div>

            <h2 className="text-xl font-bold text-slate-950">
              {t.emptyTitle}
            </h2>
          </section>
        ) : (
          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => {
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
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                        <Package size={28} />
                      </div>

                      <div>
                        <h2 className="text-xl font-black">
                          {category.name_ro}
                        </h2>

                        <p className="mt-1 text-sm text-slate-300">
                          {t.viewAllProducts}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="p-6">
                    {categorySubcategories.length >
                    0 ? (
                      <div className="flex flex-wrap gap-2">
                        {categorySubcategories.map(
                          (subcategory) => (
                            <Link
                              key={subcategory.id}
                              href={`/dashboard?category=${category.id}&subcategory=${subcategory.id}`}
                              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                            >
                              {subcategory.name_ro}
                            </Link>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        {t.noSubcategories}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}