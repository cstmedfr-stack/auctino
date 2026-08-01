"use client";

import { SlidersHorizontal } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type FilterSidebarProps = {
  children: React.ReactNode;
};

export default function FilterSidebar({
  children,
}: FilterSidebarProps) {
  const messages = useMessages();
  const t = messages.marketplace;

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <SlidersHorizontal size={21} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {t.filtersTitle}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {t.filtersDescription}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {children}
        </div>
      </div>
    </aside>
  );
}