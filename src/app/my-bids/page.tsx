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
import { getMyBidProducts } from "@/services/my-bids.service";
import { MyBidProduct } from "@/types/my-bid";
import AuctionTimer from "@/components/auction/AuctionTimer";

type BidFilter =
  | "all"
  | "active"
  | "leading"
  | "outbid"
  | "won"
  | "closed";



function isAuctionActive(
  product: MyBidProduct
) {
  const status = product.status ?? "active";

  const endedByDate = product.auction_end
    ? new Date(
        product.auction_end
      ).getTime() <= Date.now()
    : false;

  return (
    status === "active" &&
    !endedByDate
  );
}

function getBidStatus(
  product: MyBidProduct
) {
  const status = product.status ?? "active";
  const active = isAuctionActive(product);

  if (status === "removed") {
    return {
      label: "PRODUS ELIMINAT",
      className:
        "bg-red-100 text-red-800",
      description:
        "Produsul a fost eliminat de pe platformă.",
    };
  }

  if (
    product.is_winner &&
    status === "sold"
  ) {
    return {
      label: "CÂȘTIGAT ȘI FINALIZAT",
      className:
        "bg-emerald-100 text-emerald-800",
      description:
        "Ai câștigat licitația, iar tranzacția a fost finalizată.",
    };
  }

  if (
    product.is_winner &&
    status === "transaction_pending"
  ) {
    return {
      label: "AI CÂȘTIGAT",
      className:
        "bg-green-100 text-green-800",
      description:
        "Tranzacția cu vânzătorul este în curs.",
    };
  }

  if (
    product.is_winner &&
    !active
  ) {
    return {
      label: "AI CÂȘTIGAT",
      className:
        "bg-green-100 text-green-800",
      description:
        "Ai avut cea mai mare ofertă la încheierea licitației.",
    };
  }

  if (
    active &&
    product.is_leading
  ) {
    return {
      label: "EȘTI ÎN FRUNTE",
      className:
        "bg-blue-100 text-blue-800",
      description:
        "Oferta ta este momentan cea mai mare.",
    };
  }

  if (
    active &&
    !product.is_leading
  ) {
    return {
      label: "AI FOST DEPĂȘIT",
      className:
        "bg-orange-100 text-orange-800",
      description:
        "Un alt utilizator are momentan o ofertă mai mare.",
    };
  }

  if (status === "expired") {
    return {
      label: "LICITAȚIE EXPIRATĂ",
      className:
        "bg-slate-100 text-slate-700",
      description:
        "Licitația s-a încheiat.",
    };
  }

  return {
    label: "LICITAȚIE ÎNCHEIATĂ",
    className:
      "bg-slate-100 text-slate-700",
    description:
      "Licitația nu mai este activă.",
  };
}

