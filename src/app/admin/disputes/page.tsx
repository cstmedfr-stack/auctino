"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  getAdminDisputes,
  resolveTransactionDispute,
} from "@/lib/transactions";

import { AdminDispute } from "@/types/transaction";

type ResolutionDecision = "completed" | "cancelled";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState("");

  const [selectedDisputeId, setSelectedDisputeId] =
    useState<string | null>(null);

  const [decision, setDecision] =
    useState<ResolutionDecision>("completed");

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    void loadDisputes();
  }, []);

  async function loadDisputes() {
    setLoading(true);
    setError("");
    setAccessDenied(false);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Trebuie să fii autentificat.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (profile?.role !== "admin") {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    const { data, error: disputesError } =
      await getAdminDisputes();

    if (disputesError) {
      setError(disputesError.message);
      setLoading(false);
      return;
    }

    setDisputes((data ?? []) as AdminDispute[]);
    setLoading(false);
  }

  function openResolutionForm(disputeId: string) {
    setSelectedDisputeId(disputeId);
    setDecision("completed");
    setReason("");
    setActionError("");
    setSuccessMessage("");
  }

  function closeResolutionForm() {
    if (submitting) return;

    setSelectedDisputeId(null);
    setReason("");
    setActionError("");
  }

  async function handleResolveDispute(
    dispute: AdminDispute
  ) {
    const cleanReason = reason.trim();

    setActionError("");
    setSuccessMessage("");

    if (cleanReason.length < 5) {
      setActionError(
        "Motivul soluției trebuie să conțină minimum 5 caractere."
      );
      return;
    }

    if (cleanReason.length > 2000) {
      setActionError(
        "Motivul soluției nu poate depăși 2000 de caractere."
      );
      return;
    }

    setSubmitting(true);

    const { error: resolveError } =
      await resolveTransactionDispute({
        transactionId: dispute.id,
        decision,
        reason: cleanReason,
      });

    if (resolveError) {
      setActionError(resolveError.message);
      setSubmitting(false);
      return;
    }

    setDisputes((currentDisputes) =>
      currentDisputes.filter(
        (currentDispute) =>
          currentDispute.id !== dispute.id
      )
    );

    setSuccessMessage(
      decision === "completed"
        ? `Disputa pentru „${dispute.product_title}” a fost soluționată, iar tranzacția a fost finalizată.`
        : `Disputa pentru „${dispute.product_title}” a fost soluționată, iar tranzacția a fost anulată.`
    );

    setSelectedDisputeId(null);
    setReason("");
    setSubmitting(false);
  }

  function formatPrice(
    price: number | string | null | undefined
  ) {
    if (price === null || price === undefined) {
      return "-";
    }

    return `${Number(price).toFixed(0)} lei`;
  }

  function formatDate(date: string | null) {
    if (!date) return "-";

    return new Date(date).toLocaleString("ro-RO", {
      timeZone: "Europe/Bucharest",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDisputeAuthor(dispute: AdminDispute) {
    if (dispute.disputed_by === dispute.seller_id) {
      return `Vânzătorul – ${dispute.seller_name}`;
    }

    if (dispute.disputed_by === dispute.buyer_id) {
      return `Cumpărătorul – ${dispute.buyer_name}`;
    }

    return "Utilizator necunoscut";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-600">
            Se încarcă disputele...
          </p>
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase text-red-600">
              Acces interzis
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Nu ai drepturi de administrator
            </h1>

            <p className="mt-3 text-slate-600">
              Această pagină poate fi accesată numai de un
              administrator Vendora.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white"
            >
              Înapoi la pagina principală
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          ← Înapoi
        </Link>

        <section className="mt-6 rounded-3xl bg-slate-950 p-8 text-white">
          <p className="text-sm font-bold uppercase tracking-wide text-orange-400">
            Administrare Vendora
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Dispute deschise
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Verifică motivele raportate de utilizatori și
            decide dacă tranzacția trebuie finalizată sau
            anulată.
          </p>

          <div className="mt-6 inline-flex rounded-2xl bg-white/10 px-5 py-4">
            <div>
              <p className="text-sm text-slate-300">
                Dispute în așteptare
              </p>

              <p className="mt-1 text-3xl font-black">
                {disputes.length}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 rounded-2xl bg-green-50 p-4 font-medium text-green-700">
            {successMessage}
          </div>
        )}

        {disputes.length === 0 ? (
          <section className="mt-8 rounded-3xl border bg-white p-10 text-center shadow-sm">
            <p className="text-2xl font-black text-slate-950">
              Nu există dispute deschise
            </p>

            <p className="mt-2 text-slate-500">
              Toate disputele au fost soluționate.
            </p>
          </section>
        ) : (
          <div className="mt-8 space-y-6">
            {disputes.map((dispute) => {
              const isSelected =
                selectedDisputeId === dispute.id;

              return (
                <section
                  key={dispute.id}
                  className="overflow-hidden rounded-3xl border bg-white shadow-sm"
                >
                  <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
                    <div className="bg-slate-100">
                      {dispute.product_image_url ? (
                        <img
                          src={dispute.product_image_url}
                          alt={dispute.product_title}
                          className="h-full min-h-64 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full min-h-64 items-center justify-center text-slate-400">
                          Fără imagine
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold uppercase text-amber-600">
                            Dispută deschisă
                          </p>

                          <h2 className="mt-1 text-2xl font-black text-slate-950">
                            {dispute.product_title}
                          </h2>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-3 text-white">
                          <p className="text-xs font-semibold text-slate-300">
                            Preț final
                          </p>

                          <p className="text-xl font-black">
                            {formatPrice(dispute.final_price)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-500">
                            Vânzător
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {dispute.seller_name}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-500">
                            Cumpărător
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {dispute.buyer_name}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <p className="font-bold text-amber-950">
                          Motivul disputei
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-amber-900">
                          {dispute.dispute_reason ||
                            "Nu a fost furnizat un motiv."}
                        </p>

                        <div className="mt-4 border-t border-amber-200 pt-4 text-sm text-amber-800">
                          <p>
                            Deschisă de:{" "}
                            <strong>
                              {getDisputeAuthor(dispute)}
                            </strong>
                          </p>

                          <p className="mt-1">
                            Data:{" "}
                            <strong>
                              {formatDate(dispute.disputed_at)}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href={`/transactions/${dispute.product_id}`}
                          className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-800 hover:bg-slate-50"
                        >
                          Vezi tranzacția
                        </Link>

                        {!isSelected && (
                          <button
                            type="button"
                            onClick={() =>
                              openResolutionForm(dispute.id)
                            }
                            className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800"
                          >
                            Soluționează disputa
                          </button>
                        )}
                      </div>

                      {isSelected && (
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <h3 className="text-lg font-black text-slate-950">
                            Decizia administratorului
                          </h3>

                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDecision("completed")
                              }
                              className={`rounded-2xl border p-4 text-left ${
                                decision === "completed"
                                  ? "border-green-600 bg-green-50"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <p className="font-black text-green-800">
                                Finalizează tranzacția
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                Tranzacția devine finalizată,
                                iar produsul este marcat ca vândut.
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDecision("cancelled")
                              }
                              className={`rounded-2xl border p-4 text-left ${
                                decision === "cancelled"
                                  ? "border-red-600 bg-red-50"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <p className="font-black text-red-800">
                                Anulează tranzacția
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                Tranzacția este anulată, iar
                                produsul nu mai este marcat ca vândut.
                              </p>
                            </button>
                          </div>

                          <div className="mt-5">
                            <label
                              htmlFor={`resolution-reason-${dispute.id}`}
                              className="font-bold text-slate-900"
                            >
                              Motivul deciziei
                            </label>

                            <textarea
                              id={`resolution-reason-${dispute.id}`}
                              value={reason}
                              onChange={(event) =>
                                setReason(event.target.value)
                              }
                              rows={5}
                              minLength={5}
                              maxLength={2000}
                              placeholder="Explică decizia luată..."
                              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950"
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
                                void handleResolveDispute(
                                  dispute
                                )
                              }
                              disabled={submitting}
                              className={`rounded-2xl px-5 py-3 font-bold text-white disabled:opacity-60 ${
                                decision === "completed"
                                  ? "bg-green-700"
                                  : "bg-red-700"
                              }`}
                            >
                              {submitting
                                ? "Se salvează..."
                                : decision === "completed"
                                  ? "Confirmă finalizarea"
                                  : "Confirmă anularea"}
                            </button>

                            <button
                              type="button"
                              onClick={closeResolutionForm}
                              disabled={submitting}
                              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-60"
                            >
                              Renunță
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}