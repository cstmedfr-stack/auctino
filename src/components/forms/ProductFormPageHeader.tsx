"use client";

import Link from "next/link";
import {
  ArrowLeft,
  PackagePlus,
  PencilLine,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type ProductFormPageHeaderProps = {
  mode: "create" | "edit";
};

export default function ProductFormPageHeader({
  mode,
}: ProductFormPageHeaderProps) {
  const messages = useMessages();
  const t = messages.productFormPage;

  const isEdit = mode === "edit";

  return (
    <div className="mb-8">
      {isEdit && (
        <Link
          href="/my-products"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={17} />
          {t.backToMyProducts}
        </Link>
      )}

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl shadow-slate-300/40">
        <div className="flex items-start gap-4">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
            {isEdit ? (
              <PencilLine size={24} />
            ) : (
              <PackagePlus size={24} />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-300">
              {isEdit
                ? t.editEyebrow
                : t.addEyebrow}
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {isEdit
                ? t.editTitle
                : t.addTitle}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              {isEdit
                ? t.editDescription
                : t.addDescription}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}