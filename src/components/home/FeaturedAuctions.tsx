"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { currentMarket } from "@/config/market";
import {
  ArrowRight,
  Clock3,
  Flame,
  ImageIcon,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatPrice } from "@/utils/formatPrice";
import { formatDateTime } from "@/utils/formatDateTime";
import { SectionHeader } from "./SectionHeader";

type FeaturedProduct = {
  id: string;
  title: string;
  category: string | null;
  current_price: number | null;
  starting_price: number;
  bid_count: number | null;
  auction_end: string | null;
  image_url: string | null;
};

export function FeaturedAuctions() {
  const messages = useMessages();
  const t = messages.home.featuredAuctions;
  const { locale } = useLocale();

  const [products, setProducts] = useState<
    FeaturedProduct[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);

      const { data, error } =
        await supabase
          .from("products")
          .select(
            "id, title, category, current_price, starting_price, bid_count, auction_end, image_url"
          )
          .eq("status", "active")
          .eq("market_code", currentMarket.code)
          .order("bid_count", {
            ascending: false,
          })
          .limit(4);

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Featured auctions load failed:",
          error.message
        );

        setProducts([]);
        setIsLoading(false);
        return;
      }

      setProducts(data || []);
      setIsLoading(false);
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            eyebrow={t.eyebrow}
            title={t.title}
            description={t.description}
            align="left"
          />

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
          >
            {t.viewAll}
            <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[430px] animate-pulse rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="h-56 rounded-3xl bg-slate-100" />
                <div className="mt-5 h-4 w-2/3 rounded bg-slate-100" />
                <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                <div className="mt-8 h-20 rounded-2xl bg-slate-100" />
                <div className="mt-5 h-11 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Flame size={24} />
            </div>

            <h3 className="text-xl font-semibold text-slate-950">
              {t.emptyTitle}
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              {t.emptyDescription}
            </p>

            <Link
              href="/add-product"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              {t.sellProduct}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
           {products.map((product, index) => {
              const price =
                product.current_price ??
                product.starting_price ??
                0;

              return (
                <article
                  key={product.id}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
                >
                 <div className="relative flex h-48 items-center justify-center overflow-hidden bg-slate-100 sm:h-56">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-sm text-slate-400">
                        <ImageIcon size={28} />
                        {t.noImage}
                      </div>
                    )}

                    <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      <Flame size={13} />
                      {t.liveLabel}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {product.category || t.noCategory}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                        <Flame size={13} />
                        {product.bid_count ?? 0} {t.bids}
                      </span>
                    </div>
                    <p className="mb-3 text-xs font-medium leading-5 text-slate-500">
                        {t.auctionCardTrust}
                      </p>

                    <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-950">
                      {product.title}
                    </h3>

                    <div className="mt-auto pt-5">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-500">
                              {t.currentOffer}
                            </p>

                            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                              {formatPrice(price)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="flex items-center justify-end gap-1 text-xs font-medium text-slate-500">
                              <Clock3 size={14} />
                              {t.endsAt}
                            </p>

                            <p className="mt-1 max-w-28 text-sm font-semibold text-indigo-600">
                              {product.auction_end
                                ? formatDateTime(
                                    product.auction_end,
                                    locale
                                  )
                                : t.unspecifiedEnd}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/products/${product.id}`}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        {t.viewAuction}
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}