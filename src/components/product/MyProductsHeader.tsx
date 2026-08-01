"use client";

import Link from "next/link";
import {
  ArrowRight,
  PackagePlus,
  Store,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type MyProductsHeaderProps = {
  productsCount: number;
};

export default function MyProductsHeader({
  productsCount,
}: MyProductsHeaderProps) {
  const messages = useMessages();
  const t = messages.myProducts;

  const countLabel = t.countLabel.replace(
    "{count}",
    String(productsCount)
  );

  return (
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl shadow-slate-300/40">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-indigo-100">
            <Store size={16} />
            {t.eyebrow}
          </div>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t.title}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            {t.description}
          </p>

          <p className="mt-5 text-sm font-semibold text-indigo-200">
            {countLabel}
          </p>
        </div>

        <Link
          href="/add-product"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-indigo-50"
        >
          <PackagePlus size={18} />
          {t.addProduct}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}