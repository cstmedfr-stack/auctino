"use client";

import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  Clock3,
  Gavel,
  ShieldAlert,
  Trophy,
  TrendingUp,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";
import type { BidFilter } from "@/utils/myBids";

type MyBidsStatsProps = {
  activeFilter: BidFilter;
  statistics: Record<BidFilter, number>;
  onFilterChange: (filter: BidFilter) => void;
};

type StatItem = {
  key: BidFilter;
  label: string;
  value: number;
  icon: LucideIcon;
};

export default function MyBidsStats({
  activeFilter,
  statistics,
  onFilterChange,
}: MyBidsStatsProps) {
  const messages = useMessages();
  const t = messages.myBidsPage.stats;

  const items: StatItem[] = [
    {
      key: "all",
      label: t.all,
      value: statistics.all,
      icon: Gavel,
    },
    {
      key: "active",
      label: t.active,
      value: statistics.active,
      icon: Clock3,
    },
    {
      key: "leading",
      label: t.leading,
      value: statistics.leading,
      icon: TrendingUp,
    },
    {
      key: "outbid",
      label: t.outbid,
      value: statistics.outbid,
      icon: ShieldAlert,
    },
    {
      key: "won",
      label: t.won,
      value: statistics.won,
      icon: Trophy,
    },
    {
      key: "closed",
      label: t.closed,
      value: statistics.closed,
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          activeFilter === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() =>
              onFilterChange(item.key)
            }
            className={`rounded-3xl border p-5 text-left transition ${
              active
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"
            }`}
          >
            <Icon
              size={20}
              className={
                active
                  ? "text-white"
                  : "text-indigo-600"
              }
            />

            <p className="mt-3 text-sm font-semibold opacity-80">
              {item.label}
            </p>

            <p className="mt-2 text-3xl font-black">
              {item.value}
            </p>
          </button>
        );
      })}
    </section>
  );
}