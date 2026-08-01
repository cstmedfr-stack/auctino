"use client";

import {
  Gavel,
  RefreshCcw,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type MyBidsPageHeaderProps = {
  refreshing: boolean;
  onRefresh: () => void;
};

export default function MyBidsPageHeader({
  refreshing,
  onRefresh,
}: MyBidsPageHeaderProps) {
  const messages = useMessages();
  const t = messages.myBidsPage;

  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
            <Gavel size={17} />
            {t.eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">
            {t.title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {t.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw
            size={17}
            className={
              refreshing ? "animate-spin" : ""
            }
          />
          {refreshing
            ? t.refreshing
            : t.refresh}
        </button>
      </div>
    </section>
  );
}