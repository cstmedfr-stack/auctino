"use client";

import {
  Heart,
  Sparkles,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type FavoritesPageHeaderProps = {
  count: number;
};

export default function FavoritesPageHeader({
  count,
}: FavoritesPageHeaderProps) {
  const messages = useMessages();
  const t = messages.favoritesPage;

  const countLabel =
    count === 1
      ? t.savedCountSingular
      : t.savedCount.replace(
          "{count}",
          String(count)
        );

  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
            <Heart size={17} />
            {t.eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            {t.title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {t.description}
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
          <Sparkles size={16} />
          {countLabel}
        </div>
      </div>
    </section>
  );
}