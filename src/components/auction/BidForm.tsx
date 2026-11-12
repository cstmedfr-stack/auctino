
"use client";

import type { FormEvent } from "react";
import { Gavel } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { useMessages } from "@/i18n/useMessages";

type BidFormProps = {
  currentPrice: number;
  bidAmount: string;
  bidError: string;
  bidLoading: boolean;
  bidsCount: number;
  onBidAmountChange: (value: string) => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
};

export default function BidForm({
  currentPrice,
  bidAmount,
  bidError,
  bidLoading,
  bidsCount,
  onBidAmountChange,
  onSubmit,
}: BidFormProps) {
  const messages = useMessages();
  const t = messages.productPage;

  const minimumAmount =  bidsCount > 0
    ? currentPrice + 1
    : currentPrice;

  const minimumText = t.minimumBid.replace(
    "{amount}",
    formatPrice(minimumAmount)
  );

  return (
    <form
      onSubmit={onSubmit}
      className="w-full min-w-0 space-y-3"
    >
      <input
        type="number"
        inputMode="decimal"
        min={minimumAmount}
        step="0.01"
        required
        value={bidAmount}
        onChange={(event) =>
          onBidAmountChange(event.target.value)
        }
        className="block w-full min-w-0 max-w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
        placeholder={minimumText}
      />

      {bidError && (
        <p className="break-words rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {bidError}
        </p>
      )}

      <button
        type="submit"
        disabled={bidLoading}
        className="flex w-full min-w-0 max-w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-4 text-center text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
      >
        <Gavel size={18} className="shrink-0" />
        <span className="min-w-0 whitespace-normal break-words">
          {bidLoading ? t.bidSubmitting : t.bidSubmit}
        </span>
      </button>
    </form>
  );
}
