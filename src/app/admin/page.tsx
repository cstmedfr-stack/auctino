"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAdminDisputes } from "@/lib/transactions";
import { AdminDispute } from "@/types/transaction";

export default function AdminPage() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadAdminDashboard();
  }, []);

  async function loadAdminDashboard() {
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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-600">
            Se încarcă panoul de administrare...
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
            Vendora Admin
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Panou de administrare
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Gestionează disputele și viitoarele rapoarte
            privind utilizatorii și produsele.
          </p>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <Link
            href="/admin/disputes"
            className="group rounded-3xl border border-amber-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                🛡️
              </div>

              {disputes.length > 0 && (
                <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-red-600 px-2 text-sm font-black text-white">
                  {disputes.length}
                </span>
              )}
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950">
              Dispute
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Verifică și soluționează tranzacțiile contestate.
            </p>

            <p className="mt-5 font-bold text-amber-700 group-hover:text-amber-900">
              Vezi disputele →
            </p>
          </Link>

          <Link
  href="/admin/users"
  className="group rounded-3xl border border-blue-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
>
  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
    👥
  </div>

  <h2 className="mt-5 text-xl font-black text-slate-950">
    Utilizatori
  </h2>

  <p className="mt-2 text-sm text-slate-600">
    Caută, suspendă sau reactivează conturile utilizatorilor.
  </p>

  <p className="mt-5 font-bold text-blue-700 group-hover:text-blue-900">
    Administrează utilizatorii →
  </p>
</Link>

    <Link
            href="/admin/reports"
            className="group rounded-3xl border border-red-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-2xl">
                🚩
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950">
                Produse raportate
            </h2>

            <p className="mt-2 text-sm text-slate-600">
                Verifică raportările și elimină anunțurile care încalcă regulile.
            </p>

            <p className="mt-5 font-bold text-red-700 group-hover:text-red-900">
                Verifică raportările →
            </p>
    </Link>
 </section>

        <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Dispute recente
              </h2>

              <p className="mt-1 text-slate-500">
                Cele mai recente cazuri care necesită atenție.
              </p>
            </div>

            <Link
              href="/admin/disputes"
              className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-800 hover:bg-slate-50"
            >
              Vezi toate
            </Link>
          </div>

          {disputes.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-green-50 p-6 text-center">
              <p className="font-bold text-green-800">
                Nu există dispute deschise.
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
                      Vânzător: {dispute.seller_name} ·
                      Cumpărător: {dispute.buyer_name}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-sm font-bold text-amber-700">
                      În dispută
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(dispute.disputed_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}