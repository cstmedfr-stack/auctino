"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Package,
  ShoppingBag,
  Star,
  Store,
  UserRound,
} from "lucide-react";

import { Transaction } from "@/types/transaction";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  formatLocalizedDateTime,
  formatLocalizedPrice,
} from "@/i18n/format";
import { currentMarket } from "@/config/market";

type TransactionProductSummary = {
  id: string;
  title: string | null;
  image_url: string | null;
};

type TransactionCardData = Transaction & {
  currentUserHasReviewed?: boolean;
};

type TransactionCardProps = {
  transaction: TransactionCardData;
  product?: TransactionProductSummary;
  currentUserId: string;
  otherPartyId: string;
  otherPartyName: string;
};

export default function TransactionCard({
  transaction,
  product,
  currentUserId,
  otherPartyId,
  otherPartyName,
}: TransactionCardProps) {
  const messages = useMessages();
  const { locale } = useLocale();
  const t = messages.transaction.list;

  const isSeller =
    currentUserId === transaction.seller_id;

  const roleLabel = isSeller
    ? messages.transaction.role.sold
    : messages.transaction.role.bought;

  const otherPartyRoleLabel = isSeller
    ? t.buyerLabel
    : t.sellerLabel;

  const productTitle =
    product?.title || t.productUnavailable;

  const currentUserConfirmed = isSeller
    ? transaction.seller_confirmed
    : transaction.buyer_confirmed;

  const otherPartyConfirmed = isSeller
    ? transaction.buyer_confirmed
    : transaction.seller_confirmed;

  function getStatusLabel() {
    switch (transaction.status) {
      case "pending_confirmation":
        return messages.transaction.status
          .pending_confirmation;

      case "completed":
        return messages.transaction.status.completed;

      case "cancelled":
        return messages.transaction.status.cancelled;

      case "disputed":
        return messages.transaction.status.disputed;

      default:
        return transaction.status;
    }
  }

  function getStatusClassName() {
    if (transaction.status === "completed") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (transaction.status === "cancelled") {
      return "bg-red-50 text-red-700";
    }

    if (transaction.status === "disputed") {
      return "bg-amber-50 text-amber-800";
    }

    return "bg-slate-100 text-slate-700";
  }

  function getActionLabel() {
    if (
      transaction.status ===
      "pending_confirmation"
    ) {
      return currentUserConfirmed
        ? t.actionView
        : t.actionConfirm;
    }

    if (
      transaction.status === "completed" &&
      !transaction.currentUserHasReviewed
    ) {
      return t.actionReview;
    }

    return t.actionView;
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid md:grid-cols-[190px_1fr]">
        <div className="min-h-48 bg-slate-100">
          {product?.image_url ? (
            <img
              src={product.image_url}
              alt={productTitle}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-48 flex-col items-center justify-center text-slate-500">
              <Package size={38} />

              <p className="mt-2 text-xs font-semibold">
                {t.noImage}
              </p>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row">
            <div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClassName()}`}
                >
                  {getStatusLabel()}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                  {isSeller ? (
                    <Store size={14} />
                  ) : (
                    <ShoppingBag size={14} />
                  )}

                  {roleLabel}
                </span>

                {transaction.currentUserHasReviewed && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                    <Star size={14} />
                    {t.reviewSent}
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-2xl font-black text-slate-950">
                {productTitle}
              </h2>

              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <UserRound size={15} />

                <span>
                  {otherPartyRoleLabel}:{" "}
                  <span className="font-semibold text-slate-800">
                    {otherPartyName}
                  </span>
                </span>
              </p>
            </div>

            <div className="lg:text-right">
              <p className="text-sm font-semibold text-slate-500">
                {t.finalPrice}
              </p>

              <p className="mt-1 text-3xl font-black text-slate-950">
                {formatLocalizedPrice(
                  Number(
                    transaction.final_price ?? 0
                  ),
                  locale,
                  currentMarket.currency
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {formatLocalizedDateTime(
                  transaction.created_at,
                  locale
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <ConfirmationBox
              title={t.yourConfirmation}
              confirmed={Boolean(
                currentUserConfirmed
              )}
              confirmedLabel={t.confirmed}
              unconfirmedLabel={t.unconfirmed}
            />

            <ConfirmationBox
              title={t.otherConfirmation}
              confirmed={Boolean(
                otherPartyConfirmed
              )}
              confirmedLabel={t.confirmed}
              unconfirmedLabel={t.unconfirmed}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/transactions/${transaction.product_id}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              {getActionLabel()}
              <ArrowRight size={16} />
            </Link>

            {otherPartyId && (
              <Link
                href={`/users/${otherPartyId}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <UserRound size={16} />
                {t.viewProfile}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function ConfirmationBox({
  title,
  confirmed,
  confirmedLabel,
  unconfirmedLabel,
}: {
  title: string;
  confirmed: boolean;
  confirmedLabel: string;
  unconfirmedLabel: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p
        className={`mt-2 inline-flex items-center gap-2 font-bold ${
          confirmed
            ? "text-emerald-700"
            : "text-slate-700"
        }`}
      >
        {confirmed ? (
          <CheckCircle2 size={18} />
        ) : (
          <Clock3 size={18} />
        )}

        {confirmed
          ? confirmedLabel
          : unconfirmedLabel}
      </p>
    </div>
  );
}