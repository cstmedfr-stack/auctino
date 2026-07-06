"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  getAdminUsers,
  setUserAccountStatus,
} from "@/lib/admin";

import {
  AccountStatus,
  AdminUser,
} from "@/types/admin-user";

type UserFilter =
  | "all"
  | "active"
  | "suspended"
  | "admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<UserFilter>("all");

  const [selectedUser, setSelectedUser] =
    useState<AdminUser | null>(null);

  const [suspensionReason, setSuspensionReason] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
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

    setCurrentUserId(user.id);

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

    const { data, error: usersError } =
      await getAdminUsers();

    if (usersError) {
      setError(usersError.message);
      setLoading(false);
      return;
    }

    setUsers((data ?? []) as AdminUser[]);
    setLoading(false);
  }

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        user.full_name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        user.email
          ?.toLowerCase()
          .includes(normalizedSearch);

      let matchesFilter = true;

      if (filter === "active") {
        matchesFilter =
          user.account_status === "active";
      }

      if (filter === "suspended") {
        matchesFilter =
          user.account_status === "suspended";
      }

      if (filter === "admin") {
        matchesFilter = user.role === "admin";
      }

      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);

  const suspendedCount = users.filter(
    (user) =>
      user.account_status === "suspended"
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  function openSuspendForm(user: AdminUser) {
    setSelectedUser(user);
    setSuspensionReason("");
    setActionError("");
    setSuccessMessage("");
  }

  function closeSuspendForm() {
    if (actionLoading) return;

    setSelectedUser(null);
    setSuspensionReason("");
    setActionError("");
  }

  async function handleSuspendUser() {
    if (!selectedUser) return;

    const cleanReason =
      suspensionReason.trim();

    setActionError("");
    setSuccessMessage("");

    if (cleanReason.length < 5) {
      setActionError(
        "Motivul suspendării trebuie să conțină minimum 5 caractere."
      );
      return;
    }

    if (cleanReason.length > 1000) {
      setActionError(
        "Motivul suspendării nu poate depăși 1000 de caractere."
      );
      return;
    }

    setActionLoading(true);

    const { error: statusError } =
      await setUserAccountStatus({
        userId: selectedUser.id,
        status: "suspended",
        reason: cleanReason,
      });

    if (statusError) {
      setActionError(statusError.message);
      setActionLoading(false);
      return;
    }

    setSuccessMessage(
      `Contul utilizatorului ${
        selectedUser.full_name ||
        selectedUser.email ||
        "selectat"
      } a fost suspendat.`
    );

    setSelectedUser(null);
    setSuspensionReason("");
    setActionLoading(false);

    await loadUsers();
  }

  async function handleReactivateUser(
    user: AdminUser
  ) {
    const confirmed = window.confirm(
      `Reactivezi contul utilizatorului ${
        user.full_name ||
        user.email ||
        "selectat"
      }?`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setActionError("");
    setSuccessMessage("");

    const { error: statusError } =
      await setUserAccountStatus({
        userId: user.id,
        status: "active",
      });

    if (statusError) {
      setError(statusError.message);
      setActionLoading(false);
      return;
    }

    setSuccessMessage(
      `Contul utilizatorului ${
        user.full_name ||
        user.email ||
        "selectat"
      } a fost reactivat.`
    );

    setActionLoading(false);
    await loadUsers();
  }

  function formatDate(
    date: string | null
  ) {
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

  function formatRating(
    rating: number | string | null
  ) {
    if (
      rating === null ||
      rating === undefined
    ) {
      return "Fără rating";
    }

    return `${Number(rating).toFixed(1)} / 5`;
  }

  function getStatusLabel(
    status: AccountStatus
  ) {
    return status === "active"
      ? "Activ"
      : "Suspendat";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-slate-600">
            Se încarcă utilizatorii...
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
              Administrarea utilizatorilor este
              disponibilă numai administratorilor.
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
      <div className="mx-auto max-w-7xl">
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
            Administrare utilizatori
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Caută utilizatori și gestionează
            suspendarea sau reactivarea conturilor.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-sm text-slate-300">
                Total conturi
              </p>

              <p className="mt-1 text-3xl font-black">
                {users.length}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-sm text-slate-300">
                Suspendate
              </p>

              <p className="mt-1 text-3xl font-black">
                {suspendedCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-sm text-slate-300">
                Administratori
              </p>

              <p className="mt-1 text-3xl font-black">
                {adminCount}
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

        <section className="mt-8 rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Caută după nume sau e-mail..."
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950 lg:max-w-md"
            />

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "Toți"],
                  ["active", "Activi"],
                  ["suspended", "Suspendați"],
                  ["admin", "Administratori"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFilter(value)
                  }
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    filter === value
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {filteredUsers.length === 0 ? (
          <section className="mt-8 rounded-3xl border bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-black text-slate-950">
              Nu am găsit utilizatori
            </p>

            <p className="mt-2 text-slate-500">
              Modifică termenul de căutare sau
              filtrul selectat.
            </p>
          </section>
        ) : (
          <section className="mt-8 grid gap-5">
            {filteredUsers.map((user) => {
              const isCurrentUser =
                user.id === currentUserId;

              const cannotSuspend =
                isCurrentUser ||
                user.role === "admin";

              return (
                <article
                  key={user.id}
                  className="rounded-3xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-xl font-black text-slate-950">
                          {user.full_name ||
                            "Utilizator fără nume"}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            user.account_status ===
                            "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {getStatusLabel(
                            user.account_status
                          )}
                        </span>

                        {user.role === "admin" && (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                            Administrator
                          </span>
                        )}

                        {isCurrentUser && (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                            Contul tău
                          </span>
                        )}
                      </div>

                      <p className="mt-2 break-all text-sm text-slate-500">
                        {user.email ||
                          "E-mail indisponibil"}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Creat la:{" "}
                        {formatDate(user.created_at)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                        <p className="text-xs font-semibold text-slate-500">
                          Produse
                        </p>

                        <p className="mt-1 text-xl font-black">
                          {user.products_count}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                        <p className="text-xs font-semibold text-slate-500">
                          Cumpărări
                        </p>

                        <p className="mt-1 text-xl font-black">
                          {user.purchases_count}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                        <p className="text-xs font-semibold text-slate-500">
                          Vânzări
                        </p>

                        <p className="mt-1 text-xl font-black">
                          {user.sales_count}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                        <p className="text-xs font-semibold text-slate-500">
                          Rating
                        </p>

                        <p className="mt-1 text-sm font-black">
                          {formatRating(user.rating)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {user.account_status ===
                    "suspended" && (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="font-bold text-red-800">
                        Cont suspendat
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm text-red-700">
                        Motiv:{" "}
                        {user.suspension_reason ||
                          "Motiv nespecificat"}
                      </p>

                      <p className="mt-2 text-xs text-red-600">
                        Suspendat la:{" "}
                        {formatDate(
                          user.suspended_at
                        )}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/users/${user.id}`}
                      className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-800 hover:bg-slate-50"
                    >
                      Vezi profilul
                    </Link>

                    {user.account_status ===
                    "active" ? (
                      <button
                        type="button"
                        onClick={() =>
                          openSuspendForm(user)
                        }
                        disabled={
                          cannotSuspend ||
                          actionLoading
                        }
                        title={
                          cannotSuspend
                            ? "Conturile de administrator nu pot fi suspendate aici."
                            : undefined
                        }
                        className="rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Suspendă contul
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          void handleReactivateUser(
                            user
                          )
                        }
                        disabled={actionLoading}
                        className="rounded-2xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800 disabled:opacity-60"
                      >
                        Reactivează contul
                      </button>
                    )}
                  </div>

                  {selectedUser?.id === user.id && (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
                      <h3 className="text-lg font-black text-red-900">
                        Suspendarea contului
                      </h3>

                      <p className="mt-2 text-sm text-red-700">
                        Utilizatorul va primi o
                        notificare cu motivul suspendării.
                      </p>

                      <label
                        htmlFor={`suspension-reason-${user.id}`}
                        className="mt-4 block font-bold text-slate-900"
                      >
                        Motivul suspendării
                      </label>

                      <textarea
                        id={`suspension-reason-${user.id}`}
                        value={suspensionReason}
                        onChange={(event) =>
                          setSuspensionReason(
                            event.target.value
                          )
                        }
                        rows={4}
                        minLength={5}
                        maxLength={1000}
                        placeholder="Descrie motivul suspendării..."
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-red-600"
                      />

                      <p className="mt-1 text-right text-xs text-slate-500">
                        {suspensionReason.length}/1000
                      </p>

                      {actionError && (
                        <div className="mt-4 rounded-xl bg-white p-3 text-sm text-red-700">
                          {actionError}
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            void handleSuspendUser()
                          }
                          disabled={actionLoading}
                          className="rounded-2xl bg-red-700 px-5 py-3 font-bold text-white hover:bg-red-800 disabled:opacity-60"
                        >
                          {actionLoading
                            ? "Se suspendă..."
                            : "Confirmă suspendarea"}
                        </button>

                        <button
                          type="button"
                          onClick={closeSuspendForm}
                          disabled={actionLoading}
                          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-60"
                        >
                          Renunță
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}