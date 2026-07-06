"use client";

import Link from "next/link";
import { Product } from "@/types/product";
import FavoriteButton from "./FavoriteButton";
import AuctionTimer from "../auction/AuctionTimer";
import ProductPrice from "./ProductPrice";
import RelistProductPanel from "./RelistProductPanel";
import {  useCallback,  useEffect,  useState,} from "react";

type ProductCardProps = {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
  showFavorite?: boolean;
  mode?: "marketplace" | "owner";
  onRelistProduct?: (
  productId: string,
  durationDays: number
) => Promise<void> | void;


relisting?: boolean;
};

function getStatusBadge(status: string) {
  switch (status) {
    case "removed":
      return {
        label: "ELIMINAT",
        className: "bg-red-600 text-white",
      };

    case "sold":
      return {
        label: "VÂNDUT",
        className: "bg-green-600 text-white",
      };

    case "transaction_pending":
      return {
        label: "TRANZACȚIE ÎN CURS",
        className: "bg-blue-600 text-white",
      };

    case "expired":
      return {
        label: "EXPIRAT",
        className: "bg-slate-700 text-white",
      };

    case "ended":
      return {
        label: "ÎNCHEIATĂ",
        className: "bg-slate-700 text-white",
      };

    default:
      return {
        label: "LIVE",
        className: "bg-red-500 text-white",
      };
  }
}

export default function ProductCard({
  product,
  isFavorite = false,
  onToggleFavorite,
  onDeleteProduct,
  onRelistProduct,
  relisting = false,
  showFavorite = true,
  mode = "marketplace",
}: ProductCardProps) {

  const [
  auctionHasEnded,
  setAuctionHasEnded,
] = useState(false);

useEffect(() => {
  const ended =
    product.auction_end
      ? new Date(
          product.auction_end
        ).getTime() <= Date.now()
      : false;

  setAuctionHasEnded(ended);
}, [product.auction_end]);

const handleAuctionEnd =
  useCallback(() => {
    setAuctionHasEnded(true);
  }, []);

useEffect(() => {
  const ended =
    product.auction_end
      ? new Date(
          product.auction_end
        ).getTime() <= Date.now()
      : false;

  setAuctionHasEnded(ended);
}, [product.auction_end]);


  const storedStatus = product.status ?? "active";

  const effectiveStatus =
    storedStatus === "active" && auctionHasEnded
      ? "ended"
      : storedStatus;

  const statusBadge = getStatusBadge(effectiveStatus);

  const isRemoved = effectiveStatus === "removed";
  const isLive = effectiveStatus === "active";
  const hasBids =
  (product.bid_count ?? 0) > 0;

const canEdit =
  mode === "owner" &&
  isLive &&
  !hasBids;

const canDelete =
  mode === "owner" &&
  isLive &&
  !hasBids;

const canRelist =
  mode === "owner" &&
  effectiveStatus === "expired" &&
  !hasBids;

  const removedDate = product.removed_at
    ? new Date(product.removed_at).toLocaleString("ro-RO", {
        timeZone: "Europe/Bucharest",
      })
    : null;

  return (
    <article
      className={`group w-full min-w-0 overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 ${
        isRemoved
          ? "border-2 border-red-200 opacity-90"
          : "hover:-translate-y-2 hover:shadow-xl"
      }`}
    >
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              isRemoved
                ? "grayscale"
                : "group-hover:scale-105"
            }`}
          />
        ) : (
          <span className="text-sm text-gray-400">
            Fără imagine
          </span>
        )}

        {isRemoved && (
          <div className="absolute inset-0 bg-black/25" />
        )}

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${statusBadge.className}`}
        >
          {statusBadge.label}
        </span>

        {mode === "marketplace" &&
          showFavorite &&
          onToggleFavorite &&
          !isRemoved && (
            <div className="absolute right-3 top-3">
              <FavoriteButton
                isFavorite={isFavorite}
                onClick={() =>
                  onToggleFavorite(product.id)
                }
              />
            </div>
          )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
            {product.categories
              ? `${product.categories.icon ?? ""} ${
                  product.categories.name_ro
                }`
              : product.category || "Fără categorie"}
          </span>

          {product.subcategories && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {product.subcategories.name_ro}
            </span>
          )}

          {product.condition && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {product.condition}
            </span>
          )}
        </div>

        <p className="mb-3 text-xs font-medium text-gray-500">
          📍 {product.location || "Fără locație"}
        </p>

        <h3 className="mb-2 line-clamp-1 text-lg font-extrabold text-gray-900">
          {product.title}
        </h3>

        <p className="mb-5 line-clamp-2 text-sm leading-6 text-gray-600">
          {product.description || "Fără descriere."}
        </p>

        {mode === "owner" && isRemoved && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-800">
              ⛔ Produs eliminat de administrator
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm text-red-700">
              Motiv:{" "}
              {product.removal_reason ||
                "Motivul eliminării nu este disponibil."}
            </p>

            {removedDate && (
              <p className="mt-2 text-xs text-red-600">
                Eliminat la: {removedDate}
              </p>
            )}
          </div>
        )}

        <div className="mb-5 rounded-2xl bg-gray-50 p-4">
          <ProductPrice
            currentPrice={product.current_price}
            startingPrice={product.starting_price}
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {isLive && (
  <AuctionTimer
    auctionEnd={
      product.auction_end
    }
    onEnd={handleAuctionEnd}
  />
)}

            {!isLive && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
            )}

            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              🔥 {product.bid_count ?? 0} oferte
            </span>
          </div>
        </div>

        {mode === "marketplace" ? (
          <Link
            href={`/products/${product.id}`}
            className="block w-full rounded-xl bg-black px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Vezi detalii →
          </Link>
        ) : isRemoved ? (
          <div className="space-y-2">
            <Link
              href={`/products/${product.id}`}
              className="block w-full rounded-xl bg-red-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-red-800"
            >
              Vezi detalii și motivul →
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500"
              >
                Editare blocată
              </button>

              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-400"
              >
                Ștergere blocată
              </button>
            </div>
          </div>
     ) : (
  <div className="space-y-3">
    {canRelist &&
      onRelistProduct && (
        <RelistProductPanel
          productId={product.id}
          disabled={relisting}
          onRelist={
            onRelistProduct
          }
        />
      )}

    <div className="flex gap-2">
      {canEdit ? (
        <Link
          href={`/edit-product/${product.id}`}
          className="flex-1 rounded-xl bg-black px-4 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
        >
          Editează
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="flex-1 cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500"
        >
          Editare blocată
        </button>
      )}

      <button
        type="button"
        onClick={() =>
          onDeleteProduct?.(
            product.id
          )
        }
        disabled={!canDelete}
        title={
          canDelete
            ? "Șterge produsul"
            : "Produsul nu mai poate fi șters"
        }
        className="flex-1 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
      >
        {canDelete
          ? "Șterge"
          : "Ștergere blocată"}
      </button>
    </div>
  </div>
)}
      </div>
    </article>
  );
}