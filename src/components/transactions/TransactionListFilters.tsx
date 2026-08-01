"use client";

import { TransactionStatus } from "@/types/transaction";

export type TransactionListFilter =
  | "all"
  | TransactionStatus;

type TransactionListFilterOption = {
  value: TransactionListFilter;
  label: string;
  count: number;
};

type TransactionListFiltersProps = {
  filter: TransactionListFilter;
  options: readonly TransactionListFilterOption[];
  onChange: (filter: TransactionListFilter) => void;
};

export default function TransactionListFilters({
  filter,
  options,
  onChange,
}: TransactionListFiltersProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {options.map((option) => {
        const active =
          filter === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              onChange(option.value)
            }
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition ${
              active
                ? "bg-slate-950 text-white"
                : "bg-white text-slate-600 shadow-sm hover:bg-slate-100"
            }`}
          >
            {option.label}

            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                active
                  ? "bg-white/15 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}