"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Flame,
  MapPin,
  ReceiptText,
  UsersRound,
} from "lucide-react";

import AuctionTimer from "@/components/auction/AuctionTimer";
import { useLocale } from "@/i18n/LocaleProvider";
import { useMessages } from "@/i18n/useMessages";
import { formatLocalizedDateTime } from "@/i18n/format";
import type { ReceivedBidProduct } from "@/types/received-bid";
import { formatPrice } from "@/utils/formatPrice";
import {
  canViewReceivedBidTransaction,
  getReceivedBidStatus,
} from "@/utils/receivedBids";

type ReceivedBidProductCardProps = {
  product: ReceivedBidProduct;
  confirmationOpen: boolean;
  finalizing: boolean;
  onRequestFinalize: (
    productId: string
  ) => void;
  onCancelFinalize: () => void;
  onConfirmFinalize: (
    productId: string
  ) => void;
};

export default function ReceivedBidProductCard({
  product,
  confirmationOpen,
  finalizing,
  onRequestFinalize,
  onCancelFinalize,
  onConfirmFinalize,
}: ReceivedBidProductCardProps) {
  const messages = useMessages();
  const { locale } = useLocale();

  const t = messages.receivedBidsPage;

  const productStatus = getReceivedBidStatus(
    product,
    t.status
  );

  const isRemoved =
    product.status === "removed";

  const canViewTransaction =
    canViewReceivedBidTransaction(product);

  return (
    <article
      className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isRemoved
          ? "border-red-200 opacity-90"
          : "border-slate-200"
      }`}
    >
      <div className="relative h-52 bg-slate-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover ${
              isRemoved ? "grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
            {t.card.noImage}
          </div>
        )}

        {isRemoved && (
          <div className="absolute inset-0 bg-black/25" />
        )}

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black uppercase shadow-sm ${productStatus.className}`}
        >
          {productStatus.label}
        </span>
      </div>

      <div className="p-6">
        <p className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
          <MapPin size={14} />
          {product.location ||
            t.card.noLocation}
        </p>

        <h2 className="line-clamp-1 text-xl font-black text-slate-950">
          {product.title}
        </h2>

        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
          {product.description ||
            t.card.noDescription}
        </p>

        <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {t.card.highestBid}
          </p>

          <p className="mt-2 text-3xl font-black">
            {formatPrice(product.highest_bid)}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {t.card.startingPrice}:{" "}
            {formatPrice(product.starting_price)}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-orange-50 p-4">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700">
              <Flame size={14} />
              {t.card.totalBids}
            </p>

            <p className="mt-1 text-2xl font-black text-orange-900">
              {product.total_bids}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
              <UsersRound size={14} />
              {t.card.uniqueBidders}
            </p>

            <p className="mt-1 text-2xl font-black text-blue-900">
              {product.unique_bidders}
            </p>
          </div>
        </div>

        {product.is_active &&
          product.auction_end && (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                <Clock3 size={14} />
                {t.card.timeLeft}
              </p>

              <AuctionTimer
                auctionEnd={
                  product.auction_end
                }
              />
            </div>
          )}

        <div
          className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ${productStatus.className}`}
        >
          {productStatus.description}
        </div>

        <p className="mt-4 text-xs font-medium text-slate-500">
          {t.card.lastBid}:{" "}
          {formatLocalizedDateTime(
            product.last_bid_at,
            locale
          )}
        </p>

        {confirmationOpen && (
          <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <p className="font-black text-orange-950">
              {t.finalizeConfirmTitle}
            </p>

            <p className="mt-2 text-sm leading-6 text-orange-800">
              {t.finalizeConfirmDescription}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onConfirmFinalize(
                    product.product_id
                  )
                }
                disabled={finalizing}
                className="rounded-xl bg-orange-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-800 disabled:opacity-60"
              >
                {finalizing
                  ? t.finalizeLoading
                  : t.finalizeConfirm}
              </button>

              <button
                type="button"
                onClick={onCancelFinalize}
                disabled={finalizing}
                className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-800 transition hover:bg-orange-100 disabled:opacity-60"
              >
                {t.finalizeCancel}
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-2">
          {product.can_finalize &&
            !confirmationOpen && (
              <button
                type="button"
                onClick={() =>
                  onRequestFinalize(
                    product.product_id
                  )
                }
                disabled={finalizing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-700 px-4 py-3 text-center font-bold text-white transition hover:bg-orange-800 disabled:opacity-60"
              >
                {finalizing
                  ? t.finalizeLoading
                  : t.finalizeAction}
              </button>
            )}

          {canViewTransaction && (
            <Link
              href={`/transactions/${product.product_id}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-800"
            >
              <ReceiptText size={17} />
              {t.card.viewTransaction}
            </Link>
          )}

          {!isRemoved ? (
            <Link
              href={`/products/${product.product_id}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
            >
              {t.card.viewProduct}
              <ArrowRight size={17} />
            </Link>
          ) : (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700">
              {t.card.productUnavailable}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}