"use client";

import Link from "next/link";
import {
  ArrowLeft,
  PackageSearch,
  Loader2,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type ProductPageStateProps = {
  type: "loading" | "not-found";
  title?: string;
  description?: string;
};

export default function ProductPageState({
  type,
  title,
  description,
}: ProductPageStateProps) {
  const messages = useMessages();
  const t = messages.productPage;

  if (type === "loading") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Loader2
                size={28}
                className="animate-spin"
              />
            </div>

            <p className="font-semibold text-slate-700">
              {t.loadingProduct}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <PackageSearch size={28} />
        </div>

        <h1 className="text-2xl font-bold text-slate-950">
          {title}
        </h1>

        {description && (
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-red-600">
            {description}
          </p>
        )}

        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft size={18} />
          {t.backToAuctions}
        </Link>
      </div>
    </main>
  );
}