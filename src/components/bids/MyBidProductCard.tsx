"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Flame,
  MapPin,
  ReceiptText,
} from "lucide-react";

import AuctionTimer from "@/components/auction/AuctionTimer";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatLocalizedDateTime } from "@/i18n/format";
import type { MyBidProduct } from "@/types/my-bid";
import { formatPrice } from "@/utils/formatPrice";
import {
  getBidStatus,
  isAuctionActive,
} from "@/utils/myBids";

type MyBidProductCardProps = {
  product: MyBidProduct;
};

export default function MyBidProductCard({
  product,
}: MyBidProductCardProps) {
  const messages = useMessages();
  const { locale } = useLocale();

  const t = messages.myBidsPage;
  const bidStatus = getBidStatus(
    product,
    t.status
  );

  const active = isAuctionActive(product);

  const isRemoved =
    product.status === "removed";

  const canViewTransaction =
    product.is_winner &&
    (product.status ===
      "transaction_pending" ||
      product.status === "sold");

  const productHref =
    `/products/${product.product_id}`;

  const transactionHref =
    `/transactions/${product.product_id}`;

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
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black uppercase shadow-sm ${bidStatus.className}`}
        >
          {bidStatus.label}
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

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-bold text-blue-600">
              {t.card.yourBid}
            </p>

            <p className="mt-1 text-lg font-black text-blue-900">
              {formatPrice(
                product.my_highest_bid
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-orange-50 p-4">
            <p className="text-xs font-bold text-orange-600">
              {t.card.highestBid}
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
            <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-700">
              <Flame size={16} />
              {product.bid_count ?? 0}{" "}
              {t.card.bids}
            </span>

            <span className="text-sm font-bold text-slate-700">
              {t.card.currentPrice}:{" "}
              {formatPrice(
                product.current_price ??
                  product.starting_price
              )}
            </span>
          </div>

          {active && product.auction_end && (
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
          className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ${bidStatus.className}`}
        >
          {bidStatus.description}
        </div>

        <p className="mt-4 text-xs font-medium text-slate-500">
          {t.card.lastBid}:{" "}
          {formatLocalizedDateTime(
            product.last_bid_at,
            locale
          )}
        </p>

        <div className="mt-5 space-y-2">
          {canViewTransaction && (
            <Link
              href={transactionHref}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-800"
            >
              <ReceiptText size={17} />
              {t.card.viewTransaction}
            </Link>
          )}

          {!isRemoved ? (
            <Link
              href={productHref}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-center font-bold text-white transition hover:bg-indigo-700"
            >
              {active && !product.is_leading
                ? t.card.increaseBid
                : t.card.viewProduct}
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