"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Inbox,
  Loader2,
  SearchX,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type ReceivedBidsStateProps =
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
    }
  | {
      type: "noResults";
      onShowAll: () => void;
    };

export default function ReceivedBidsState(
  props: ReceivedBidsStateProps
) {
  const messages = useMessages();
  const t = messages.receivedBidsPage;

  if (props.type === "loading") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
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
      <section className="rounded-3xl border border-red-200 bg-red-50 p-10 shadow-sm">
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

  if (props.type === "noResults") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <SearchX size={28} />
        </div>

        <h2 className="text-xl font-bold text-slate-950">
          {t.noResultsTitle}
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          {t.noResultsDescription}
        </p>

        <button
          type="button"
          onClick={props.onShowAll}
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          {t.showAll}
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Inbox size={28} />
      </div>

      <h2 className="text-2xl font-black text-slate-950">
        {t.emptyTitle}
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        {t.emptyDescription}
      </p>

      <Link
        href="/my-products"
        className="mt-7 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
      >
        {t.viewMyProducts}
      </Link>
    </section>
  );
}