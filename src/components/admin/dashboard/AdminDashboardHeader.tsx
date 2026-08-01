"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

export default function AdminDashboardHeader() {
  const messages = useMessages();
  const t = messages.adminDashboard;

  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft size={17} />
        {t.backHome}
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
      </section>
    </>
  );
}