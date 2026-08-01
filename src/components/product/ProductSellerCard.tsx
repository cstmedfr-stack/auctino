"use client";

import Link from "next/link";
import {
  Award,
  MessageCircle,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type Seller = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  rating?: number | null;
};

type SellerBadge = {
  title: string;
};

type ProductSellerCardProps = {
  seller: Seller;
  trustScore: number;
  badges: SellerBadge[];
  isSeller: boolean;
  onContactSeller: () => void;
};

export default function ProductSellerCard({
  seller,
  trustScore,
  badges,
  isSeller,
  onContactSeller,
}: ProductSellerCardProps) {
  const messages = useMessages();
  const t = messages.productPage;

  const initials =
    seller.full_name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const firstBadge = badges[0];

  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.soldBy}
        </p>

        <Link
          href={`/users/${seller.id}`}
          className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          {t.viewProfile}
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-lg font-bold text-indigo-600">
          {seller.avatar_url ? (
            <img
              src={seller.avatar_url}
              alt={
                seller.full_name ||
                t.sellerAvatar
              }
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-950">
            {seller.full_name ||
              t.defaultSellerName}
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              <ShieldCheck size={15} />
              {t.trust} {trustScore}/100
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 font-semibold text-yellow-700">
              <Star size={15} />
              {t.rating} {seller.rating ?? 0}
            </span>
          </div>
        </div>
      </div>

      {firstBadge && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <Award size={17} />
          <span className="sr-only">
            {t.sellerBadge}
          </span>
          {firstBadge.title}
        </div>
      )}
    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
  <div className="mb-3 flex items-center justify-between gap-3">
    <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-800">
      <ShieldCheck size={17} />
      {t.trust} {trustScore}/100
    </p>

    <span className="text-xs font-semibold text-slate-500">
      {t.rating} {seller.rating ?? 0}
    </span>
  </div>

  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
    <div
      className="h-full rounded-full bg-indigo-600"
      style={{
        width: `${Math.max(
          0,
          Math.min(trustScore, 100)
        )}%`,
      }}
    />
  </div>

  <p className="mt-3 text-sm leading-6 text-slate-600">
    {t.sellerTrustDescription}
  </p>
</div>
      {isSeller ? (
        <button
          type="button"
          disabled
          className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-400 opacity-60"
        >
          <UserRound size={18} />
          {t.ownProductContactDisabled}
        </button>
      ) : (
        <button
          type="button"
          onClick={onContactSeller}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <MessageCircle size={18} />
          {t.contactSeller}
        </button>
      )}
    </section>
  );
}