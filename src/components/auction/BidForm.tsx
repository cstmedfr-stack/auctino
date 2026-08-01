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
  onBidAmountChange,
  onSubmit,
}: BidFormProps) {
  const messages = useMessages();
  const t = messages.productPage;

  const minimumAmount = currentPrice + 1;

  const minimumText = t.minimumBid.replace(
    "{amount}",
    formatPrice(minimumAmount)
  );

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3"
    >
      <input
        type="number"
        min={minimumAmount}
        required
        value={bidAmount}
        onChange={(event) =>
          onBidAmountChange(
            event.target.value
          )
        }
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
        placeholder={minimumText}
      />

      {bidError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {bidError}
        </p>
      )}

      <button
        type="submit"
        disabled={bidLoading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Gavel size={18} />
        {bidLoading
          ? t.bidSubmitting
          : t.bidSubmit}
      </button>
    </form>
  );
}