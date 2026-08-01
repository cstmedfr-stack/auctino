"use client";

import { Search } from "lucide-react";

import { useMessages } from "@/i18n/useMessages";
import type { AdminUserFilter } from "@/utils/adminUsers";

type AdminUsersToolbarProps = {
  search: string;
  filter: AdminUserFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (
    filter: AdminUserFilter
  ) => void;
};

export default function AdminUsersToolbar({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: AdminUsersToolbarProps) {
  const messages = useMessages();
  const t = messages.adminUsers;

  const filters: {
    value: AdminUserFilter;
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
      value: "suspended",
      label: t.filters.suspended,
    },
    {
      value: "admin",
      label: t.filters.admin,
    },
  ];

  return (
    <section className="mt-8 rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative w-full lg:max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value
              )
            }
            placeholder={t.searchPlaceholder}
            className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-slate-950"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                onFilterChange(item.value)
              }
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                filter === item.value
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}