"use client";

import type { FormEvent } from "react";
import {
  Flag,
  Send,
  X,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type ProductReportBoxProps = {
  showReportForm: boolean;
  reportReason: string;
  reportLoading: boolean;
  reportError: string;
  reportSuccess: string;

  onOpen: () => void;
  onClose: () => void;
  onReasonChange: (value: string) => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
};

export default function ProductReportBox({
  showReportForm,
  reportReason,
  reportLoading,
  reportError,
  reportSuccess,
  onOpen,
  onClose,
  onReasonChange,
  onSubmit,
}: ProductReportBoxProps) {
  const messages = useMessages();
  const t = messages.productPage;

  return (
    <section className="mt-4 rounded-2xl border border-red-100 bg-red-50/50 p-4">
      {reportSuccess ? (
        <div className="rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
          {reportSuccess}
        </div>
      ) : !showReportForm ? (
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-700 transition hover:bg-red-50"
        >
          <Flag size={18} />
          {t.reportProduct}
        </button>
      ) : (
        <form
          onSubmit={onSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="report-reason"
              className="font-bold text-slate-950"
            >
              {t.reportReasonLabel}
            </label>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {t.reportReasonDescription}
            </p>

            <textarea
              id="report-reason"
              value={reportReason}
              onChange={(event) =>
                onReasonChange(
                  event.target.value
                )
              }
              rows={4}
              minLength={5}
              maxLength={1000}
              required
              placeholder={
                t.reportReasonPlaceholder
              }
              className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
            />

            <p className="mt-1 text-right text-xs text-slate-500">
              {reportReason.length}/1000
            </p>
          </div>

          {reportError && (
            <div className="rounded-xl bg-red-100 p-3 text-sm text-red-700">
              {reportError}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={reportLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={17} />
              {reportLoading
                ? t.reportSubmitting
                : t.reportSubmit}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={reportLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={17} />
              {t.reportCancel}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}