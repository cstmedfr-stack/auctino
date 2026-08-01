"use client";

import { ReceiptText } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type TransactionListHeaderProps = {
  count: number;
};

export default function TransactionListHeader({
  count,
}: TransactionListHeaderProps) {
  const messages = useMessages();
  const t = messages.transaction.list;

  const countText = t.countLabel.replace(
    "{count}",
    String(count)
  );

  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
            <ReceiptText size={17} />
            {t.eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            {messages.transaction.title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {t.description}
          </p>
        </div>

        <span className="inline-flex w-fit rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
          {countText}
        </span>
      </div>
    </section>
  );
}