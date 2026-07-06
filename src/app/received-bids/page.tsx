"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/formatPrice";
import { supabase } from "@/lib/supabase";
import { finalizeAuctionAndCreateTransaction } from "@/lib/transactions";

import { getMyReceivedBidProducts } from "@/services/received-bids.service";
import { ReceivedBidProduct } from "@/types/received-bid";

import AuctionTimer from "@/components/auction/AuctionTimer";

type ReceivedBidFilter =
  | "all"
  | "active"
  | "ended"
  | "transaction"
  | "sold";


function getProductStatus(
  product: ReceivedBidProduct
) {
  const status = product.status ?? "active";

  if (status === "removed") {
    return {
      label: "ELIMINAT",
      className:
        "bg-red-100 text-red-800",
      description:
        "Produsul a fost eliminat de administrator.",
    };
  }

  if (status === "sold") {
    return {
      label: "VÂNDUT",
      className:
        "bg-emerald-100 text-emerald-800",
      description:
        "Tranzacția a fost finalizată.",
    };
  }

  if (
    status === "transaction_pending"
  ) {
    return {
      label: "TRANZACȚIE ÎN CURS",
      className:
        "bg-blue-100 text-blue-800",
      description:
        "Licitația a fost finalizată, iar tranzacția este în curs.",
    };
  }

  if (product.can_finalize) {
    return {
      label: "DE FINALIZAT",
      className:
        "bg-orange-100 text-orange-800",
      description:
        "Licitația s-a încheiat și trebuie să desemnezi câștigătorul.",
    };
  }

  if (product.is_active) {
    return {
      label: "LICITAȚIE ACTIVĂ",
      className:
        "bg-green-100 text-green-800",
      description:
        "Produsul continuă să primească oferte.",
    };
  }

  if (
    status === "expired"
  ) {
    return {
      label: "EXPIRATĂ",
      className:
        "bg-slate-100 text-slate-700",
      description:
        "Licitația a expirat.",
    };
  }

  return {
    label: "ÎNCHEIATĂ",
    className:
      "bg-slate-100 text-slate-700",
    description:
      "Licitația nu mai este activă.",
  };
}

