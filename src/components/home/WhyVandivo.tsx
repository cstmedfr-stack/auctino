"use client";

import {
  BadgeCheck,
  Globe2,
  MessageCircle,
  Timer,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";
import { SectionHeader } from "./SectionHeader";

const icons = [
  Timer,
  MessageCircle,
  BadgeCheck,
  Globe2,
];

export function WhyVandivo() {
  const messages = useMessages();
  const t = messages.home.whyVandivo;

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <SectionHeader
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
          align="left"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {t.items.map((item, index) => {
            const Icon = icons[index] ?? BadgeCheck;

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon size={22} />
                </div>

                <h3 className="text-lg font-semibold text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
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