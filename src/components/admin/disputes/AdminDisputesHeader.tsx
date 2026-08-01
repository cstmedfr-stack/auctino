"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type AdminDisputesHeaderProps = {
  count: number;
};

export default function AdminDisputesHeader({
  count,
}: AdminDisputesHeaderProps) {
  const messages = useMessages();
  const t = messages.adminDisputes;

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
          <ShieldAlert size={17} />
          {t.eyebrow}
        </p>

        <h1 className="mt-2 text-4xl font-black">
          {t.title}
        </h1>

        <p className="mt-3 max-w-2xl text-slate-300">
          {t.description}
        </p>

        <div className="mt-6 inline-flex rounded-2xl bg-white/10 px-5 py-4">
          <div>
            <p className="text-sm text-slate-300">
              {t.pendingDisputes}
            </p>

            <p className="mt-1 text-3xl font-black">
              {count}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}