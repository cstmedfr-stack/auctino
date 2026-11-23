
"use client";

import { Package } from "lucide-react";

import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatLocalizedPrice } from "@/i18n/format";
import {
  MARKET_CONFIG,
  type MarketCode,
} from "@/config/market";

type TransactionProductDetails = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  market_code: MarketCode;
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

  const currency = product
    ? MARKET_CONFIG[product.market_code]?.currency
    : null;

  return (
    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
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
          className="mt-4 h-64 w-full rounded-2xl object-contain bg-slate-100 sm:h-80"
        />
      ) : (
        <div className="mt-4 flex h-64 flex-col items-center justify-center rounded-2xl bg-slate-100 text-slate-500 sm:h-80">
          <Package size={42} />

          <p className="mt-3 text-sm font-semibold">
            {messages.productCard.noImage}
          </p>
        </div>
      )}

      <h3 className="mt-5 break-words text-xl font-black text-slate-950 sm:text-2xl">
        {product?.title ||
          messages.transactionDetails.unavailableProduct}
      </h3>

      {product?.description && (
        <p className="mt-3 break-words text-slate-600">
          {product.description}
        </p>
      )}

      <div className="mt-6 min-w-0 rounded-2xl bg-slate-50 p-4 sm:p-5">
        <p className="text-sm font-semibold text-slate-500">
          {messages.transactionDetails.finalPrice}
        </p>

        <p className="mt-1 break-words text-3xl font-black text-slate-950 sm:text-4xl">
          {currency
            ? formatLocalizedPrice(
                finalPrice,
                locale,
                currency
              )
            : "—"}
        </p>
      </div>
    </section>
  );
}
