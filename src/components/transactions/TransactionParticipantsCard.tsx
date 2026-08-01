"use client";

import {
  ShoppingBag,
  Store,
} from "lucide-react";

import { Transaction } from "@/types/transaction";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatLocalizedDateTime } from "@/i18n/format";

type PublicProfileSummary = {
  id: string;
  full_name: string | null;
  username?: string | null;
  name?: string | null;
  avatar_url?: string | null;
};

type TransactionParticipantsCardProps = {
  transaction: Transaction;
  seller: PublicProfileSummary | null;
  buyer: PublicProfileSummary | null;
};

export default function TransactionParticipantsCard({
  transaction,
  seller,
  buyer,
}: TransactionParticipantsCardProps) {
  const messages = useMessages();
  const { locale } = useLocale();

  function getUserName(
    profile: PublicProfileSummary | null
  ) {
    return (
      profile?.full_name ||
      profile?.username ||
      profile?.name ||
      messages.common.user
    );
  }

  return (
    <section className="mt-6 grid gap-6 md:grid-cols-2">
      <ParticipantCard
        icon={<Store size={22} />}
        title={messages.transactionDetails.seller}
        name={getUserName(seller)}
        confirmationLabel={
          messages.transactionDetails.sellerConfirmation
        }
        confirmed={Boolean(
          transaction.seller_confirmed
        )}
        confirmedAt={
          transaction.seller_confirmed_at
        }
        confirmedLabel={
          messages.transactionDetails.confirmed
        }
        unconfirmedLabel={
          messages.transactionDetails.unconfirmed
        }
        locale={locale}
      />

      <ParticipantCard
        icon={<ShoppingBag size={22} />}
        title={messages.transactionDetails.buyer}
        name={getUserName(buyer)}
        confirmationLabel={
          messages.transactionDetails.buyerConfirmation
        }
        confirmed={Boolean(
          transaction.buyer_confirmed
        )}
        confirmedAt={
          transaction.buyer_confirmed_at
        }
        confirmedLabel={
          messages.transactionDetails.confirmed
        }
        unconfirmedLabel={
          messages.transactionDetails.unconfirmed
        }
        locale={locale}
      />
    </section>
  );
}

function ParticipantCard({
  icon,
  title,
  name,
  confirmationLabel,
  confirmed,
  confirmedAt,
  confirmedLabel,
  unconfirmedLabel,
  locale,
}: {
  icon: React.ReactNode;
  title: string;
  name: string;
  confirmationLabel: string;
  confirmed: boolean;
  confirmedAt: string | null;
  confirmedLabel: string;
  unconfirmedLabel: string;
 locale: "ro" | "fr";
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {name}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-500">
          {confirmationLabel}
        </p>

        <p
          className={`mt-1 font-bold ${
            confirmed
              ? "text-emerald-700"
              : "text-slate-700"
          }`}
        >
          {confirmed
            ? confirmedLabel
            : unconfirmedLabel}
        </p>

        {confirmedAt && (
          <p className="mt-1 text-sm text-slate-500">
            {formatLocalizedDateTime(
              confirmedAt,
              locale
            )}
          </p>
        )}
      </div>
    </article>
  );
}