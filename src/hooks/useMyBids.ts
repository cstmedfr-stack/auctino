"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { getMyBidProducts } from "@/services/my-bids.service";
import { useMessages } from "@/i18n/useMessages";
import type { MyBidProduct } from "@/types/my-bid";
import {
  BidFilter,
  filterMyBidProducts,
  getMyBidsStatistics,
} from "@/utils/myBids";

export function useMyBids() {
  const router = useRouter();
  const messages = useMessages();
  const t = messages.myBidsPage;

  const [products, setProducts] =
    useState<MyBidProduct[]>([]);

  const [filter, setFilter] =
    useState<BidFilter>("all");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadProducts = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setProducts([]);
        setError(t.authRequired);
        setLoading(false);
        setRefreshing(false);
        router.replace("/login");
        return;
      }

      const {
        data,
        error: bidsError,
      } = await getMyBidProducts();

      if (bidsError) {
        console.error(
          t.loadError,
          bidsError.message
        );

        setError(t.loadError);
        setProducts([]);
      } else {
        setProducts(
          (data ?? []) as MyBidProduct[]
        );
      }

      setLoading(false);
      setRefreshing(false);
    },
    [
      router,
      t.authRequired,
      t.loadError,
    ]
  );

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const statistics = useMemo(() => {
    return getMyBidsStatistics(products);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return filterMyBidProducts(
      products,
      filter
    );
  }, [products, filter]);

  return {
    products,
    filteredProducts,
    statistics,
    filter,
    setFilter,
    loading,
    refreshing,
    error,
    loadProducts,
  };
}