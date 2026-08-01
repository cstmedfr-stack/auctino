"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  Loader2,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type ProductFormPageStateProps =
  | {
      type: "loading";
    }
  | {
      type: "error";
      title: string;
      message: string;
      productId?: string;
    };

export default function ProductFormPageState(
  props: ProductFormPageStateProps
) {
  const messages = useMessages();
  const t = messages.productFormPage;

  if (props.type === "loading") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Loader2
              size={28}
              className="animate-spin"
            />
          </div>

          <h1 className="text-xl font-bold text-slate-950">
            {t.checkingProduct}
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            {t.checkingProductDescription}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700">
          <AlertTriangle size={28} />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          {props.title}
        </h1>

        {props.message && (
          <p className="mt-3 leading-7 text-slate-600">
            {props.message}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/my-products"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft size={18} />
            {t.backToMyProducts}
          </Link>

          {props.productId && (
            <Link
              href={`/products/${props.productId}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Eye size={18} />
              {t.viewProduct}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}