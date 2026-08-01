"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { getMyTransactions } from "@/lib/transactions";
import { getPublicProfiles } from "@/services/publicProfile.service";

import {
  Transaction,
  TransactionStatus,
} from "@/types/transaction";
import { Profile } from "@/types/profile";

import { useMessages } from "@/i18n/useMessages";
import { TransactionListFilter } from "@/components/transactions/TransactionListFilters";

type TransactionProductSummary = {
  id: string;
  title: string | null;
  image_url: string | null;
};

type ProfileSummary = Profile & {
  full_name?: string | null;
  username?: string | null;
  name?: string | null;
};

type TransactionListItem = Transaction & {
  currentUserHasReviewed: boolean;
};

type ReviewSummary = {
  transaction_id?: string | null;
};

export function useTransactionList() {
  const messages = useMessages();

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState("");

  const [
    transactions,
    setTransactions,
  ] = useState<TransactionListItem[]>([]);

  const [
    productsById,
    setProductsById,
  ] = useState<
    Record<string, TransactionProductSummary>
  >({});

  const [
    profilesById,
    setProfilesById,
  ] = useState<Record<string, ProfileSummary>>(
    {}
  );

  const [filter, setFilter] =
    useState<TransactionListFilter>("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadTransactions() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setCurrentUserId("");
      setTransactions([]);
      setProductsById({});
      setProfilesById({});
      setError(
        messages.transactionDetails.authRequired
      );
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const {
      data,
      error: transactionsError,
    } = await getMyTransactions(user.id);

    if (transactionsError) {
      setTransactions([]);
      setProductsById({});
      setProfilesById({});
      setError(transactionsError.message);
      setLoading(false);
      return;
    }

    const loadedTransactions =
      (data ?? []) as Transaction[];

    if (loadedTransactions.length === 0) {
      setTransactions([]);
      setProductsById({});
      setProfilesById({});
      setLoading(false);
      return;
    }

    const productIds = Array.from(
      new Set(
        loadedTransactions.map(
          (transaction) =>
            transaction.product_id
        )
      )
    );

    const userIds = Array.from(
      new Set(
        loadedTransactions.flatMap(
          (transaction) => [
            transaction.seller_id,
            transaction.buyer_id,
          ]
        )
      )
    );

    const transactionIds =
      loadedTransactions.map(
        (transaction) => transaction.id
      );

    const [
      productsResult,
      profilesResult,
      reviewsResult,
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id, title, image_url")
        .in("id", productIds),

      getPublicProfiles(userIds),

      supabase
        .from("reviews")
        .select("transaction_id, reviewer_id")
        .eq("reviewer_id", user.id)
        .in("transaction_id", transactionIds),
    ]);

    if (productsResult.error) {
      console.error(
        messages.productPage
          .productLoadConsoleError,
        productsResult.error.message
      );
    }

    if (profilesResult.error) {
      console.error(
        profilesResult.error.message
      );
    }

    if (reviewsResult.error) {
      console.error(
        reviewsResult.error.message
      );
    }

    const reviewedTransactionIds =
      new Set(
        (reviewsResult.data ?? [])
          .map(
            (review) =>
              (review as ReviewSummary)
                .transaction_id ?? null
          )
          .filter(
            (
              transactionId
            ): transactionId is string =>
              Boolean(transactionId)
          )
      );

    const completedTransactions =
      loadedTransactions.map(
        (transaction) => ({
          ...transaction,
          currentUserHasReviewed:
            reviewedTransactionIds.has(
              transaction.id
            ),
        })
      );

    const productsMap = (
      productsResult.data ?? []
    ).reduce<
      Record<
        string,
        TransactionProductSummary
      >
    >((accumulator, product) => {
      const typedProduct =
        product as TransactionProductSummary;

      accumulator[typedProduct.id] =
        typedProduct;

      return accumulator;
    }, {});

    const profilesMap = (
      profilesResult.data ?? []
    ).reduce<Record<string, ProfileSummary>>(
      (accumulator, profile) => {
        const typedProfile =
          profile as ProfileSummary;

        accumulator[typedProfile.id] =
          typedProfile;

        return accumulator;
      },
      {}
    );

    setTransactions(completedTransactions);
    setProductsById(productsMap);
    setProfilesById(profilesMap);
    setLoading(false);
  }

  useEffect(() => {
    void loadTransactions();
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    function handleTransactionUpdate(payload: {
      new: Record<string, unknown>;
    }) {
      const updatedTransaction =
        payload.new as Transaction;

      setTransactions(
        (currentTransactions) =>
          currentTransactions.map(
            (transaction) =>
              transaction.id ===
              updatedTransaction.id
                ? {
                    ...transaction,
                    ...updatedTransaction,
                  }
                : transaction
          )
      );
    }

    const channel = supabase
      .channel(
        `transactions-list-${currentUserId}`
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `seller_id=eq.${currentUserId}`,
        },
        handleTransactionUpdate
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `buyer_id=eq.${currentUserId}`,
        },
        handleTransactionUpdate
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const filteredTransactions = useMemo(() => {
    if (filter === "all") {
      return transactions;
    }

    return transactions.filter(
      (transaction) =>
        transaction.status === filter
    );
  }, [transactions, filter]);

  const statusCounts = useMemo(() => {
    return transactions.reduce<
      Record<TransactionStatus, number>
    >(
      (accumulator, transaction) => {
        accumulator[transaction.status] += 1;
        return accumulator;
      },
      {
        pending_confirmation: 0,
        completed: 0,
        cancelled: 0,
        disputed: 0,
      }
    );
  }, [transactions]);

  const needsActionCount = useMemo(() => {
    return transactions.filter(
      (transaction) => {
        if (!currentUserId) {
          return false;
        }

        if (
          transaction.status !==
          "pending_confirmation"
        ) {
          return false;
        }

        const isSeller =
          currentUserId === transaction.seller_id;

        const currentUserConfirmed = isSeller
          ? transaction.seller_confirmed
          : transaction.buyer_confirmed;

        return !currentUserConfirmed;
      }
    ).length;
  }, [transactions, currentUserId]);

  const filterOptions = [
    {
      value: "all",
      label:
        messages.transaction.list.filterAll,
      count: transactions.length,
    },
    {
      value: "pending_confirmation",
      label:
        messages.transaction.status
          .pending_confirmation,
      count:
        statusCounts.pending_confirmation,
    },
    {
      value: "completed",
      label:
        messages.transaction.status.completed,
      count: statusCounts.completed,
    },
    {
      value: "cancelled",
      label:
        messages.transaction.status.cancelled,
      count: statusCounts.cancelled,
    },
    {
      value: "disputed",
      label:
        messages.transaction.status.disputed,
      count: statusCounts.disputed,
    },
  ] as const;

  function getOtherPartyId(
    transaction: Transaction
  ) {
    return currentUserId ===
      transaction.seller_id
      ? transaction.buyer_id
      : transaction.seller_id;
  }

  function getOtherPartyName(
    transaction: Transaction
  ) {
    const otherUserId =
      getOtherPartyId(transaction);

    const profile =
      profilesById[otherUserId];

    return (
      profile?.full_name ||
      profile?.username ||
      profile?.name ||
      messages.transaction.list.unknownUser
    );
  }

  return {
    currentUserId,
    transactions,
    filteredTransactions,
    productsById,
    filter,
    setFilter,
    loading,
    error,
    loadTransactions,
    statusCounts,
    needsActionCount,
    filterOptions,
    getOtherPartyId,
    getOtherPartyName,
  };
}