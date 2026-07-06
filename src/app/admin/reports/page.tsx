"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  dismissProductReport,
  getAdminProductReports,
  removeReportedProduct,
} from "@/lib/admin";

import { AdminProductReport } from "@/types/product-report";

type ModerationDecision = "dismiss" | "remove";

export default function AdminProductReportsPage() {
  const [reports, setReports] = useState<
    AdminProductReport[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [selectedReportId, setSelectedReportId] =
    useState<string | null>(null);

  const [decision, setDecision] =
    useState<ModerationDecision>("dismiss");

  const [resolutionReason, setResolutionReason] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  useEffect(() => {
    void loadReports();
  }, []);

  async function loadReports() {
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

    const { data: profile, error: profileError } =
      await supabase
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

    const { data, error: reportsError } =
      await getAdminProductReports();

    if (reportsError) {
      setError(reportsError.message);
      setLoading(false);
      return;
    }

    setReports(
      (data ?? []) as AdminProductReport[]
    );

    setLoading(false);
  }

  function openModerationForm(
    reportId: string
  ) {
    setSelectedReportId(reportId);
    setDecision("dismiss");
    setResolutionReason("");
    setActionError("");
    setSuccessMessage("");
  }

  function closeModerationForm() {
    if (actionLoading) return;

    setSelectedReportId(null);
    setResolutionReason("");
    setActionError("");
  }

  async function handleResolveReport(
    report: AdminProductReport
  ) {
    const cleanReason =
      resolutionReason.trim();

    setActionError("");
    setSuccessMessage("");

    if (cleanReason.length < 5) {
      setActionError(
        "Motivul deciziei trebuie să conțină minimum 5 caractere."
      );
      return;
    }

    if (cleanReason.length > 1000) {
      setActionError(
        "Motivul deciziei nu poate depăși 1000 de caractere."
      );
      return;
    }

    setActionLoading(true);

    const result =
      decision === "dismiss"
        ? await dismissProductReport({
            reportId: report.id,
            reason: cleanReason,
          })
        : await removeReportedProduct({
            reportId: report.id,
            reason: cleanReason,
          });

    if (result.error) {
      setActionError(result.error.message);
      setActionLoading(false);
      return;
    }

    /*
     * Dacă produsul este eliminat, toate raportările
     * deschise pentru acel produs sunt închise.
     */
    setReports((currentReports) =>
      decision === "remove"
        ? currentReports.filter(
            (currentReport) =>
              currentReport.product_id !==
              report.product_id
          )
        : currentReports.filter(
            (currentReport) =>
              currentReport.id !== report.id
          )
    );

    setSuccessMessage(
      decision === "dismiss"
        ? `Raportarea pentru „${report.product_title}” a fost respinsă. Produsul rămâne activ.`
        : `Produsul „${report.product_title}” a fost eliminat de pe platformă.`
    );

    setSelectedReportId(null);
    setResolutionReason("");
    setActionLoading(false);
  }

  function formatDate(date: string | null) {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "ro-RO",
      {
        timeZone: "Europe/Bucharest",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function formatPrice(
    price: number | string | null
  ) {
    if (
      price === null ||
      price === undefined
    ) {
      return "-";
    }

    return `${Number(price).toFixed(0)} lei`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-600">
            Se încarcă produsele raportate...
          </p>
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <section className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase text-red-600">
              Acces interzis
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Nu ai drepturi de administrator
            </h1>

            <p className="mt-3 text-slate-600">
              Produsele raportate pot fi
              gestionate numai de administratori.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white"
            >
              Înapoi la pagina principală
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          ← Înapoi la administrare
        </Link>

        <section className="mt-6 rounded-3xl bg-slate-950 p-8 text-white">
          <p className="text-sm font-bold uppercase tracking-wide text-orange-400">
            Vendora Admin
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Produse raportate
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Verifică raportările trimise de
            utilizatori și decide dacă produsul
            rămâne activ sau este eliminat.
          </p>

          <div className="mt-6 inline-flex rounded-2xl bg-white/10 px-5 py-4">
            <div>
              <p className="text-sm text-slate-300">
                Raportări deschise
              </p>

              <p className="mt-1 text-3xl font-black">
                {reports.length}
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

        {reports.length === 0 ? (
          <section className="mt-8 rounded-3xl border bg-white p-10 text-center shadow-sm">
            <p className="text-2xl font-black text-slate-950">
              Nu există produse raportate
            </p>

            <p className="mt-2 text-slate-500">
              Nu există raportări care așteaptă
              verificarea administratorului.
            </p>
          </section>
        ) : (
          <div className="mt-8 space-y-6">
            {reports.map((report) => {
              const isSelected =
                selectedReportId === report.id;

              return (
                <article
                  key={report.id}
                  className="overflow-hidden rounded-3xl border bg-white shadow-sm"
                >
                  <div className="grid lg:grid-cols-[300px_1fr]">
                    <div className="bg-slate-100">
                      {report.product_image_url ? (
                        <img
                          src={
                            report.product_image_url
                          }
                          alt={report.product_title}
                          className="h-full min-h-72 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full min-h-72 items-center justify-center text-slate-400">
                          Fără imagine
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold uppercase text-red-600">
                            Produs raportat
                          </p>

                          <h2 className="mt-1 text-2xl font-black text-slate-950">
                            {report.product_title}
                          </h2>

                          <p className="mt-2 text-sm text-slate-500">
                            Status produs:{" "}
                            <strong>
                              {report.product_status ||
                                "-"}
                            </strong>
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-3 text-white">
                          <p className="text-xs font-semibold text-slate-300">
                            Preț
                          </p>

                          <p className="text-xl font-black">
                            {formatPrice(
                              report.product_price
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-500">
                            Vânzător
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {report.seller_name}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-500">
                            Persoana care a raportat
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {report.reporter_name}
                          </p>

                          <p className="mt-1 break-all text-sm text-slate-500">
                            {report.reporter_email ||
                              "E-mail indisponibil"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
                        <p className="font-bold text-red-900">
                          Motivul raportării
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-red-800">
                          {report.reason}
                        </p>

                        <p className="mt-4 border-t border-red-200 pt-4 text-sm text-red-700">
                          Raportat la:{" "}
                          <strong>
                            {formatDate(
                              report.created_at
                            )}
                          </strong>
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href={`/products/${report.product_id}`}
                          className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-800 hover:bg-slate-50"
                        >
                          Vezi produsul
                        </Link>

                        <Link
                          href={`/users/${report.seller_id}`}
                          className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-800 hover:bg-slate-50"
                        >
                          Vezi vânzătorul
                        </Link>

                        {!isSelected && (
                          <button
                            type="button"
                            onClick={() =>
                              openModerationForm(
                                report.id
                              )
                            }
                            className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800"
                          >
                            Soluționează raportarea
                          </button>
                        )}
                      </div>

                      {isSelected && (
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <h3 className="text-lg font-black text-slate-950">
                            Decizia administratorului
                          </h3>

                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDecision(
                                  "dismiss"
                                )
                              }
                              className={`rounded-2xl border p-4 text-left ${
                                decision ===
                                "dismiss"
                                  ? "border-green-600 bg-green-50"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <p className="font-black text-green-800">
                                Păstrează produsul
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                Raportarea este
                                respinsă, iar produsul
                                rămâne activ.
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDecision(
                                  "remove"
                                )
                              }
                              className={`rounded-2xl border p-4 text-left ${
                                decision === "remove"
                                  ? "border-red-600 bg-red-50"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <p className="font-black text-red-800">
                                Elimină produsul
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                Produsul va fi ascuns
                                și nu va mai putea primi
                                oferte.
                              </p>
                            </button>
                          </div>

                          <div className="mt-5">
                            <label
                              htmlFor={`resolution-reason-${report.id}`}
                              className="font-bold text-slate-900"
                            >
                              Motivul deciziei
                            </label>

                            <textarea
                              id={`resolution-reason-${report.id}`}
                              value={
                                resolutionReason
                              }
                              onChange={(event) =>
                                setResolutionReason(
                                  event.target.value
                                )
                              }
                              rows={5}
                              minLength={5}
                              maxLength={1000}
                              placeholder="Explică decizia luată..."
                              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950"
                            />

                            <p className="mt-1 text-right text-xs text-slate-500">
                              {
                                resolutionReason.length
                              }
                              /1000
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
                                void handleResolveReport(
                                  report
                                )
                              }
                              disabled={actionLoading}
                              className={`rounded-2xl px-5 py-3 font-bold text-white disabled:opacity-60 ${
                                decision === "dismiss"
                                  ? "bg-green-700"
                                  : "bg-red-700"
                              }`}
                            >
                              {actionLoading
                                ? "Se salvează..."
                                : decision ===
                                    "dismiss"
                                  ? "Confirmă păstrarea"
                                  : "Confirmă eliminarea"}
                            </button>

                            <button
                              type="button"
                              onClick={
                                closeModerationForm
                              }
                              disabled={actionLoading}
                              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-60"
                            >
                              Renunță
                            </button>
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}