export default function ReceivedBidsPage() {
  const router = useRouter();

  const [products, setProducts] =
    useState<ReceivedBidProduct[]>([]);

  const [filter, setFilter] =
    useState<ReceivedBidFilter>("all");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [finalizingProductId, setFinalizingProductId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  async function loadProducts(
    isRefresh = false
  ) {
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
      router.replace("/login");
      return;
    }

    const {
      data,
      error: receivedBidsError,
    } = await getMyReceivedBidProducts();

    if (receivedBidsError) {
      setProducts([]);

      setError(
        receivedBidsError.message ||
          "Ofertele primite nu au putut fi încărcate."
      );
    } else {
      setProducts(data);
    }

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const statistics = useMemo(() => {
    return {
      total: products.length,

      active: products.filter(
        (product) => product.is_active
      ).length,

      finalize: products.filter(
        (product) => product.can_finalize
      ).length,

      transaction: products.filter(
        (product) =>
          product.status ===
            "transaction_pending" ||
          product.transaction_status ===
            "pending_confirmation"
      ).length,

      sold: products.filter(
        (product) =>
          product.status === "sold" ||
          product.transaction_status ===
            "completed"
      ).length,
    };
  }, [products]);

  const filteredProducts =
    useMemo(() => {
      switch (filter) {
        case "active":
          return products.filter(
            (product) => product.is_active
          );

        case "ended":
          return products.filter(
            (product) =>
              product.can_finalize ||
              product.status === "ended" ||
              product.status === "expired"
          );

        case "transaction":
          return products.filter(
            (product) =>
              product.status ===
                "transaction_pending" ||
              product.transaction_status ===
                "pending_confirmation"
          );

        case "sold":
          return products.filter(
            (product) =>
              product.status === "sold" ||
              product.transaction_status ===
                "completed"
          );

        default:
          return products;
      }
    }, [filter, products]);

  async function handleFinalizeAuction(
    productId: string
  ) {
    const confirmed = window.confirm(
      "Vrei să finalizezi licitația și să creezi tranzacția cu ofertantul câștigător?"
    );

    if (!confirmed) {
      return;
    }

    setFinalizingProductId(productId);
    setActionError("");

    const { data, error } =
      await finalizeAuctionAndCreateTransaction(
        productId
      );

    if (error) {
      setActionError(error.message);
      setFinalizingProductId(null);
      return;
    }

    if (!data) {
      setActionError(
        "Licitația nu a putut fi finalizată. Verifică dacă mai există oferte valide."
      );

      setFinalizingProductId(null);
      await loadProducts(true);
      return;
    }

    setFinalizingProductId(null);

    router.push(
      `/transactions/${productId}`
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-black" />

            <p className="font-semibold text-slate-600">
              Se încarcă ofertele primite...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
              Activitatea produselor tale
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
              Oferte primite
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              Vezi produsele care au primit
              oferte și finalizează licitațiile
              încheiate.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadProducts(true)
            }
            disabled={refreshing}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            {refreshing
              ? "Se actualizează..."
              : "↻ Actualizează"}
          </button>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-3xl border p-5 text-left transition ${
              filter === "all"
                ? "border-black bg-black text-white"
                : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"
            }`}
          >
            <p className="text-sm font-semibold opacity-70">
              Toate
            </p>

            <p className="mt-2 text-3xl font-black">
              {statistics.total}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("active")
            }
            className={`rounded-3xl border p-5 text-left transition ${
              filter === "active"
                ? "border-green-700 bg-green-700 text-white"
                : "border-green-100 bg-green-50 text-green-900"
            }`}
          >
            <p className="text-sm font-semibold opacity-80">
              Active
            </p>

            <p className="mt-2 text-3xl font-black">
              {statistics.active}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("ended")
            }
            className={`rounded-3xl border p-5 text-left transition ${
              filter === "ended"
                ? "border-orange-700 bg-orange-700 text-white"
                : "border-orange-100 bg-orange-50 text-orange-900"
            }`}
          >
            <p className="text-sm font-semibold opacity-80">
              De finalizat
            </p>

            <p className="mt-2 text-3xl font-black">
              {statistics.finalize}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("transaction")
            }
            className={`rounded-3xl border p-5 text-left transition ${
              filter === "transaction"
                ? "border-blue-700 bg-blue-700 text-white"
                : "border-blue-100 bg-blue-50 text-blue-900"
            }`}
          >
            <p className="text-sm font-semibold opacity-80">
              În tranzacție
            </p>

            <p className="mt-2 text-3xl font-black">
              {statistics.transaction}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("sold")
            }
            className={`rounded-3xl border p-5 text-left transition ${
              filter === "sold"
                ? "border-emerald-700 bg-emerald-700 text-white"
                : "border-emerald-100 bg-emerald-50 text-emerald-900"
            }`}
          >
            <p className="text-sm font-semibold opacity-80">
              Vândute
            </p>

            <p className="mt-2 text-3xl font-black">
              {statistics.sold}
            </p>
          </button>
        </section>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "Toate"],
              ["active", "Active"],
              ["ended", "Încheiate"],
              ["transaction", "În tranzacție"],
              ["sold", "Vândute"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setFilter(
                    value as ReceivedBidFilter
                  )
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  filter === value
                    ? "bg-black text-white"
                    : "bg-white text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-sm text-slate-500">
            {filteredProducts.length} rezultate
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {actionError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {actionError}
          </div>
        )}

        {products.length === 0 ? (
          <section className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">
              📥
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              Nu ai primit încă nicio ofertă
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Produsele care primesc licitații
              vor apărea automat aici.
            </p>

            <Link
              href="/my-products"
              className="mt-7 inline-block rounded-xl bg-black px-6 py-3 font-bold text-white hover:bg-slate-800"
            >
              Vezi produsele mele
            </Link>
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Nu există produse în această categorie
            </h2>

            <button
              type="button"
              onClick={() =>
                setFilter("all")
              }
              className="mt-5 rounded-xl bg-black px-5 py-3 font-semibold text-white"
            >
              Arată toate produsele
            </button>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map(
              (product) => {
                const productStatus =
                  getProductStatus(product);

                const isRemoved =
                  product.status === "removed";

                const canViewTransaction =
                  product.status ===
                    "transaction_pending" ||
                  product.status === "sold" ||
                  Boolean(
                    product.transaction_id
                  );

                return (
                  <article
                    key={product.product_id}
                    className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${
                      isRemoved
                        ? "border-red-200 opacity-90"
                        : "border-slate-100"
                    }`}
                  >
                    <div className="relative h-52 bg-slate-100">
                      {product.image_url ? (
                        <img
                          src={
                            product.image_url
                          }
                          alt={product.title}
                          className={`h-full w-full object-cover ${
                            isRemoved
                              ? "grayscale"
                              : ""
                          }`}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          Fără imagine
                        </div>
                      )}

                      {isRemoved && (
                        <div className="absolute inset-0 bg-black/25" />
                      )}

                      <span
                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black shadow-sm ${productStatus.className}`}
                      >
                        {productStatus.label}
                      </span>
                    </div>

                    <div className="p-6">
                      <p className="mb-2 text-xs font-medium text-slate-500">
                        📍{" "}
                        {product.location ||
                          "Locație nespecificată"}
                      </p>

                      <h2 className="line-clamp-1 text-xl font-black text-slate-900">
                        {product.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
                        {product.description ||
                          "Fără descriere."}
                      </p>

                      <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Cea mai mare ofertă
                        </p>

                        <p className="mt-2 text-3xl font-black">
                          {formatPrice(
                            product.highest_bid
                          )}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                          Preț de pornire:{" "}
                          {formatPrice(
                            product.starting_price
                          )}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-orange-50 p-4">
                          <p className="text-xs font-semibold text-orange-700">
                            Total oferte
                          </p>

                          <p className="mt-1 text-2xl font-black text-orange-900">
                            {product.total_bids}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-blue-50 p-4">
                          <p className="text-xs font-semibold text-blue-700">
                            Ofertanți
                          </p>

                          <p className="mt-1 text-2xl font-black text-blue-900">
                            {product.unique_bidders}
                          </p>
                        </div>
                      </div>

                      {product.is_active &&
                        product.auction_end && (
                          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                            <p className="mb-2 text-xs font-semibold text-slate-600">
                              Timp rămas
                            </p>

                            <AuctionTimer
                              auctionEnd={
                                product.auction_end
                              }
                            />
                          </div>
                        )}

                      <div
                        className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${productStatus.className}`}
                      >
                        {productStatus.description}
                      </div>

                      <p className="mt-4 text-xs text-slate-500">
                        Ultima ofertă:{" "}
                        {new Date(
                          product.last_bid_at
                        ).toLocaleString(
                          "ro-RO",
                          {
                            timeZone:
                              "Europe/Bucharest",
                          }
                        )}
                      </p>

                      <div className="mt-5 space-y-2">
                        {product.can_finalize && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleFinalizeAuction(
                                product.product_id
                              )
                            }
                            disabled={
                              finalizingProductId !==
                              null
                            }
                            className="w-full rounded-xl bg-orange-700 px-4 py-3 text-center font-bold text-white hover:bg-orange-800 disabled:opacity-60"
                          >
                            {finalizingProductId ===
                            product.product_id
                              ? "Se finalizează..."
                              : "Finalizează licitația"}
                          </button>
                        )}

                        {canViewTransaction && (
                          <Link
                            href={`/transactions/${product.product_id}`}
                            className="block w-full rounded-xl bg-emerald-700 px-4 py-3 text-center font-bold text-white hover:bg-emerald-800"
                          >
                            Vezi tranzacția →
                          </Link>
                        )}

                        <Link
                          href={`/products/${product.product_id}`}
                          className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Vezi produsul →
                        </Link>
                      </div>
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