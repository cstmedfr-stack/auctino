"use client";

import Link from "next/link";
import {
  ExternalLink,
  Pencil,
  ShieldCheck,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type AccountPageHeaderProps = {
  userId?: string;
  mode: "overview" | "edit";
};

export default function AccountPageHeader({
  userId,
  mode,
}: AccountPageHeaderProps) {
  const messages = useMessages();
  const t =
    mode === "overview"
      ? messages.accountProfile.overview
      : messages.accountProfile.edit;

  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
            <ShieldCheck size={17} />
            {t.eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            {t.title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {t.description}
          </p>
        </div>

        {mode === "overview" && (
          <div className="flex flex-wrap gap-3">
            <Link
              href="/account/profile"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              <Pencil size={17} />
              {messages.accountProfile.overview.editProfile}
            </Link>

            {userId && (
              <Link
                href={`/users/${userId}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                {messages.accountProfile.overview.publicProfile}
                <ExternalLink size={17} />
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}