"use client";

import {
  AlertTriangle,
  Clock3,
  Flame,
  Heart,
  ShieldCheck,
  Tag,
  Info,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { currentMarket } from "@/config/market";
import { useMessages } from "@/i18n/useMessages";

type ProductSummaryPanelProduct = {
  title: string;
  category: string | null;
  condition: string | null;
  starting_price: number;
  current_price: number | null;
  bid_count: number | null;
  auction_end: string | null;
  status: string | null;
};

type ProductSummaryPanelProps = {
  product: ProductSummaryPanelProduct;
  currentPrice: number;
  isFavorite: boolean;
  favoriteLoading: boolean;
  isLive: boolean;
  auctionClosed: boolean;
  remainingMilliseconds: number | null;
  onToggleFavorite: () => void;
};

export default function ProductSummaryPanel({
  product,
  currentPrice,
  isFavorite,
  favoriteLoading,
  isLive,
  auctionClosed,
  remainingMilliseconds,
  onToggleFavorite,
}: ProductSummaryPanelProps) {
  const messages = useMessages();
  const t = messages.productPage;
  const statusT = messages.productCard.status;

  const isEndingSoon =
    !auctionClosed &&
    remainingMilliseconds !== null &&
    remainingMilliseconds <= 10 * 60 * 1000;

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
          <Tag size={14} />
          {product.category || t.noCategory}
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
          <ShieldCheck size={14} />
          {product.condition ||
            t.conditionUnspecified}
        </span>

        <ProductStatusBadge
          status={product.status}
          isLive={isLive}
          labels={{
            live: statusT.live,
            transactionPending:
              statusT.transactionPending,
            sold: statusT.sold,
            expired: statusT.expired,
            removed: statusT.removed,
            ended: statusT.ended,
          }}
        />
      </div>

      <div className="mb-7 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {product.title}
        </h1>

        {product.status !== "removed" && (
         <button
            type="button"
            onClick={onToggleFavorite}
            disabled={favoriteLoading}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite
                ? t.removeSavedProduct
                : t.saveProduct
            }
            title={
              isFavorite
                ? t.removeSavedProduct
                : t.saveProduct
            }
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-rose-200 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart
              size={21}
              className={
                isFavorite
                  ? "fill-rose-500 text-rose-500"
                  : ""
              }
            />
          </button>
        )}
      </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4">
  <p className="inline-flex items-center gap-2 text-sm font-bold text-white">
    <Info size={17} />
    {t.summaryTrustTitle}
  </p>

  <p className="mt-2 text-sm leading-6 text-slate-300">
    {t.summaryTrustDescription}
  </p>
</div>
      <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/40">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          {t.currentOffer}
        </p>

        <p className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {formatPrice(currentPrice)}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t.startingPrice}
            </p>

            <p className="mt-1 font-bold">
              {formatPrice(
                product.starting_price
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t.bids}
            </p>

            <p className="mt-1 inline-flex items-center gap-1.5 font-bold">
              <Flame size={17} />
              {product.bid_count ?? 0}
            </p>
          </div>
        </div>

        {product.auction_end && (
          <div
            className={`mt-4 rounded-2xl p-4 ${
              auctionClosed
                ? "bg-red-500/20"
                : isEndingSoon
                  ? "bg-red-500/25"
                  : "bg-white/10"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {auctionClosed
                    ? t.auctionFinished
                    : t.timeLeft}
                </p>

                <p
                  className={`mt-1 inline-flex items-center gap-2 text-2xl font-black ${
                    isEndingSoon
                      ? "text-red-300"
                      : "text-white"
                  }`}
                >
                  <Clock3 size={22} />
                  {auctionClosed ||
                  remainingMilliseconds === null
                    ? "00m 00s"
                    : formatRemainingTime(
  remainingMilliseconds,
  t.timeUnits
)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t.endsAt}
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  {formatAuctionEnd(
                    product.auction_end
                  )}
                </p>
              </div>
            </div>

            {isEndingSoon && (
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-200">
                <AlertTriangle size={16} />
                {t.endingSoon}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
    
  );
}

function ProductStatusBadge({
  status,
  isLive,
  labels,
}: {
  status: string | null;
  isLive: boolean;
  labels: {
    live: string;
    transactionPending: string;
    sold: string;
    expired: string;
    removed: string;
    ended: string;
  };
}) {
  if (isLive) {
    return (
      <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
        {labels.live}
      </span>
    );
  }

  if (status === "transaction_pending") {
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
        {labels.transactionPending}
      </span>
    );
  }

  if (status === "sold") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
        {labels.sold}
      </span>
    );
  }

  if (status === "expired") {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
        {labels.expired}
      </span>
    );
  }

  if (status === "removed") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
        {labels.removed}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
      {labels.ended}
    </span>
  );
}

function formatRemainingTime(
  milliseconds: number,
  units: {
    day: string;
    hour: string;
    minute: string;
    second: string;
  }
) {
  const totalSeconds = Math.max(
    Math.floor(milliseconds / 1000),
    0
  );

  const days = Math.floor(
    totalSeconds / 86400
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  if (days > 0) {
    return `${days}${units.day} ${hours}${units.hour} ${minutes}${units.minute}`;
  }

  if (hours > 0) {
    return `${hours}${units.hour} ${minutes}${units.minute} ${seconds}${units.second}`;
  }

  return `${minutes}${units.minute} ${seconds}${units.second}`;
}

function formatAuctionEnd(value: string) {
  return new Date(value).toLocaleString(
    currentMarket.formattingLocale,
    {
      timeZone: currentMarket.timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}