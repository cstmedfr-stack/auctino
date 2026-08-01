"use client";

import Link from "next/link";
import {
  ArrowRight,
  Gavel,
  PackagePlus,
  Sparkles,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

export function FinalCTA() {
  const messages = useMessages();
  const t = messages.home.finalCta;

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-14 text-center shadow-2xl shadow-slate-300/40 sm:px-10 lg:px-16">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
          <Sparkles size={24} />
        </div>

        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-300">
          {t.eyebrow}
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          {t.title}
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          {t.description}
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-indigo-50"
          >
            <Gavel size={18} />
            {t.primary}
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/add-product"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <PackagePlus size={18} />
            {t.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}