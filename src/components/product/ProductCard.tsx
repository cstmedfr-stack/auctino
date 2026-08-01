"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import FavoriteButton from "./FavoriteButton";
import AuctionTimer from "../auction/AuctionTimer";
import ProductPrice from "./ProductPrice";
import RelistProductPanel from "./RelistProductPanel";
import {  useCallback,  useEffect,  useState,} from "react";
import {  ArrowRight,  Flame,  MapPin,  ShieldAlert,} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

import { useLocale } from "@/i18n/LocaleProvider";
import { formatDateTime } from "@/utils/formatDateTime";
import {  getProductStatusBadge,  isProductDeleteAllowed,  isProductEditable,  isProductRelistAllowed,} from "@/lib/product-status";


type ProductCardProps = {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
  showFavorite?: boolean;
  imagePriority?: boolean;
  mode?: "marketplace" | "owner";
  onRelistProduct?: (
    productId: string,
    durationDays: number
  ) => Promise<void> | void;
  relisting?: boolean;
};

export default function ProductCard({
  product,
  isFavorite = false,
  onToggleFavorite,
  onDeleteProduct,
  onRelistProduct,
  relisting = false,
  showFavorite = true,
  imagePriority = false,
  mode = "marketplace",
}: ProductCardProps) {


const messages = useMessages();
const t = messages.productCard;
const { locale } = useLocale();
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

  const storedStatus = product.status ?? "active";
  const effectiveStatus =
    storedStatus === "active" && auctionHasEnded
      ? "ended"
      : storedStatus;

const statusBadge =  getProductStatusBadge(    effectiveStatus,    t  );
 
  const isRemoved = effectiveStatus === "removed";
  const isLive = effectiveStatus === "active";
  const hasBids =  (product.bid_count ?? 0) > 0;
const canEdit = isProductEditable({
  mode,
  isLive,
  hasBids,
});

const canDelete =
  isProductDeleteAllowed({
    mode,
    isLive,
    hasBids,
  });

const canRelist =
  isProductRelistAllowed({
    mode,
    status: effectiveStatus,
    hasBids,
  });

  const removedDate = product.removed_at
  ? formatDateTime(product.removed_at, locale)
  : "";
 

  return (
    <article
      className={`group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 ${
  isRemoved
    ? "border-red-200 opacity-90"
    : "border-slate-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
}`}
    >
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-slate-100 sm:h-56">
        {product.image_url ? (
        <Image
            src={product.image_url}
            alt={product.title}
            fill
            priority={imagePriority}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover transition-transform duration-500 ${
              isRemoved
                ? "grayscale"
                : "group-hover:scale-105"
            }`}
          />
        ) : (
          <span className="text-sm text-gray-400">
           {t.noImage}
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

   <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"          >
           {product.categories
  ? `${product.categories.icon ?? ""} ${product.categories.name_ro}`.trim()
  : product.category || t.noCategory}
          </span>

          {product.subcategories && (
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              {product.subcategories.name_ro}
            </span>
          )}

          {product.condition && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {product.condition}
            </span>
          )}
        </div>

          <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <MapPin size={14} className="text-slate-400" />
          {product.location || t.noLocation}
          </p>

      <h3 className="mb-2 line-clamp-2 text-base font-extrabold text-gray-900 sm:text-lg">
          {product.title}
        </h3>

        <p className="mb-5 line-clamp-2 text-sm leading-6 text-slate-600">
          {product.description || t.noDescription}
        </p>

        {mode === "owner" && isRemoved && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-red-800">
            <ShieldAlert size={16} />
           {t.removedByAdmin}
          </p>

            <p className="mt-2 whitespace-pre-wrap text-sm text-red-700">
              {t.removalReason}:{" "}
              {product.removal_reason ||
                t.removalReasonUnavailable
                }
            </p>

            {removedDate && (
              <p className="mt-2 text-xs text-red-600">
                {t.removedAt}: {removedDate}
              </p>
            )}
          </div>
        )}

     <div className="mb-5 mt-auto rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <ProductPrice
            currentPrice={product.current_price}
            startingPrice={product.starting_price}
            label={t.currentOffer}
            size="default"/>

          <div className="mt-3 flex flex-wrap gap-2">
            {isLive && (
            <AuctionTimer
              auctionEnd={
                product.auction_end
              }
              onEnd ={handleAuctionEnd}
            />
          )}

            {!isLive && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              <Flame size={14} />
              {product.bid_count ?? 0} {t.bids}
            </span>
          </div>
        </div>

        {mode === "marketplace" ? (
          <Link
  href={`/products/${product.id}`}
  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
>
  {t.viewDetails}
  <ArrowRight size={16} />
</Link>
        ) : isRemoved ? (
          <div className="space-y-2">
           <Link
  href={`/products/${product.id}`}
  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-800"
>
  {t.viewDetailsAndReason}
  <ArrowRight size={16} />
</Link>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500"
              >
                {t.editBlocked}
              </button>

              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-400"
              >
                {t.deleteBlocked}
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

   <div className="grid gap-2 sm:grid-cols-2">
      {canEdit ? (
        <Link
          href={`/edit-product/${product.id}`}
         className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          {t.edit}
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="flex-1 cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500"
        >
          {t.editBlocked}
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
                  ? t.deleteTitle
                  : t.deleteBlockedTitle
          
              }
        className="flex-1 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
      >
       {canDelete
        ? t.delete
        : t.deleteBlocked}
                
      </button>
    </div>
  </div>
)}
      </div>
    </article>
  );
}