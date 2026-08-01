"use client";

import Image from "next/image";
import Link from "next/link";

import { useLocale } from "@/i18n/LocaleProvider";
import { useMessages } from "@/i18n/useMessages";
import { formatLocalizedDateTime } from "@/i18n/format";
import type { AdminDispute } from "@/types/transaction";
import { formatPrice } from "@/utils/formatPrice";
import {
  getDisputeAuthor,
  ResolutionDecision,
} from "@/utils/adminDisputes";

type AdminDisputeCardProps = {
  dispute: AdminDispute;
  isSelected: boolean;
  decision: ResolutionDecision;
  reason: string;
  submitting: boolean;
  actionError: string;
  onOpen: (disputeId: string) => void;
  onClose: () => void;
  onDecisionChange: (
    decision: ResolutionDecision
  ) => void;
  onReasonChange: (value: string) => void;
  onResolve: (dispute: AdminDispute) => void;
};

export default function AdminDisputeCard({
  dispute,
  isSelected,
  decision,
  reason,
  submitting,
  actionError,
  onOpen,
  onClose,
  onDecisionChange,
  onReasonChange,
  onResolve,
}: AdminDisputeCardProps) {
  const messages = useMessages();
  const { locale } = useLocale();
  const t = messages.adminDisputes.card;

  const disputeAuthor = getDisputeAuthor(
    dispute,
    {
      sellerAuthor: t.sellerAuthor,
      buyerAuthor: t.buyerAuthor,
      unknownAuthor: t.unknownAuthor,
    }
  );

  return (
    <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <div className="relative min-h-64 bg-slate-100">
          {dispute.product_image_url ? (
            <Image
              src={dispute.product_image_url}
              alt={dispute.product_title}
              fill
              sizes="(max-width: 1024px) 100vw, 280px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center text-slate-400">
              {t.noImage}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-amber-600">
                {t.openDispute}
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {dispute.product_title}
              </h2>
            </div>

            <div className="rounded-2xl bg-slate-950 px-5 py-3 text-white">
              <p className="text-xs font-semibold text-slate-300">
                {t.finalPrice}
              </p>

              <p className="text-xl font-black">
                {dispute.final_price === null ||
                dispute.final_price === undefined
                  ? "-"
                  : formatPrice(
                      Number(dispute.final_price)
                    )}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <InfoBox
              label={t.seller}
              value={dispute.seller_name}
            />

            <InfoBox
              label={t.buyer}
              value={dispute.buyer_name}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-bold text-amber-950">
              {t.disputeReason}
            </p>

            <p className="mt-2 whitespace-pre-wrap text-amber-900">
              {dispute.dispute_reason ||
                t.fallbackReason}
            </p>

            <div className="mt-4 border-t border-amber-200 pt-4 text-sm text-amber-800">
              <p>
                {t.openedBy}:{" "}
                <strong>{disputeAuthor}</strong>
              </p>

              <p className="mt-1">
                {t.date}:{" "}
                <strong>
                  {dispute.disputed_at
                    ? formatLocalizedDateTime(
                        dispute.disputed_at,
                        locale
                      )
                    : "-"}
                </strong>
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/transactions/${dispute.product_id}`}
              className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-800 transition hover:bg-slate-50"
            >
              {t.viewTransaction}
            </Link>

            {!isSelected && (
              <button
                type="button"
                onClick={() =>
                  onOpen(dispute.id)
                }
                className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-indigo-700"
              >
                {t.resolveDispute}
              </button>
            )}
          </div>

          {isSelected && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-black text-slate-950">
                {t.decisionTitle}
              </h3>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <DecisionButton
                  active={decision === "completed"}
                  tone="green"
                  title={t.completeTitle}
                  description={t.completeDescription}
                  onClick={() =>
                    onDecisionChange("completed")
                  }
                />

                <DecisionButton
                  active={decision === "cancelled"}
                  tone="red"
                  title={t.cancelTitle}
                  description={t.cancelDescription}
                  onClick={() =>
                    onDecisionChange("cancelled")
                  }
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor={`resolution-reason-${dispute.id}`}
                  className="font-bold text-slate-900"
                >
                  {t.resolutionReason}
                </label>

                <textarea
                  id={`resolution-reason-${dispute.id}`}
                  value={reason}
                  onChange={(event) =>
                    onReasonChange(
                      event.target.value
                    )
                  }
                  rows={5}
                  minLength={5}
                  maxLength={2000}
                  placeholder={
                    t.resolutionPlaceholder
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
                />

                <p className="mt-1 text-right text-xs text-slate-500">
                  {reason.length}/2000
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
                    onResolve(dispute)
                  }
                  disabled={submitting}
                  className={`rounded-2xl px-5 py-3 font-bold text-white disabled:opacity-60 ${
                    decision === "completed"
                      ? "bg-green-700 hover:bg-green-800"
                      : "bg-red-700 hover:bg-red-800"
                  }`}
                >
                  {submitting
                    ? t.saving
                    : decision === "completed"
                      ? t.confirmComplete
                      : t.confirmCancel}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-60"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-900">
        {value || "-"}
      </p>
    </div>
  );
}

function DecisionButton({
  active,
  tone,
  title,
  description,
  onClick,
}: {
  active: boolean;
  tone: "green" | "red";
  title: string;
  description: string;
  onClick: () => void;
}) {
  const activeClass =
    tone === "green"
      ? "border-green-600 bg-green-50"
      : "border-red-600 bg-red-50";

  const titleClass =
    tone === "green"
      ? "text-green-800"
      : "text-red-800";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left ${
        active
          ? activeClass
          : "border-slate-200 bg-white"
      }`}
    >
      <p className={`font-black ${titleClass}`}>
        {title}
      </p>

      <p className="mt-1 text-sm text-slate-600">
        {description}
      </p>
    </button>
  );
}