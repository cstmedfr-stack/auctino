"use client";

import { Search } from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

export type NotificationFilter =
  | "all"
  | "unread"
  | "messages"
  | "transactions"
  | "auctions"
  | "reviews"
  | "reports"
  | "account";

type NotificationFilterOption = {
  value: NotificationFilter;
  label: string;
  count: number;
};

type NotificationFiltersProps = {
  filter: NotificationFilter;
  searchQuery: string;
  options: readonly NotificationFilterOption[];
  onFilterChange: (filter: NotificationFilter) => void;
  onSearchChange: (value: string) => void;
};

export default function NotificationFilters({
  filter,
  searchQuery,
  options,
  onFilterChange,
  onSearchChange,
}: NotificationFiltersProps) {
  const messages = useMessages();
  const t = messages.notificationsPage;

  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50">
          <Search
            size={18}
            className="shrink-0 text-slate-400"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder={t.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap gap-3">
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
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition ${
                  active
                    ? "bg-slate-950 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {option.label}

                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active
                      ? "bg-white/15 text-white"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}