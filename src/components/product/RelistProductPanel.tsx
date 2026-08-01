"use client";

import { useState } from "react";
import { RefreshCcw } from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type RelistProductPanelProps = {
  productId: string;
  disabled?: boolean;
  onRelist: (
    productId: string,
    durationDays: number
  ) => Promise<void> | void;
};

export default function RelistProductPanel({
  productId,
  disabled = false,
  onRelist,
}: RelistProductPanelProps) {
  const messages = useMessages();
  const t = messages.relistProductPanel;

  const [durationDays, setDurationDays] =
    useState("7");

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  async function handleRelist() {
    await onRelist(productId, Number(durationDays));
    setConfirmOpen(false);
  }

  const durationLabel =
    durationDays === "1"
      ? t.daysSingular
      : t.daysPlural.replace(
          "{days}",
          durationDays
        );

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="inline-flex items-center gap-2 font-bold text-amber-900">
        <RefreshCcw size={18} />
        {t.title}
      </p>

      <p className="mt-1 text-sm leading-6 text-amber-800">
        {t.description}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <select
          value={durationDays}
          onChange={(event) =>
            setDurationDays(event.target.value)
          }
          disabled={disabled}
          className="rounded-xl border border-amber-300 bg-white px-4 py-3 font-semibold text-slate-700 disabled:opacity-60"
        >
          <option value="1">
            {t.daysSingular}
          </option>
          <option value="3">
            {t.daysPlural.replace("{days}", "3")}
          </option>
          <option value="5">
            {t.daysPlural.replace("{days}", "5")}
          </option>
          <option value="7">
            {t.daysPlural.replace("{days}", "7")}
          </option>
          <option value="10">
            {t.daysPlural.replace("{days}", "10")}
          </option>
        </select>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={disabled}
          className="rounded-xl bg-amber-700 px-5 py-3 font-bold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {disabled ? t.relisting : t.relist}
        </button>
      </div>

      {confirmOpen && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-white p-4">
          <p className="font-black text-amber-950">
            {t.confirmTitle}
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            {t.confirmDescription.replace(
              "{days}",
              durationLabel
            )}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void handleRelist();
              }}
              disabled={disabled}
              className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-800 disabled:opacity-60"
            >
              {disabled ? t.relisting : t.confirm}
            </button>

            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={disabled}
              className="rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-bold text-amber-800 transition hover:bg-amber-50 disabled:opacity-60"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}