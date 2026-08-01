"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { finalizeAuctionAndCreateTransaction } from "@/lib/transactions";
import { getMyReceivedBidProducts } from "@/services/received-bids.service";
import { useMessages } from "@/i18n/useMessages";
import type { ReceivedBidProduct } from "@/types/received-bid";
import {
  filterReceivedBidProducts,
  getReceivedBidStatistics,
  type ReceivedBidFilter,
} from "@/utils/receivedBids";

export function useReceivedBids() {
  const router = useRouter();
  const messages = useMessages();
  const t = messages.receivedBidsPage;

  const [products, setProducts] =
    useState<ReceivedBidProduct[]>([]);

  const [filter, setFilter] =
    useState<ReceivedBidFilter>("all");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [
    finalizingProductId,
    setFinalizingProductId,
  ] = useState<string | null>(null);

  const [
    confirmationProductId,
    setConfirmationProductId,
  ] = useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [actionError, setActionError] =
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
        error: receivedBidsError,
      } = await getMyReceivedBidProducts();

      if (receivedBidsError) {
        console.error(
          t.loadError,
          receivedBidsError.message
        );

        setProducts([]);
        setError(t.loadError);
      } else {
        setProducts(data);
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
    return getReceivedBidStatistics(products);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return filterReceivedBidProducts(
      products,
      filter
    );
  }, [products, filter]);

  function requestFinalizeAuction(
    productId: string
  ) {
    setActionError("");
    setConfirmationProductId(productId);
  }

  function cancelFinalizeAuction() {
    if (finalizingProductId) {
      return;
    }

    setConfirmationProductId(null);
  }

  async function confirmFinalizeAuction(
    productId: string
  ) {
    setFinalizingProductId(productId);
    setActionError("");

    const { data, error: finalizeError } =
      await finalizeAuctionAndCreateTransaction(
        productId
      );

    if (finalizeError) {
      setActionError(
        finalizeError.message || t.finalizeError
      );
      setFinalizingProductId(null);
      return;
    }

    if (!data) {
      setActionError(t.finalizeError);
      setFinalizingProductId(null);
      setConfirmationProductId(null);
      await loadProducts(true);
      return;
    }

    setFinalizingProductId(null);
    setConfirmationProductId(null);

    router.push(`/transactions/${productId}`);
  }

  return {
    products,
    filteredProducts,
    statistics,
    filter,
    setFilter,
    loading,
    refreshing,
    error,
    actionError,
    finalizingProductId,
    confirmationProductId,
    loadProducts,
    requestFinalizeAuction,
    cancelFinalizeAuction,
    confirmFinalizeAuction,
  };
}