"use client";

import { useState } from "react";

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
  const [durationDays, setDurationDays] =
    useState("7");

  async function handleRelist() {
    const confirmed = window.confirm(
      `Vrei să relistezi produsul pentru ${durationDays} zile?`
    );

    if (!confirmed) {
      return;
    }

    await onRelist(
      productId,
      Number(durationDays)
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="font-bold text-amber-900">
        🔁 Relistează produsul
      </p>

      <p className="mt-1 text-sm text-amber-800">
        Licitația a expirat fără oferte. Alege
        o nouă durată.
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
          <option value="1">1 zi</option>
          <option value="3">3 zile</option>
          <option value="5">5 zile</option>
          <option value="7">7 zile</option>
          <option value="10">10 zile</option>
        </select>

        <button
          type="button"
          onClick={() => void handleRelist()}
          disabled={disabled}
          className="rounded-xl bg-amber-700 px-5 py-3 font-bold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {disabled
            ? "Se relistează..."
            : "Relistează"}
        </button>
      </div>
    </div>
  );
}