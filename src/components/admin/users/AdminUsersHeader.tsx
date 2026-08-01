"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type AdminUsersHeaderProps = {
  total: number;
  suspended: number;
  admins: number;
};

export default function AdminUsersHeader({
  total,
  suspended,
  admins,
}: AdminUsersHeaderProps) {
  const messages = useMessages();
  const t = messages.adminUsers;

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft size={17} />
        {t.backToAdmin}
      </Link>

      <section className="mt-6 rounded-3xl bg-slate-950 p-8 text-white">
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-200">
          <ShieldCheck size={17} />
          {t.eyebrow}
        </p>

        <h1 className="mt-2 text-4xl font-black">
          {t.title}
        </h1>

        <p className="mt-3 max-w-2xl text-slate-300">
          {t.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Metric
            label={t.totalAccounts}
            value={total}
          />

          <Metric
            label={t.suspendedAccounts}
            value={suspended}
          />

          <Metric
            label={t.adminAccounts}
            value={admins}
          />
        </div>
      </section>
    </>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white/10 px-5 py-4">
      <p className="text-sm text-slate-300">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}