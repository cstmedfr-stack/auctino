"use client";

import {  useEffect,  useMemo,  useState,} from "react";
import Link from "next/link";
import {  usePathname,  useRouter,  useSearchParams,} from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useProducts } from "@/hooks/useProducts";
import { useFavorites } from "@/hooks/useFavorites";
import {  MarketplaceProductFilters,  MarketplaceSort,} from "@/services/product.service";
import ProductGrid from "@/components/product/ProductGrid";
import ProductFilters from "@/components/product/ProductFilters";
import FilterSidebar from "@/components/marketplace/FilterSidebar";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import { ROMANIA_COUNTIES } from "@/constants/locations";
import { PRODUCT_CONDITIONS } from "@/constants/categories";
import { useMessages } from "@/i18n/useMessages";
import {  SlidersHorizontal,  X,} from "lucide-react";

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

function parsePrice(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsedValue = Number(value);

  if (
    !Number.isFinite(parsedValue) ||
    parsedValue < 0
  ) {
    return null;
  }

  return parsedValue;
}

function formatMessage(
  template: string,
  values: Record<string, string | number>
) {
  return Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replace(
        `{${key}}`,
        String(value)
      ),
    template
  );
}

export default function DashboardPage() {
  const messages = useMessages();
  const t = messages.marketplace;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamsString =
    searchParams.toString();

  const [search, setSearch] =
    useState(
      () =>
        searchParams.get("search") ?? ""
    );

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState(search);

  const [sort, setSort] =
    useState<MarketplaceSort>(() => {
      const querySort =
        searchParams.get("sort");

      return isMarketplaceSort(querySort)
        ? querySort
        : "newest";
    });

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState(
    () =>
      searchParams.get("category") ?? ""
  );

  const [
    selectedSubcategoryId,
    setSelectedSubcategoryId,
  ] = useState(
    () =>
      searchParams.get("subcategory") ?? ""
  );

  const [
    selectedCounty,
    setSelectedCounty,
  ] = useState(
    () =>
      searchParams.get("county") ?? ""
  );

  const [
    selectedCondition,
    setSelectedCondition,
  ] = useState(
    () =>
      searchParams.get("condition") ?? ""
  );

  const [minPrice, setMinPrice] =
    useState(
      () =>
        searchParams.get("minPrice") ?? ""
    );

  const [maxPrice, setMaxPrice] =
    useState(
      () =>
        searchParams.get("maxPrice") ?? ""
    );
    const [mobileFiltersOpen, setMobileFiltersOpen] =
  useState(false);

  const [
    categories,
    setCategories,
  ] = useState<CategoryOption[]>([]);

  const [
    subcategories,
    setSubcategories,
  ] = useState<SubcategoryOption[]>([]);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setDebouncedSearch(search.trim());
      }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  const marketplaceFilters =
    useMemo<MarketplaceProductFilters>(
      () => ({
        search: debouncedSearch,
        categoryId: selectedCategoryId,
        subcategoryId:
          selectedSubcategoryId,
        county: selectedCounty,
        condition: selectedCondition,
        minPrice: parsePrice(minPrice),
        maxPrice: parsePrice(maxPrice),
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
  } = useProducts(marketplaceFilters);

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
        .select("id, name_ro, icon")
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

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
        .order("display_order", {
          ascending: true,
        });

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

  useEffect(() => {
    const nextSearch =
      searchParams.get("search") ?? "";

    const nextCategory =
      searchParams.get("category") ?? "";

    const nextSubcategory =
      searchParams.get("subcategory") ?? "";

    const nextCounty =
      searchParams.get("county") ?? "";

    const nextCondition =
      searchParams.get("condition") ?? "";

    const nextMinPrice =
      searchParams.get("minPrice") ?? "";

    const nextMaxPrice =
      searchParams.get("maxPrice") ?? "";

    const querySort =
      searchParams.get("sort");

    const nextSort =
      isMarketplaceSort(querySort)
        ? querySort
        : "newest";

    setSearch((current) =>
      current === nextSearch
        ? current
        : nextSearch
    );

    setSelectedCategoryId((current) =>
      current === nextCategory
        ? current
        : nextCategory
    );

    setSelectedSubcategoryId(
      (current) =>
        current === nextSubcategory
          ? current
          : nextSubcategory
    );

    setSelectedCounty((current) =>
      current === nextCounty
        ? current
        : nextCounty
    );

    setSelectedCondition((current) =>
      current === nextCondition
        ? current
        : nextCondition
    );

    setMinPrice((current) =>
      current === nextMinPrice
        ? current
        : nextMinPrice
    );

    setMaxPrice((current) =>
      current === nextMaxPrice
        ? current
        : nextMaxPrice
    );

    setSort((current) =>
      current === nextSort
        ? current
        : nextSort
    );
  }, [
    searchParams,
    searchParamsString,
  ]);

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

        if (selectedCategoryId) {
          params.set(
            "category",
            selectedCategoryId
          );
        }

        if (selectedSubcategoryId) {
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

        if (selectedCondition) {
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
          params.set("sort", sort);
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
    setMobileFiltersOpen(false);

    router.replace(pathname, {
      scroll: false,
    });
  }
  const filtersPanel = (
    <ProductFilters
      search={search}
      selectedCategoryId={
        selectedCategoryId
      }
      selectedSubcategoryId={
        selectedSubcategoryId
      }
      selectedCounty={selectedCounty}
      selectedCondition={
        selectedCondition
      }
      minPrice={minPrice}
      maxPrice={maxPrice}
      sort={sort}
      categories={categories}
      subcategories={subcategories}
      counties={ROMANIA_COUNTIES}
      conditions={PRODUCT_CONDITIONS}
      hasActiveFilters={hasActiveFilters}
      onSearchChange={setSearch}
      onCategoryChange={(value) => {
        setSelectedCategoryId(value);
        setSelectedSubcategoryId("");
      }}
      onSubcategoryChange={
        setSelectedSubcategoryId
      }
      onCountyChange={setSelectedCounty}
      onConditionChange={
        setSelectedCondition
      }
      onMinPriceChange={setMinPrice}
      onMaxPriceChange={setMaxPrice}
      onSortChange={setSort}
      onResetFilters={resetFilters}
    />
  );
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <MarketplaceHeader
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
<div className="mb-6 lg:hidden">
  <button
    type="button"
    onClick={() =>
      setMobileFiltersOpen(true)
    }
    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm"
  >
    <SlidersHorizontal size={18} />
    {t.filtersTitle}
  </button>
</div>

{mobileFiltersOpen && (
  <div className="fixed inset-0 z-50 lg:hidden">
    <button
      type="button"
      aria-label={t.resetFilters}
      onClick={() =>
        setMobileFiltersOpen(false)
      }
      className="absolute inset-0 bg-slate-950/40"
    />

    <aside className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-black text-slate-950">
          {t.filtersTitle}
        </p>

        <button
          type="button"
          onClick={() =>
            setMobileFiltersOpen(false)
          }
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      {filtersPanel}
    </aside>
  </div>
)}
        <section>
       <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
           <div className="hidden lg:block">
                <FilterSidebar>
                  {filtersPanel}
                </FilterSidebar>
              </div>

            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-600">
                  {loading
                    ? t.searchingProducts
                    : formatMessage(
                        t.resultsFound,
                        {
                          count:
                            totalCount,
                        }
                      )}
                </p>

                {!loading &&
                  products.length > 0 && (
                    <p className="text-sm text-slate-500">
                      {formatMessage(
                        t.showingResults,
                        {
                          shown:
                            products.length,
                          total:
                            totalCount,
                        }
                      )}
                    </p>
                  )}
              </div>

              {error &&
              products.length === 0 ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                  <h3 className="text-lg font-bold text-red-800">
                    {
                      t.productsLoadErrorTitle
                    }
                  </h3>

                  <p className="mt-2 text-sm text-red-700">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void refresh()
                    }
                    className="mt-5 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-800"
                  >
                    {t.retry}
                  </button>
                </div>
              ) : loading ? (
                <ProductGridSkeleton
                  label={
                    t.loadingProducts
                  }
                />
              ) : products.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <h3 className="mb-2 text-xl font-semibold text-slate-950">
                    {hasActiveFilters
                      ? t.emptyFilteredTitle
                      : t.emptyTitle}
                  </h3>

                  <p className="mx-auto mb-6 max-w-xl text-slate-600">
                    {hasActiveFilters
                      ? t.emptyFilteredDescription
                      : t.emptyDescription}
                  </p>

                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={
                        resetFilters
                      }
                      className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                    >
                      {t.resetFilters}
                    </button>
                  ) : (
                    <Link
                      href="/add-product"
                      className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                    >
                      {t.addFirstProduct}
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <ProductGrid
                    products={products}
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
                        className="min-w-56 rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loadingMore
                          ? t.loadingMore
                          : t.loadMore}
                      </button>
                    </div>
                  )}

                  {!hasMore &&
                    totalCount > 0 && (
                      <p className="mt-10 text-center text-sm text-slate-500">
                        {t.endOfResults}
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

function ProductGridSkeleton({
  label,
}: {
  label: string;
}) {
  return (
    <div>
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

        <p className="text-sm font-medium text-slate-600">
          {label}
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <div
            key={index}
            className="h-[420px] animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="h-56 rounded-t-3xl bg-slate-100" />
            <div className="space-y-4 p-5">
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-5 w-3/4 rounded bg-slate-100" />
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-4 w-2/3 rounded bg-slate-100" />
              <div className="h-16 rounded-2xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}