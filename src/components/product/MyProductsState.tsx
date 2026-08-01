"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Loader2,
  PackagePlus,
  PackageSearch,
  RefreshCcw,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type MyProductsStateProps =
  | {
      type: "loading";
    }
  | {
      type: "empty";
    }
  | {
      type: "error";
      message: string;
      onRetry: () => void;
    };

export default function MyProductsState(
  props: MyProductsStateProps
) {
  const messages = useMessages();
  const t = messages.myProducts;

  if (props.type === "loading") {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Loader2
            size={28}
            className="animate-spin"
          />
        </div>

        <h2 className="text-xl font-bold text-slate-950">
          {t.loadingTitle}
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          {t.loadingDescription}
        </p>
      </div>
    );
  }

  if (props.type === "empty") {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <PackageSearch size={28} />
        </div>

        <h2 className="text-xl font-bold text-slate-950">
          {t.emptyTitle}
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          {t.emptyDescription}
        </p>

        <Link
          href="/add-product"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          <PackagePlus size={18} />
          {t.addFirstProduct}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-700">
        <AlertTriangle size={28} />
      </div>

      <h2 className="text-xl font-bold text-red-900">
        {t.errorTitle}
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-red-700">
        {props.message}
      </p>

      <button
        type="button"
        onClick={props.onRetry}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-800"
      >
        <RefreshCcw size={18} />
        {t.retry}
      </button>
    </div>
  );
}