"use client";

import type { FormEvent } from "react";
import {
  Ban,
  CheckCircle2,
  Clock3,
  Eye,
  PackageCheck,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { useMessages } from "@/i18n/useMessages";
import BidForm from "./BidForm";

type ProductBidPanelProps = {
  productStatus: string | null;
  isSeller: boolean;
  auctionClosed: boolean;
  bidsCount: number;
  highestBidAmount: number;
  awaitingAutomaticProcessing: boolean;
  canViewTransaction: boolean;
  currentPrice: number;

  bidAmount: string;
  bidError: string;
  bidLoading: boolean;

  onBidAmountChange: (value: string) => void;
  onBidSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
  onViewTransaction: () => void;
};

export default function ProductBidPanel({
  productStatus,
  isSeller,
  auctionClosed,
  bidsCount,
  highestBidAmount,
  awaitingAutomaticProcessing,
  canViewTransaction,
  currentPrice,
  bidAmount,
  bidError,
  bidLoading,
  onBidAmountChange,
  onBidSubmit,
  onViewTransaction,
}: ProductBidPanelProps) {
  const messages = useMessages();
  const t = messages.productPage;

  if (productStatus === "removed") {
    return (
      <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="inline-flex items-center gap-2 text-lg font-bold text-red-800">
          <Ban size={20} />
          {t.removedBidTitle}
        </p>

        <p className="mt-2 text-sm leading-6 text-red-700">
          {t.removedBidDescription}
        </p>
      </section>
    );
  }

  return (
  <section className="mt-6 w-full min-w-0">
      {isSeller && !auctionClosed && (
       <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
          <p className="inline-flex items-center gap-2 text-lg font-bold text-blue-700">
            <UserRound size={20} />
            {t.ownProductBidTitle}
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-700">
            {t.ownProductBidDescription}
          </p>
        </div>
      )}

      {auctionClosed ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="inline-flex items-center gap-2 text-lg font-bold text-emerald-700">
            <CheckCircle2 size={20} />
            {t.auctionEndedTitle}
          </p>

          <p className="mt-2 text-sm leading-6 text-emerald-700">
            {t.closedAuctionHint}
          </p>

          {bidsCount > 0 ? (
            <p className="mt-3 font-semibold text-slate-900">
              {t.highestBid}:
              <span className="ml-2 text-emerald-700">
                {formatPrice(highestBidAmount)}
              </span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-700">
              {t.auctionNoBids}
            </p>
          )}

          {awaitingAutomaticProcessing && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="inline-flex items-center gap-2 font-bold text-amber-800">
                <Clock3 size={18} />
                {t.auctionProcessingTitle}
              </p>

              <p className="mt-2 text-sm leading-6 text-amber-700">
                {t.auctionProcessingDescription}
              </p>
            </div>
          )}

          {canViewTransaction && (
            <button
              type="button"
              onClick={onViewTransaction}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Eye size={18} />
              {t.viewTransaction}
            </button>
          )}

          {productStatus === "sold" && (
            <div className="mt-4 inline-flex w-full items-center gap-2 rounded-xl bg-green-100 p-4 text-sm font-medium text-green-700">
              <PackageCheck size={18} />
              {t.soldNotice}
            </div>
          )}

          {productStatus ===
            "transaction_pending" &&
            !canViewTransaction && (
              <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-700">
                {t.transactionPendingNotice}
              </div>
            )}
        </div>
      ) : !isSeller ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 rounded-2xl bg-indigo-50 p-4">
            <p className="inline-flex items-center gap-2 text-base font-black text-indigo-800">
              <ShieldCheck size={18} />
              {t.bidPanelTitle}
            </p>

            <p className="mt-2 text-sm leading-6 text-indigo-700">
              {t.bidPanelDescription}
            </p>

            <p className="mt-3 text-sm font-bold text-indigo-900">
              {t.currentOffer}:{" "}
              {formatPrice(currentPrice)}
            </p>
          </div>

          <BidForm
            currentPrice={currentPrice}
            bidAmount={bidAmount}
            bidError={bidError}
            bidLoading={bidLoading}
            bidsCount={bidsCount}
            onBidAmountChange={
              onBidAmountChange
            }
            onSubmit={onBidSubmit}
          />
        </div>
      ) : null}
    </section>
  );
}