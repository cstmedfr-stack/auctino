"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Loader2,
} from "lucide-react";

import type {
  AdminProductReport,
  ModerationDecision,
} from "@/types/report";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatLocalizedDateTime } from "@/i18n/format";
import { formatPrice } from "@/utils/formatPrice";

type AdminReportCardProps = {
  report: AdminProductReport;
  isSelected: boolean;
  decision: ModerationDecision;
  resolutionReason: string;
  actionLoading: boolean;
  actionError: string;
  onOpen: (reportId: string) => void;
  onClose: () => void;
  onDecisionChange: (
    decision: ModerationDecision
  ) => void;
  onReasonChange: (value: string) => void;
  onResolve: (
    report: AdminProductReport
  ) => void;
};

export default function AdminReportCard({
  report,
  isSelected,
  decision,
  resolutionReason,
  actionLoading,
  actionError,
  onOpen,
  onClose,
  onDecisionChange,
  onReasonChange,
  onResolve,
}: AdminReportCardProps) {
  const messages = useMessages();
  const { locale } = useLocale();
  const t = messages.adminReports;

  return (
    <article className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="grid lg:grid-cols-[300px_1fr]">
        <div className="relative min-h-72 bg-slate-100">
          {report.product_image_url ? (
            <Image
              src={report.product_image_url}
              alt={report.product_title}
              fill
              sizes="(max-width: 1024px) 100vw, 300px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full min-h-72 items-center justify-center text-slate-400">
              {t.noImage}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-red-600">
                {t.reportedProduct}
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {report.product_title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {t.productStatus}:{" "}
                <strong>
                  {report.product_status ||
                    t.unknownValue}
                </strong>
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 px-5 py-3 text-white">
              <p className="text-xs font-semibold text-slate-300">
                {t.price}
              </p>

              <p className="text-xl font-black">
                {report.product_price === null
                  ? t.unknownValue
                  : formatPrice(
                      Number(
                        report.product_price
                      )
                    )}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                {t.seller}
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {report.seller_name ||
                  t.unknownValue}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                {t.reporter}
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {report.reporter_name ||
                  t.unknownValue}
              </p>

              <p className="mt-1 break-all text-sm text-slate-500">
                {report.reporter_email ||
                  t.reporterEmailUnavailable}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-bold text-red-900">
              {t.reportReason}
            </p>

            <p className="mt-2 whitespace-pre-wrap text-red-800">
              {report.reason}
            </p>

            <p className="mt-4 border-t border-red-200 pt-4 text-sm text-red-700">
              {t.reportedAt}:{" "}
              <strong>
                {report.created_at
                  ? formatLocalizedDateTime(
                      report.created_at,
                      locale
                    )
                  : t.unknownValue}
              </strong>
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/products/${report.product_id}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-800 transition hover:bg-slate-50"
            >
              {t.viewProduct}
              <ExternalLink size={17} />
            </Link>

            <Link
              href={`/users/${report.seller_id}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-800 transition hover:bg-slate-50"
            >
              {t.viewSeller}
              <ExternalLink size={17} />
            </Link>

            {!isSelected && (
              <button
                type="button"
                onClick={() =>
                  onOpen(report.id)
                }
                className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-indigo-700"
              >
                {t.resolveReport}
              </button>
            )}
          </div>

          {isSelected && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-black text-slate-950">
                {t.decisionTitle}
              </h3>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    onDecisionChange(
                      "dismiss"
                    )
                  }
                  className={`rounded-2xl border p-4 text-left ${
                    decision === "dismiss"
                      ? "border-green-600 bg-green-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-black text-green-800">
                    {t.dismissTitle}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {t.dismissDescription}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onDecisionChange("remove")
                  }
                  className={`rounded-2xl border p-4 text-left ${
                    decision === "remove"
                      ? "border-red-600 bg-red-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-black text-red-800">
                    {t.removeTitle}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {t.removeDescription}
                  </p>
                </button>
              </div>

              <div className="mt-5">
                <label
                  htmlFor={`resolution-reason-${report.id}`}
                  className="font-bold text-slate-900"
                >
                  {t.resolutionReason}
                </label>

                <textarea
                  id={`resolution-reason-${report.id}`}
                  value={resolutionReason}
                  onChange={(event) =>
                    onReasonChange(
                      event.target.value
                    )
                  }
                  rows={5}
                  minLength={5}
                  maxLength={1000}
                  placeholder={
                    t.resolutionPlaceholder
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />

                <p className="mt-1 text-right text-xs text-slate-500">
                  {resolutionReason.length}/1000
                </p>
              </div>

              {actionError && (
                <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onResolve(report)
                  }
                  disabled={actionLoading}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-white disabled:opacity-60 ${
                    decision === "dismiss"
                      ? "bg-green-700"
                      : "bg-red-700"
                  }`}
                >
                  {actionLoading && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {actionLoading
                    ? t.saving
                    : decision === "dismiss"
                      ? t.confirmDismiss
                      : t.confirmRemove}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={actionLoading}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-60"
                >
                  {t.cancel}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}