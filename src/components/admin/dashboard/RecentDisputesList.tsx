"use client";

import Link from "next/link";

import { useLocale } from "@/i18n/LocaleProvider";
import { useMessages } from "@/i18n/useMessages";
import { formatLocalizedDateTime } from "@/i18n/format";
import type { AdminDispute } from "@/types/transaction";

type RecentDisputesListProps = {
  disputes: AdminDispute[];
};

export default function RecentDisputesList({
  disputes,
}: RecentDisputesListProps) {
  const messages = useMessages();
  const { locale } = useLocale();
  const t = messages.adminDashboard.recentDisputes;

  return (
    <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            {t.title}
          </h2>

          <p className="mt-1 text-slate-500">
            {t.description}
          </p>
        </div>

        <Link
          href="/admin/disputes"
          className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-800 transition hover:bg-slate-50"
        >
          {t.viewAll}
        </Link>
      </div>

      {disputes.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-green-50 p-6 text-center">
          <p className="font-bold text-green-800">
            {t.empty}
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-slate-100">
          {disputes.slice(0, 3).map((dispute) => (
            <Link
              key={dispute.id}
              href="/admin/disputes"
              className="flex flex-col gap-3 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-black text-slate-950">
                  {dispute.product_title}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {t.seller}: {dispute.seller_name} ·{" "}
                  {t.buyer}: {dispute.buyer_name}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-sm font-bold text-amber-700">
                  {t.status}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {dispute.disputed_at
                    ? formatLocalizedDateTime(
                        dispute.disputed_at,
                        locale
                      )
                    : "-"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}