"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Product } from "@/types/product";

import {
  getMarketplaceProducts,
  MarketplaceProductFilters,
} from "@/services/product.service";

const PAGE_SIZE = 24;

export function useProducts(
  filters: MarketplaceProductFilters
) {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [totalCount, setTotalCount] =
    useState(0);

  const [hasMore, setHasMore] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const requestIdRef =
    useRef(0);

  const search =
    filters.search ?? "";

  const categoryId =
    filters.categoryId ?? "";

  const subcategoryId =
    filters.subcategoryId ?? "";

  const county =
    filters.county ?? "";

  const condition =
    filters.condition ?? "";

  const minPrice =
    filters.minPrice ?? null;

  const maxPrice =
    filters.maxPrice ?? null;

  const sort =
    filters.sort ?? "newest";

  const loadFirstPage =
    useCallback(async () => {
      const requestId =
        ++requestIdRef.current;

      setLoading(true);
      setLoadingMore(false);
      setError("");

      const {
        data,
        error: productsError,
      } =
        await getMarketplaceProducts(
          {
            search,
            categoryId,
            subcategoryId,
            county,
            condition,
            minPrice,
            maxPrice,
            sort,
          },
          1,
          PAGE_SIZE
        );

      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      if (
        productsError ||
        !data
      ) {
        setProducts([]);
        setTotalCount(0);
        setHasMore(false);
        setPage(1);

        setError(
          productsError?.message ||
            "Produsele nu au putut fi încărcate."
        );

        setLoading(false);
        return;
      }

      setProducts(data.items);
      setTotalCount(
        data.totalCount
      );

      setHasMore(data.hasMore);
      setPage(1);
      setLoading(false);
    }, [
      search,
      categoryId,
      subcategoryId,
      county,
      condition,
      minPrice,
      maxPrice,
      sort,
    ]);

  useEffect(() => {
    void loadFirstPage();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadFirstPage]);

  const loadMore =
    useCallback(async () => {
      if (
        loading ||
        loadingMore ||
        !hasMore
      ) {
        return;
      }

      const nextPage =
        page + 1;

      const requestId =
        requestIdRef.current;

      setLoadingMore(true);
      setError("");

      const {
        data,
        error: productsError,
      } =
        await getMarketplaceProducts(
          {
            search,
            categoryId,
            subcategoryId,
            county,
            condition,
            minPrice,
            maxPrice,
            sort,
          },
          nextPage,
          PAGE_SIZE
        );

      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      if (
        productsError ||
        !data
      ) {
        setError(
          productsError?.message ||
            "Nu au putut fi încărcate mai multe produse."
        );

        setLoadingMore(false);
        return;
      }

      setProducts(
        (currentProducts) => {
          const existingIds =
            new Set(
              currentProducts.map(
                (product) =>
                  product.id
              )
            );

          const newProducts =
            data.items.filter(
              (product) =>
                !existingIds.has(
                  product.id
                )
            );

          return [
            ...currentProducts,
            ...newProducts,
          ];
        }
      );

      setTotalCount(
        data.totalCount
      );

      setHasMore(data.hasMore);
      setPage(nextPage);
      setLoadingMore(false);
    }, [
      loading,
      loadingMore,
      hasMore,
      page,
      search,
      categoryId,
      subcategoryId,
      county,
      condition,
      minPrice,
      maxPrice,
      sort,
    ]);

  return {
    products,
    totalCount,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
    refresh: loadFirstPage,
  };
}