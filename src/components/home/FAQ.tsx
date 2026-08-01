"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";
import { SectionHeader } from "./SectionHeader";

export function FAQ() {
  const messages = useMessages();
  const t = messages.home.faq;

  const [openIndex, setOpenIndex] =
    useState<number | null>(0);

  return (
    <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeader
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />

        <div className="mt-12 space-y-3">
          {t.items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(
                      isOpen ? null : index
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <HelpCircle size={20} />
                    </span>

                    <span className="text-base font-semibold text-slate-950">
                      {item.question}
                    </span>
                  </span>

                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-slate-400 transition ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pl-20 text-sm leading-7 text-slate-600">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}