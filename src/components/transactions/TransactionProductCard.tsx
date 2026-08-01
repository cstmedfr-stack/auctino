"use client";

import { Package } from "lucide-react";

import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatLocalizedPrice } from "@/i18n/format";

type TransactionProductDetails = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
};

type TransactionProductCardProps = {
  product: TransactionProductDetails | null;
  finalPrice: number;
};

export default function TransactionProductCard({
  product,
  finalPrice,
}: TransactionProductCardProps) {
  const messages = useMessages();
  const { locale } = useLocale();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">
        {messages.transactionDetails.product}
      </h2>

      {product?.image_url ? (
        <img
          src={product.image_url}
          alt={
            product.title ||
            messages.transactionDetails.unavailableProduct
          }
          className="mt-4 h-80 w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="mt-4 flex h-80 flex-col items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Package size={42} />

          <p className="mt-3 text-sm font-semibold">
            {messages.productCard.noImage}
          </p>
        </div>
      )}

      <h3 className="mt-5 text-2xl font-black text-slate-950">
        {product?.title ||
          messages.transactionDetails.unavailableProduct}
      </h3>

      {product?.description && (
        <p className="mt-3 text-slate-600">
          {product.description}
        </p>
      )}

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-500">
          {messages.transactionDetails.finalPrice}
        </p>

        <p className="mt-1 text-4xl font-black text-slate-950">
          {formatLocalizedPrice(
            finalPrice,
            locale,
            "RON"
          )}
        </p>
      </div>
    </section>
  );
}