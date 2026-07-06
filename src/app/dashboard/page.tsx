"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { supabase } from "@/lib/supabase";

import { useProducts } from "@/hooks/useProducts";
import { useFavorites } from "@/hooks/useFavorites";

import {
  MarketplaceProductFilters,
  MarketplaceSort,
} from "@/services/product.service";

import ProductGrid from "@/components/product/ProductGrid";
import FilterSidebar from "@/components/marketplace/FilterSidebar";
import DashboardHeader from "@/components/marketplace/DashboardHeader";

import {
  ROMANIA_COUNTIES,
} from "@/constants/locations";

import {
  PRODUCT_CONDITIONS,
} from "@/constants/categories";

type CategoryOption = {
  id: string;
  name_ro: string;
  icon: string | null;
};

type SubcategoryOption = {
  id: string;
  category_id: string;
  name_ro: string;
};

function isMarketplaceSort(
  value: string | null
): value is MarketplaceSort {
  return [
    "newest",
    "ending",
    "price_asc",
    "price_desc",
    "bids",
  ].includes(value ?? "");
}

function parsePrice(
  value: string
) {
  if (!value.trim()) {
    return null;
  }

  const parsedValue =
    Number(value);

  if (
    !Number.isFinite(parsedValue) ||
    parsedValue < 0
  ) {
    return null;
  }

  return parsedValue;
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  const searchParams =
    useSearchParams();

  const searchParamsString =
    searchParams.toString();

  const [search, setSearch] =
    useState(
      () =>
        searchParams.get(
          "search"
        ) ?? ""
    );

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState(search);

  const [sort, setSort] =
    useState<MarketplaceSort>(
      () => {
        const querySort =
          searchParams.get("sort");

        return isMarketplaceSort(
          querySort
        )
          ? querySort
          : "newest";
      }
    );

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState(
    () =>
      searchParams.get(
        "category"
      ) ?? ""
  );

  const [
    selectedSubcategoryId,
    setSelectedSubcategoryId,
  ] = useState(
    () =>
      searchParams.get(
        "subcategory"
      ) ?? ""
  );

  const [
    selectedCounty,
    setSelectedCounty,
  ] = useState(
    () =>
      searchParams.get(
        "county"
      ) ?? ""
  );

  const [
    selectedCondition,
    setSelectedCondition,
  ] = useState(
    () =>
      searchParams.get(
        "condition"
      ) ?? ""
  );

  const [minPrice, setMinPrice] =
    useState(
      () =>
        searchParams.get(
          "minPrice"
        ) ?? ""
    );

  const [maxPrice, setMaxPrice] =
    useState(
      () =>
        searchParams.get(
          "maxPrice"
        ) ?? ""
    );

  const [
    categories,
    setCategories,
  ] = useState<
    CategoryOption[]
  >([]);

  const [
    subcategories,
    setSubcategories,
  ] = useState<
    SubcategoryOption[]
  >([]);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setDebouncedSearch(
          search.trim()
        );
      }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  const marketplaceFilters =
    useMemo<
      MarketplaceProductFilters
    >(
      () => ({
        search:
          debouncedSearch,

        categoryId:
          selectedCategoryId,

        subcategoryId:
          selectedSubcategoryId,

        county:
          selectedCounty,

        condition:
          selectedCondition,

        minPrice:
          parsePrice(minPrice),

        maxPrice:
          parsePrice(maxPrice),

        sort,
      }),
      [
        debouncedSearch,
        selectedCategoryId,
        selectedSubcategoryId,
        selectedCounty,
        selectedCondition,
        minPrice,
        maxPrice,
        sort,
      ]
    );

  const {
    products,
    totalCount,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
    refresh,
  } = useProducts(
    marketplaceFilters
  );

  const {
    favoriteIds,
    toggleFavorite,
  } = useFavorites();

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      const {
        data,
        error: categoriesError,
      } = await supabase
        .from("categories")
        .select(
          "id, name_ro, icon"
        )
        .eq("is_active", true)
        .order(
          "display_order",
          {
            ascending: true,
          }
        );

      if (
        cancelled ||
        categoriesError
      ) {
        return;
      }

      setCategories(
        (data ?? []) as CategoryOption[]
      );
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSubcategories() {
      if (!selectedCategoryId) {
        setSubcategories([]);
        return;
      }

      const {
        data,
        error:
          subcategoriesError,
      } = await supabase
        .from("subcategories")
        .select(
          "id, category_id, name_ro"
        )
        .eq(
          "category_id",
          selectedCategoryId
        )
        .eq("is_active", true)
        .order(
          "display_order",
          {
            ascending: true,
          }
        );

      if (
        cancelled ||
        subcategoriesError
      ) {
        return;
      }

      setSubcategories(
        (data ??
          []) as SubcategoryOption[]
      );
    }

    void loadSubcategories();

    return () => {
      cancelled = true;
    };
  }, [selectedCategoryId]);

  /*
   * Sincronizare când utilizatorul folosește
   * Back/Forward în browser sau caută din Navbar.
   */
  useEffect(() => {
    const nextSearch =
      searchParams.get(
        "search"
      ) ?? "";

    const nextCategory =
      searchParams.get(
        "category"
      ) ?? "";

    const nextSubcategory =
      searchParams.get(
        "subcategory"
      ) ?? "";

    const nextCounty =
      searchParams.get(
        "county"
      ) ?? "";

    const nextCondition =
      searchParams.get(
        "condition"
      ) ?? "";

    const nextMinPrice =
      searchParams.get(
        "minPrice"
      ) ?? "";

    const nextMaxPrice =
      searchParams.get(
        "maxPrice"
      ) ?? "";

    const querySort =
      searchParams.get("sort");

    const nextSort =
      isMarketplaceSort(
        querySort
      )
        ? querySort
        : "newest";

    setSearch(
      (current) =>
        current === nextSearch
          ? current
          : nextSearch
    );

    setSelectedCategoryId(
      (current) =>
        current === nextCategory
          ? current
          : nextCategory
    );

    setSelectedSubcategoryId(
      (current) =>
        current ===
        nextSubcategory
          ? current
          : nextSubcategory
    );

    setSelectedCounty(
      (current) =>
        current === nextCounty
          ? current
          : nextCounty
    );

    setSelectedCondition(
      (current) =>
        current === nextCondition
          ? current
          : nextCondition
    );

    setMinPrice(
      (current) =>
        current === nextMinPrice
          ? current
          : nextMinPrice
    );

    setMaxPrice(
      (current) =>
        current === nextMaxPrice
          ? current
          : nextMaxPrice
    );

    setSort(
      (current) =>
        current === nextSort
          ? current
          : nextSort
    );
  }, [
    searchParams,
    searchParamsString,
  ]);

  /*
   * Salvăm filtrele în URL.
   */
  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        const params =
          new URLSearchParams();

        const cleanSearch =
          search.trim();

        if (cleanSearch) {
          params.set(
            "search",
            cleanSearch
          );
        }

        if (
          selectedCategoryId
        ) {
          params.set(
            "category",
            selectedCategoryId
          );
        }

        if (
          selectedSubcategoryId
        ) {
          params.set(
            "subcategory",
            selectedSubcategoryId
          );
        }

        if (selectedCounty) {
          params.set(
            "county",
            selectedCounty
          );
        }

        if (
          selectedCondition
        ) {
          params.set(
            "condition",
            selectedCondition
          );
        }

        if (minPrice) {
          params.set(
            "minPrice",
            minPrice
          );
        }

        if (maxPrice) {
          params.set(
            "maxPrice",
            maxPrice
          );
        }

        if (sort !== "newest") {
          params.set(
            "sort",
            sort
          );
        }

        const nextQuery =
          params.toString();

        if (
          nextQuery ===
          searchParamsString
        ) {
          return;
        }

        router.replace(
          nextQuery
            ? `${pathname}?${nextQuery}`
            : pathname,
          {
            scroll: false,
          }
        );
      }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    search,
    sort,
    selectedCategoryId,
    selectedSubcategoryId,
    selectedCounty,
    selectedCondition,
    minPrice,
    maxPrice,
    pathname,
    router,
    searchParamsString,
  ]);

  const hasActiveFilters =
    Boolean(
      search ||
        selectedCategoryId ||
        selectedSubcategoryId ||
        selectedCounty ||
        selectedCondition ||
        minPrice ||
        maxPrice ||
        sort !== "newest"
    );

  function resetFilters() {
    setSearch("");
    setDebouncedSearch("");
    setSelectedCategoryId("");
    setSelectedSubcategoryId("");
    setSelectedCounty("");
    setSelectedCondition("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");

    router.replace(
      pathname,
      {
        scroll: false,
      }
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto w-full max-w-7xl">
        <section className="mb-10 rounded-3xl bg-black p-8 text-white">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-sm text-gray-300">
                Vendora Dashboard
              </p>

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
          <DashboardHeader
            totalResults={totalCount}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />

          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <FilterSidebar>
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="🔍 Caută produse..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

              <select
                value={
                  selectedCategoryId
                }
                onChange={(event) => {
                  setSelectedCategoryId(
                    event.target.value
                  );

                  setSelectedSubcategoryId(
                    ""
                  );
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              >
                <option value="">
                  Toate categoriile
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={
                        category.id
                      }
                    >
                      {category.icon}{" "}
                      {category.name_ro}
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  selectedSubcategoryId
                }
                onChange={(event) =>
                  setSelectedSubcategoryId(
                    event.target.value
                  )
                }
                disabled={
                  !selectedCategoryId
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">
                  {selectedCategoryId
                    ? "Toate subcategoriile"
                    : "Alege întâi categoria"}
                </option>

                {subcategories.map(
                  (subcategory) => (
                    <option
                      key={
                        subcategory.id
                      }
                      value={
                        subcategory.id
                      }
                    >
                      {
                        subcategory.name_ro
                      }
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  selectedCounty
                }
                onChange={(event) =>
                  setSelectedCounty(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              >
                <option value="">
                  Toate județele
                </option>

                {ROMANIA_COUNTIES.map(
                  (county) => (
                    <option
                      key={county}
                      value={county}
                    >
                      {county}
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  selectedCondition
                }
                onChange={(event) =>
                  setSelectedCondition(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              >
                <option value="">
                  Toate stările
                </option>

                {PRODUCT_CONDITIONS.map(
                  (condition) => (
                    <option
                      key={condition}
                      value={condition}
                    >
                      {condition}
                    </option>
                  )
                )}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) =>
                    setMinPrice(
                      event.target.value
                    )
                  }
                  placeholder="Preț minim"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(
                      event.target.value
                    )
                  }
                  placeholder="Preț maxim"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target
                      .value as MarketplaceSort
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              >
                <option value="newest">
                  Cele mai noi
                </option>

                <option value="ending">
                  Se termină curând
                </option>

                <option value="price_asc">
                  Preț crescător
                </option>

                <option value="price_desc">
                  Preț descrescător
                </option>

                <option value="bids">
                  Cele mai multe oferte
                </option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Resetează filtrele
                </button>
              )}
            </FilterSidebar>

            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">
                  {loading
                    ? "Se caută produsele..."
                    : `${totalCount} rezultate găsite`}
                </p>

                {!loading &&
                  products.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Sunt afișate{" "}
                      {products.length} din{" "}
                      {totalCount}
                    </p>
                  )}
              </div>

              {error &&
              products.length === 0 ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                  <h3 className="text-lg font-bold text-red-800">
                    Produsele nu au putut fi încărcate
                  </h3>

                  <p className="mt-2 text-sm text-red-700">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void refresh()
                    }
                    className="mt-5 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
                  >
                    Încearcă din nou
                  </button>
                </div>
              ) : loading ? (
                <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

                  <p className="text-gray-600">
                    Se încarcă produsele...
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    {hasActiveFilters
                      ? "Nu am găsit produse"
                      : "Nu există produse încă"}
                  </h3>

                  <p className="mb-6 text-gray-600">
                    {hasActiveFilters
                      ? "Modifică sau resetează filtrele pentru a vedea mai multe produse."
                      : "Adaugă primul produs pentru a testa marketplace-ul."}
                  </p>

                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={
                        resetFilters
                      }
                      className="rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
                    >
                      Resetează filtrele
                    </button>
                  ) : (
                    <Link
                      href="/add-product"
                      className="rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
                    >
                      Adaugă primul produs
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <ProductGrid
                    products={
                      products
                    }
                    favoriteIds={
                      favoriteIds
                    }
                    onToggleFavorite={
                      toggleFavorite
                    }
                    mode="marketplace"
                  />

                  {error && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {hasMore && (
                    <div className="mt-10 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          void loadMore()
                        }
                        disabled={
                          loadingMore
                        }
                        className="min-w-56 rounded-2xl bg-black px-6 py-4 font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loadingMore
                          ? "Se încarcă..."
                          : "Încarcă mai multe"}
                      </button>
                    </div>
                  )}

                  {!hasMore &&
                    totalCount > 0 && (
                      <p className="mt-10 text-center text-sm text-gray-500">
                        Ai ajuns la finalul rezultatelor.
                      </p>
                    )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}