export default function MyBidsPage() {
  const router = useRouter();

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
      error: bidsError,
    } = await getMyBidProducts();

    if (bidsError) {
      setError(
        bidsError.message ||
          "Ofertele tale nu au putut fi încărcate."
      );

      setProducts([]);
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
    const active = products.filter(
      isAuctionActive
    );

    const leading = active.filter(
      (product) => product.is_leading
    );

    const outbid = active.filter(
      (product) => !product.is_leading
    );

    const won = products.filter(
      (product) =>
        product.is_winner &&
        !isAuctionActive(product) &&
        product.status !== "removed"
    );

    return {
      total: products.length,
      active: active.length,
      leading: leading.length,
      outbid: outbid.length,
      won: won.length,
    };
  }, [products]);

  const filteredProducts =
    useMemo(() => {
      switch (filter) {
        case "active":
          return products.filter(
            isAuctionActive
          );

        case "leading":
          return products.filter(
            (product) =>
              isAuctionActive(product) &&
              product.is_leading
          );

        case "outbid":
          return products.filter(
            (product) =>
              isAuctionActive(product) &&
              !product.is_leading
          );

        case "won":
          return products.filter(
            (product) =>
              product.is_winner &&
              !isAuctionActive(product) &&
              product.status !== "removed"
          );

        case "closed":
          return products.filter(
            (product) =>
              !isAuctionActive(product)
          );

        default:
          return products;
      }
    }, [filter, products]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-black" />

            <p className="font-semibold text-slate-600">
              Se încarcă ofertele tale...
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
              Activitatea ta
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
              Ofertele mele
            </h1>

            <p className="mt-2 text-slate-600">
              Urmărește licitațiile la care ai
              participat și vezi dacă oferta ta
              este încă în frunte.
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
              Toate ofertele
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
                ? "border-blue-700 bg-blue-700 text-white"
                : "border-blue-100 bg-blue-50 text-blue-900 hover:border-blue-300"
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
              setFilter("leading")
            }
            className={`rounded-3xl border p-5 text-left transition ${
              filter === "leading"
                ? "border-green-700 bg-green-700 text-white"
                : "border-green-100 bg-green-50 text-green-900 hover:border-green-300"
            }`}
          >
            <p className="text-sm font-semibold opacity-80">
              În frunte
            </p>

            <p className="mt-2 text-3xl font-black">
              {statistics.leading}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("outbid")
            }
            className={`rounded-3xl border p-5 text-left transition ${
              filter === "outbid"
                ? "border-orange-700 bg-orange-700 text-white"
                : "border-orange-100 bg-orange-50 text-orange-900 hover:border-orange-300"
            }`}
          >
            <p className="text-sm font-semibold opacity-80">
              Depășite
            </p>

            <p className="mt-2 text-3xl font-black">
              {statistics.outbid}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("won")
            }
            className={`rounded-3xl border p-5 text-left transition ${
              filter === "won"
                ? "border-emerald-700 bg-emerald-700 text-white"
                : "border-emerald-100 bg-emerald-50 text-emerald-900 hover:border-emerald-300"
            }`}
          >
            <p className="text-sm font-semibold opacity-80">
              Câștigate
            </p>

            <p className="mt-2 text-3xl font-black">
              {statistics.won}
            </p>
          </button>
        </section>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setFilter("all")
              }
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                filter === "all"
                  ? "bg-black text-white"
                  : "bg-white text-slate-600"
              }`}
            >
              Toate
            </button>

            <button
              type="button"
              onClick={() =>
                setFilter("active")
              }
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                filter === "active"
                  ? "bg-black text-white"
                  : "bg-white text-slate-600"
              }`}
            >
              Active
            </button>

            <button
              type="button"
              onClick={() =>
                setFilter("leading")
              }
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                filter === "leading"
                  ? "bg-black text-white"
                  : "bg-white text-slate-600"
              }`}
            >
              În frunte
            </button>

            <button
              type="button"
              onClick={() =>
                setFilter("outbid")
              }
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                filter === "outbid"
                  ? "bg-black text-white"
                  : "bg-white text-slate-600"
              }`}
            >
              Depășite
            </button>

            <button
              type="button"
              onClick={() =>
                setFilter("won")
              }
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                filter === "won"
                  ? "bg-black text-white"
                  : "bg-white text-slate-600"
              }`}
            >
              Câștigate
            </button>

            <button
              type="button"
              onClick={() =>
                setFilter("closed")
              }
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                filter === "closed"
                  ? "bg-black text-white"
                  : "bg-white text-slate-600"
              }`}
            >
              Încheiate
            </button>
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

        {products.length === 0 ? (
          <section className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">
              💰
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              Nu ai plasat nicio ofertă
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Descoperă produsele disponibile și
              participă la prima ta licitație.
            </p>

            <Link
              href="/dashboard"
              className="mt-7 inline-block rounded-xl bg-black px-6 py-3 font-bold text-white hover:bg-slate-800"
            >
              Vezi toate licitațiile
            </Link>
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Nu există oferte în această categorie
            </h2>

            <button
              type="button"
              onClick={() =>
                setFilter("all")
              }
              className="mt-5 rounded-xl bg-black px-5 py-3 font-semibold text-white"
            >
              Arată toate ofertele
            </button>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map(
              (product) => {
                const bidStatus =
                  getBidStatus(product);

                const active =
                  isAuctionActive(product);

                const isRemoved =
                  product.status ===
                  "removed";

                const canViewTransaction =
                  product.is_winner &&
                  (product.status ===
                    "transaction_pending" ||
                    product.status ===
                      "sold");

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
                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black shadow-sm ${bidStatus.className}`}
                      >
                        {bidStatus.label}
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

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-blue-50 p-4">
                          <p className="text-xs font-semibold text-blue-600">
                            Oferta ta
                          </p>

                          <p className="mt-1 text-lg font-black text-blue-900">
                            {formatPrice(
                              product.my_highest_bid
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-orange-50 p-4">
                          <p className="text-xs font-semibold text-orange-600">
                            Oferta maximă
                          </p>

                          <p className="mt-1 text-lg font-black text-orange-900">
                            {formatPrice(
                              product.highest_bid
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-700">
                            🔥{" "}
                            {product.bid_count ??
                              0}{" "}
                            oferte
                          </span>

                          <span className="text-sm font-semibold text-slate-700">
                            Preț actual:{" "}
                            {formatPrice(
                              product.current_price ??
                                product.starting_price
                            )}
                          </span>
                        </div>

                        {active &&
                          product.auction_end && (
                            <div className="mt-3">
                              <AuctionTimer
                                auctionEnd={
                                  product.auction_end
                                }
                              />
                            </div>
                          )}
                      </div>

                      <div
                        className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${bidStatus.className}`}
                      >
                        {bidStatus.description}
                      </div>

                      <p className="mt-4 text-xs text-slate-500">
                        Ultima ta ofertă:{" "}
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
                        {canViewTransaction && (
                          <Link
                            href={`/transactions/${product.product_id}`}
                            className="block w-full rounded-xl bg-emerald-700 px-4 py-3 text-center font-bold text-white hover:bg-emerald-800"
                          >
                            Vezi tranzacția →
                          </Link>
                        )}

                        {!isRemoved ? (
                          <Link
                            href={`/products/${product.product_id}`}
                            className="block w-full rounded-xl bg-black px-4 py-3 text-center font-bold text-white hover:bg-slate-800"
                          >
                            {active &&
                            !product.is_leading
                              ? "Mărește oferta →"
                              : "Vezi produsul →"}
                          </Link>
                        ) : (
                          <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700">
                            Produs indisponibil
                          </div>
                        )}
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