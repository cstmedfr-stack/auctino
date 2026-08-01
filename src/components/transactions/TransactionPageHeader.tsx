"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type TransactionPageHeaderProps = {
  productId: string;
};

export default function TransactionPageHeader({
  productId,
}: TransactionPageHeaderProps) {
  const messages = useMessages();

  return (
    <>
      <Link
        href={
          productId
            ? `/products/${productId}`
            : "/dashboard"
        }
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft size={16} />
        {
          messages.transactionDetails.navigation
            .backToProduct
        }
      </Link>

      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
          {
            messages.transactionDetails
              .pageLabel
          }
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          {
            messages.transactionDetails
              .pageTitle
          }
        </h1>

        <p className="mt-2 leading-6 text-slate-600">
          {
            messages.transactionDetails
              .pageDescription
          }
        </p>
      </div>
    </>
  );
}