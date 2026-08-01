"use client";

import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  Clock3,
  Inbox,
  ReceiptText,
  Trophy,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";
import type { ReceivedBidFilter } from "@/utils/receivedBids";

type ReceivedBidsStatsProps = {
  activeFilter: ReceivedBidFilter;
  statistics: Record<ReceivedBidFilter, number>;
  onFilterChange: (
    filter: ReceivedBidFilter
  ) => void;
};

type StatItem = {
  key: ReceivedBidFilter;
  label: string;
  value: number;
  icon: LucideIcon;
};

export default function ReceivedBidsStats({
  activeFilter,
  statistics,
  onFilterChange,
}: ReceivedBidsStatsProps) {
  const messages = useMessages();
  const t = messages.receivedBidsPage.stats;

  const items: StatItem[] = [
    {
      key: "all",
      label: t.all,
      value: statistics.all,
      icon: Inbox,
    },
    {
      key: "active",
      label: t.active,
      value: statistics.active,
      icon: Clock3,
    },
    {
      key: "ended",
      label: t.ended,
      value: statistics.ended,
      icon: Trophy,
    },
    {
      key: "transaction",
      label: t.transaction,
      value: statistics.transaction,
      icon: ReceiptText,
    },
    {
      key: "sold",
      label: t.sold,
      value: statistics.sold,
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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