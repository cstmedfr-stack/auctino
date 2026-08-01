"use client";

import { useMessages } from "@/i18n/useMessages";
import type { BidFilter } from "@/utils/myBids";

type MyBidsFiltersProps = {
  filter: BidFilter;
  resultCount: number;
  onFilterChange: (filter: BidFilter) => void;
};

export default function MyBidsFilters({
  filter,
  resultCount,
  onFilterChange,
}: MyBidsFiltersProps) {
  const messages = useMessages();
  const t = messages.myBidsPage;

  const filterOptions: {
    value: BidFilter;
    label: string;
  }[] = [
    {
      value: "all",
      label: t.filters.all,
    },
    {
      value: "active",
      label: t.filters.active,
    },
    {
      value: "leading",
      label: t.filters.leading,
    },
    {
      value: "outbid",
      label: t.filters.outbid,
    },
    {
      value: "won",
      label: t.filters.won,
    },
    {
      value: "closed",
      label: t.filters.closed,
    },
  ];

  const resultLabel =
    resultCount === 1
      ? t.resultCountSingular
      : t.resultCount.replace(
          "{count}",
          String(resultCount)
        );

  return (
    <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => {
          const active =
            filter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onFilterChange(option.value)
              }
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                active
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-600 shadow-sm hover:bg-slate-100"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="text-sm font-medium text-slate-500">
        {resultLabel}
      </p>
    </section>
  );
}