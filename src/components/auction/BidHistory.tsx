"use client";

import {
  Flame,
  Trophy,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { formatDateTime } from "@/utils/formatDateTime";
import { useLocale } from "@/i18n/LocaleProvider";
import { useMessages } from "@/i18n/useMessages";

type Bid = {
  id: string;
  amount: number;
  created_at: string;
  is_my_bid: boolean;
};

type BidHistoryProps = {
  bids: Bid[];
  auctionClosed: boolean;
};

export default function BidHistory({
  bids,
  auctionClosed,
}: BidHistoryProps) {
  const messages = useMessages();
  const t = messages.productPage;
  const { locale } = useLocale();

  const offerCountText =
    t.offerCount.replace(
      "{count}",
      String(bids.length)
    );

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            {t.bidHistoryEyebrow}
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            {t.bidHistoryTitle}
          </h2>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
          <Flame size={16} />
          {offerCountText}
        </span>
      </div>

      {bids.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-6 text-center">
          <p className="font-semibold text-slate-800">
            {t.noBidsYet}
          </p>

          {!auctionClosed && (
            <p className="mt-2 text-sm text-slate-500">
              {t.beFirstToBid}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid, index) => {
            const isHighestBid =
              index === 0;

            return (
              <div
                key={bid.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${
                      bid.is_my_bid
                        ? "bg-blue-100 text-blue-700"
                        : isHighestBid
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {bid.is_my_bid ? (
                      t.youShort
                    ) : isHighestBid ? (
                      <Trophy size={18} />
                    ) : (
                      `#${index + 1}`
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-slate-950">
                      {formatPrice(bid.amount)}
                    </p>

                    <p className="text-sm text-slate-500">
                      {bid.is_my_bid
                        ? t.yourBid
                        : t.anonymousBid}
                    </p>
                  </div>
                </div>

                <span className="text-right text-sm text-slate-500">
                  {formatDateTime(
                    bid.created_at,
                    locale
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}