"use client";

import Link from "next/link";
import {
  Car,
  Gamepad2,
  Gem,
  Home,
  Laptop,
  Shirt,
  ArrowRight,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";
import { SectionHeader } from "./SectionHeader";

const icons = [
  Laptop,
  Shirt,
  Home,
  Car,
  Gamepad2,
  Gem,
];

export function Categories() {
  const messages = useMessages();
  const t = messages.home.categories;

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((category, index) => {
            const Icon = icons[index] ?? Gem;

            return (
              <Link
                key={category.name}
                href={category.href}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <Icon size={22} />
                </div>

                <h3 className="text-lg font-semibold text-slate-950">
                  {category.name}
                </h3>

                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                  {category.description}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                  {t.viewAll}
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}