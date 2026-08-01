"use client";

import {
  Gavel,
  Package,
  Star,
  Trophy,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type StatisticsCardProps = {
  activeProducts: number;
  soldProducts: number;
  wonAuctions: number;
  rating: number;
};

export default function StatisticsCard({
  activeProducts,
  soldProducts,
  wonAuctions,
  rating,
}: StatisticsCardProps) {
  const messages = useMessages();
  const t = messages.publicProfile;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-slate-950">
        {t.statisticsTitle}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <StatisticItem
          icon={<Package size={20} />}
          value={activeProducts}
          label={t.activeProducts}
        />

        <StatisticItem
          icon={<Trophy size={20} />}
          value={soldProducts}
          label={t.soldProducts}
        />

        <StatisticItem
          icon={<Gavel size={20} />}
          value={wonAuctions}
          label={t.wonAuctions}
        />

        <StatisticItem
          icon={<Star size={20} />}
          value={(rating ?? 0).toFixed(1)}
          label={t.rating}
        />
      </div>
    </section>
  );
}

function StatisticItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600">
        {icon}
      </div>

      <p className="text-2xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}