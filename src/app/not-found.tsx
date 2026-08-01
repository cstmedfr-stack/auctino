"use client";

import Link from "next/link";
import {
  Home,
  SearchX,
  Store,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

export default function NotFoundPage() {
  const messages = useMessages();
  const t = messages.systemPages;

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-16">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <SearchX size={32} />
        </div>

        <h1 className="mt-6 text-3xl font-black text-slate-950 sm:text-4xl">
          {t.notFoundTitle}
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          {t.notFoundDescription}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            <Home size={17} />
            {t.goHome}
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Store size={17} />
            {t.goMarketplace}
          </Link>
        </div>
      </section>
    </main>
  );
}