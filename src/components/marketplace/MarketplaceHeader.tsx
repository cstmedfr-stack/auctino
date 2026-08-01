"use client";

import Link from "next/link";
import {
  ArrowRight,
  PackagePlus,
  Sparkles,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type MarketplaceHeaderProps = {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
};

export default function MarketplaceHeader({
  hasActiveFilters,
  onResetFilters,
}: MarketplaceHeaderProps) {
  const messages = useMessages();
  const t = messages.marketplace;

  return (
    <section className="mb-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl shadow-slate-300/40">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-indigo-100">
            <Sparkles size={16} />
            {t.heroEyebrow}
          </div>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t.heroTitle}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            {t.heroDescription}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Link
            href="/add-product"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-indigo-50"
          >
            <PackagePlus size={18} />
            {t.addProduct}
            <ArrowRight size={18} />
          </Link>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              {t.resetFilters}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}