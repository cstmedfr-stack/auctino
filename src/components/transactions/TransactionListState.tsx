"use client";

import {
  AlertTriangle,
  Loader2,
  ReceiptText,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type TransactionListStateProps =
  | {
      type: "loading";
    }
  | {
      type: "error";
      message: string;
      onRetry: () => void;
    }
  | {
      type: "empty";
    };

export default function TransactionListState(
  props: TransactionListStateProps
) {
  const messages = useMessages();
  const t = messages.transaction.list;

  if (props.type === "loading") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Loader2
            size={28}
            className="animate-spin"
          />
        </div>

        <h2 className="text-xl font-bold text-slate-950">
          {t.loadingTitle}
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          {t.loadingDescription}
        </p>
      </section>
    );
  }

  if (props.type === "error") {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-700">
          <AlertTriangle size={28} />
        </div>

        <h2 className="text-xl font-bold text-red-950">
          {t.errorTitle}
        </h2>

        <p className="mt-2 text-sm leading-6 text-red-700">
          {props.message}
        </p>

        <button
          type="button"
          onClick={props.onRetry}
          className="mt-5 rounded-2xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800"
        >
          {t.retry}
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <ReceiptText size={28} />
      </div>

      <h2 className="text-xl font-bold text-slate-950">
        {t.emptyTitle}
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        {t.emptyDescription}
      </p>
    </section>
  );
}