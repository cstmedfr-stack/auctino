"use client";

import {
  BellRing,
  CheckCircle2,
  ReceiptText,
  ShieldAlert,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type TransactionListStatsProps = {
  total: number;
  needsAction: number;
  completed: number;
  disputed: number;
};

export default function TransactionListStats({
  total,
  needsAction,
  completed,
  disputed,
}: TransactionListStatsProps) {
  const messages = useMessages();
  const t = messages.transaction.list;

  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<ReceiptText size={22} />}
        label={t.statsTotal}
        value={total}
        tone="slate"
      />

      <StatCard
        icon={<BellRing size={22} />}
        label={t.statsNeedsAction}
        value={needsAction}
        tone="indigo"
      />

      <StatCard
        icon={<CheckCircle2 size={22} />}
        label={t.statsCompleted}
        value={completed}
        tone="emerald"
      />

      <StatCard
        icon={<ShieldAlert size={22} />}
        label={t.statsDisputed}
        value={disputed}
        tone="amber"
      />
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone:
    | "slate"
    | "indigo"
    | "emerald"
    | "amber";
}) {
  const toneClasses = {
    slate: "bg-slate-100 text-slate-700",
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800",
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black text-slate-950">
        {value}
      </p>
    </article>
  );
}