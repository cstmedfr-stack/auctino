"use client";

import {
  BadgeCheck,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";
import { SectionHeader } from "./SectionHeader";

const icons = [
  ShieldCheck,
  MessageCircle,
  BadgeCheck,
  LockKeyhole,
];

export function TrustSection() {
  const messages = useMessages();
  const t = messages.home.trust;

  return (
    <section className="border-y border-slate-100 bg-slate-50/70 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {t.items.map((item, index) => {
            const Icon = icons[index] ?? ShieldCheck;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon size={22} />
                </div>

                <h3 className="text-base font-semibold text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}