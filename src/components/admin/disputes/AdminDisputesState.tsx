"use client";

import {
  CheckCircle2,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

export default function AdminDisputesEmptyState() {
  const messages = useMessages();
  const t = messages.adminDisputes;

  return (
    <section className="mt-8 rounded-3xl border bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700">
        <CheckCircle2 size={28} />
      </div>

      <p className="text-2xl font-black text-slate-950">
        {t.emptyTitle}
      </p>

      <p className="mt-2 text-slate-500">
        {t.emptyDescription}
      </p>
    </section>
  );
}