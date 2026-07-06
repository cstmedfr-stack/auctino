"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Transaction } from "@/types/transaction";
import {  getPublicProfiles,} from "@/services/publicProfile.service";


type ProductSummary = {
  id: string;
  title: string;
  image_url: string | null;
  status: string | null;
};

type ProfileSummary = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  rating: number | null;
};

type TransactionWithDetails = Transaction & {
  product: ProductSummary | null;
  seller: ProfileSummary | null;
  buyer: ProfileSummary | null;
  currentUserHasReviewed: boolean;
};

type FilterType = "all" | "pending" | "completed";

function formatPrice(price: number | string) {
  return `${Number(price).toFixed(0)} lei`;
}

function formatDate(date: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatusLabel(status: Transaction["status"]) {
  switch (status) {
    case "pending_confirmation":
      return "În așteptarea confirmării";
    case "completed":
      return "Finalizată";
    case "cancelled":
      return "Anulată";
    case "disputed":
      return "În dispută";
    default:
      return status;
  }
}

function getStatusClasses(status: Transaction["status"]) {
  switch (status) {
    case "pending_confirmation":
      return "bg-amber-50 text-amber-700";
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "bg-slate-100 text-slate-600";
    case "disputed":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function TransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<
    TransactionWithDetails[]
  >([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  void loadTransactions();
}, []);

useEffect(() => {
  if (!currentUserId) {
    return;
  }

  const handleTransactionUpdate = (payload: any) => {
    const updatedTransaction =
      payload.new as Transaction;

    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        transaction.id === updatedTransaction.id
          ? {
              ...transaction,
              ...updatedTransaction,
            }
          : transaction
      )
    );
  };

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

  async function loadTransactions() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Trebuie să fii autentificat pentru a vedea tranzacțiile.");
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const { data: transactionData, error: transactionError } =
      await supabase
        .from("transactions")
        .select("*")
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

    if (transactionError) {
      setError(transactionError.message);
      setLoading(false);
      return;
    }

    const transactionRows =
      (transactionData as Transaction[] | null) ?? [];

    if (transactionRows.length === 0) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const productIds = [
      ...new Set(transactionRows.map((item) => item.product_id)),
    ];

    const profileIds = [
      ...new Set(
        transactionRows.flatMap((item) => [
          item.seller_id,
          item.buyer_id,
        ])
      ),
    ];

    const transactionIds = transactionRows.map((item) => item.id);

    const [
      { data: productsData, error: productsError },
      { data: profilesData, error: profilesError },
      { data: reviewsData, error: reviewsError },
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id, title, image_url, status")
        .in("id", productIds),

      getPublicProfiles(profileIds),

      supabase
        .from("reviews")
        .select("transaction_id, reviewer_id")
        .eq("reviewer_id", user.id)
        .in("transaction_id", transactionIds),
    ]);

    if (productsError) {
      console.error("Eroare produse tranzacții:", productsError);
    }

    if (profilesError) {
      console.error("Eroare profiluri tranzacții:", profilesError);
    }

    if (reviewsError) {
      console.error("Eroare review-uri tranzacții:", reviewsError);
    }

    const products =
      (productsData as ProductSummary[] | null) ?? [];

    const profiles =
      (profilesData as ProfileSummary[] | null) ?? [];

    const reviewedTransactionIds = new Set(
      (reviewsData ?? [])
        .map((review) => review.transaction_id)
        .filter(Boolean)
    );

    const productsById = new Map(
      products.map((product) => [product.id, product])
    );

    const profilesById = new Map(
      profiles.map((profile) => [profile.id, profile])
    );

    const completeTransactions = transactionRows.map((transaction) => ({
      ...transaction,
      product: productsById.get(transaction.product_id) ?? null,
      seller: profilesById.get(transaction.seller_id) ?? null,
      buyer: profilesById.get(transaction.buyer_id) ?? null,
      currentUserHasReviewed: reviewedTransactionIds.has(
        transaction.id
      ),
    }));

    setTransactions(completeTransactions);
    setLoading(false);
  }

  const filteredTransactions = useMemo(() => {
    if (filter === "pending") {
      return transactions.filter(
        (transaction) =>
          transaction.status === "pending_confirmation"
      );
    }

    if (filter === "completed") {
      return transactions.filter(
        (transaction) => transaction.status === "completed"
      );
    }

    return transactions;
  }, [transactions, filter]);

  const pendingCount = transactions.filter(
    (transaction) =>
      transaction.status === "pending_confirmation"
  ).length;

  const completedCount = transactions.filter(
    (transaction) => transaction.status === "completed"
  ).length;

  function getActionLabel(transaction: TransactionWithDetails) {
    const isSeller = transaction.seller_id === currentUserId;

    const currentUserConfirmed = isSeller
      ? transaction.seller_confirmed
      : transaction.buyer_confirmed;

    if (transaction.status === "pending_confirmation") {
      return currentUserConfirmed
        ? "Vezi tranzacția"
        : "Confirmă tranzacția";
    }

    if (
      transaction.status === "completed" &&
      !transaction.currentUserHasReviewed
    ) {
      return "Lasă un review";
    }

    return "Vezi detalii";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-600">
            Se încarcă tranzacțiile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          ← Înapoi la dashboard
        </button>

        <section className="rounded-3xl bg-slate-950 p-8 text-white shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-orange-400">
            Contul meu
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Tranzacțiile mele
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Urmărește licitațiile câștigate sau vândute, confirmă
            tranzacțiile și lasă review-uri.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-slate-300">
                Toate tranzacțiile
              </p>
              <p className="mt-1 text-3xl font-black">
                {transactions.length}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-slate-300">
                În așteptare
              </p>
              <p className="mt-1 text-3xl font-black">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-slate-300">
                Finalizate
              </p>
              <p className="mt-1 text-3xl font-black">
                {completedCount}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-5 py-2 text-sm font-bold ${
              filter === "all"
                ? "bg-black text-white"
                : "bg-white text-slate-600 shadow-sm"
            }`}
          >
            Toate
          </button>

          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`rounded-full px-5 py-2 text-sm font-bold ${
              filter === "pending"
                ? "bg-black text-white"
                : "bg-white text-slate-600 shadow-sm"
            }`}
          >
            În așteptare
          </button>

          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`rounded-full px-5 py-2 text-sm font-bold ${
              filter === "completed"
                ? "bg-black text-white"
                : "bg-white text-slate-600 shadow-sm"
            }`}
          >
            Finalizate
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!error && filteredTransactions.length === 0 ? (
          <section className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-bold text-slate-900">
              Nu există tranzacții în această categorie.
            </p>

            <p className="mt-2 text-slate-500">
              Tranzacțiile vor apărea după finalizarea licitațiilor.
            </p>

            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-2xl bg-black px-6 py-3 font-bold text-white"
            >
              Vezi licitațiile
            </Link>
          </section>
        ) : (
          <section className="mt-8 space-y-5">
            {filteredTransactions.map((transaction) => {
              const isSeller =
                transaction.seller_id === currentUserId;

              const otherUser = isSeller
                ? transaction.buyer
                : transaction.seller;

              const currentUserConfirmed = isSeller
                ? transaction.seller_confirmed
                : transaction.buyer_confirmed;

              return (
                <article
                  key={transaction.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm"
                >
                  <div className="grid md:grid-cols-[190px_1fr]">
                    <div className="min-h-48 bg-slate-100">
                      {transaction.product?.image_url ? (
                        <img
                          src={transaction.product.image_url}
                          alt={
                            transaction.product.title ||
                            "Produs tranzacție"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full min-h-48 items-center justify-center text-5xl">
                          📦
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                                transaction.status
                              )}`}
                            >
                              {getStatusLabel(transaction.status)}
                            </span>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                              {isSeller ? "Ai vândut" : "Ai cumpărat"}
                            </span>

                            {transaction.currentUserHasReviewed && (
                              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                                Review trimis
                              </span>
                            )}
                          </div>

                          <h2 className="mt-3 text-2xl font-black text-slate-950">
                            {transaction.product?.title ||
                              "Produs indisponibil"}
                          </h2>

                          <p className="mt-2 text-sm text-slate-500">
                            {isSeller ? "Cumpărător" : "Vânzător"}:{" "}
                            <span className="font-semibold text-slate-700">
                              {otherUser?.full_name ||
                                "Utilizator Vendora"}
                            </span>
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-sm text-slate-500">
                            Preț final
                          </p>

                          <p className="text-3xl font-black text-slate-950">
                            {formatPrice(transaction.final_price)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase text-slate-500">
                            Confirmarea ta
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {currentUserConfirmed
                              ? "✅ Confirmată"
                              : "⏳ Neconfirmată"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase text-slate-500">
                            Cealaltă parte
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {(isSeller
                              ? transaction.buyer_confirmed
                              : transaction.seller_confirmed)
                              ? "✅ Confirmată"
                              : "⏳ Neconfirmată"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href={`/transactions/${transaction.product_id}`}
                          className="rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                        >
                          {getActionLabel(transaction)}
                        </Link>

                        {otherUser && (
                          <Link
                            href={`/users/${otherUser.id}`}
                            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                          >
                            Vezi profilul
                          </Link>
                        )}
                      </div>
                    </div>
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