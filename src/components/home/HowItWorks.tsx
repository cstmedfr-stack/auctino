"use client";

import {
  CheckCircle2,
  Gavel,
  PackagePlus,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";
import { SectionHeader } from "./SectionHeader";

const icons = [
  PackagePlus,
  Gavel,
  CheckCircle2,
];

export function HowItWorks() {
  const messages = useMessages();
  const t = messages.home.howItWorks;

  return (
    <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {t.steps.map((step, index) => {
            const Icon = icons[index] ?? CheckCircle2;

            return (
              <div
                key={step.title}
                className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Icon size={22} />
                  </div>

                  <span className="text-4xl font-semibold text-slate-100">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}