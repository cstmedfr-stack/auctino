"use client";

import { useMessages } from "@/i18n/useMessages";
import type { ReceivedBidFilter } from "@/utils/receivedBids";

type ReceivedBidsFiltersProps = {
  filter: ReceivedBidFilter;
  resultCount: number;
  onFilterChange: (
    filter: ReceivedBidFilter
  ) => void;
};

export default function ReceivedBidsFilters({
  filter,
  resultCount,
  onFilterChange,
}: ReceivedBidsFiltersProps) {
  const messages = useMessages();
  const t = messages.receivedBidsPage;

  const options: {
    value: ReceivedBidFilter;
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
      value: "ended",
      label: t.filters.ended,
    },
    {
      value: "transaction",
      label: t.filters.transaction,
    },
    {
      value: "sold",
      label: t.filters.sold,
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
        {options.map((option) => {
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