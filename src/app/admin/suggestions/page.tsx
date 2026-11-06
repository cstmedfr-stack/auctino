
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  RefreshCw,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useLocale } from "@/i18n/LocaleProvider";

type SuggestionCategory =
  | "category"
  | "feature"
  | "bug"
  | "design"
  | "other";

type SuggestionStatus =
  | "new"
  | "reviewing"
  | "accepted"
  | "implemented"
  | "rejected";

type Suggestion = {
  id: number;
  category: SuggestionCategory;
  message: string;
  status: SuggestionStatus;
  created_at: string;
};

type SuggestionsResponse = {
  items: Suggestion[];
  total: number;
  newCount: number;
  page: number;
  pageSize: number;
};

const categoryIds: SuggestionCategory[] = [
  "category",
  "feature",
  "bug",
  "design",
  "other",
];

const statusIds: SuggestionStatus[] = [
  "new",
  "reviewing",
  "accepted",
  "implemented",
  "rejected",
];

const statusColors: Record<SuggestionStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  reviewing:
    "bg-amber-50 text-amber-700 border-amber-200",
  accepted:
    "bg-indigo-50 text-indigo-700 border-indigo-200",
  implemented:
    "bg-green-50 text-green-700 border-green-200",
  rejected:
    "bg-slate-100 text-slate-600 border-slate-200",
};

const translations = {
  ro: {
    back: "Înapoi la administrare",
    title: "Sugestiile utilizatorilor",
    subtitle:
      "Idei, propuneri și probleme semnalate de comunitatea Auctino.",
    newSuggestions: "Sugestii noi",
    filteredTotal: "Rezultate",
    allCategories: "Toate categoriile",
    allStatuses: "Toate statusurile",
    date: "Primită la",
    changeStatus: "Modifică statusul",
    refresh: "Actualizează",
    loading: "Se încarcă sugestiile...",
    empty: "Nu există sugestii pentru filtrele alese.",
    accessDenied: "Nu ai drepturi de administrator.",
    loginRequired:
      "Trebuie să te autentifici pentru a accesa această pagină.",
    loadError: "Nu am putut încărca sugestiile.",
    updateError: "Nu am putut actualiza statusul.",
    previous: "Anterior",
    next: "Următor",
    page: "Pagina",
    of: "din",
    categories: {
      category: "Categorie nouă",
      feature: "Funcționalitate",
      bug: "Problemă pe site",
      design: "Design și navigare",
      other: "Altele",
    },
    statuses: {
      new: "Nouă",
      reviewing: "În analiză",
      accepted: "Acceptată",
      implemented: "Implementată",
      rejected: "Respinsă",
    },
  },

  fr: {
    back: "Retour à l'administration",
    title: "Suggestions des utilisateurs",
    subtitle:
      "Idées, propositions et problèmes signalés par la communauté Auctino.",
    newSuggestions: "Nouvelles suggestions",
    filteredTotal: "Résultats",
    allCategories: "Toutes les catégories",
    allStatuses: "Tous les statuts",
    date: "Reçue le",
    changeStatus: "Modifier le statut",
    refresh: "Actualiser",
    loading: "Chargement des suggestions...",
    empty: "Aucune suggestion pour ces filtres.",
    accessDenied: "Accès réservé aux administrateurs.",
    loginRequired:
      "Connectez-vous pour accéder à cette page.",
    loadError: "Impossible de charger les suggestions.",
    updateError: "Impossible de modifier le statut.",
    previous: "Précédent",
    next: "Suivant",
    page: "Page",
    of: "sur",
    categories: {
      category: "Nouvelle catégorie",
      feature: "Fonctionnalité",
      bug: "Problème sur le site",
      design: "Design et navigation",
      other: "Autre",
    },
    statuses: {
      new: "Nouvelle",
      reviewing: "En cours d'analyse",
      accepted: "Acceptée",
      implemented: "Implémentée",
      rejected: "Refusée",
    },
  },
} as const;

export default function AdminSuggestionsPage() {
  const { locale } = useLocale();
  const t = translations[locale];

  const [items, setItems] = useState<Suggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [newCount, setNewCount] = useState(0);

  const [categoryFilter, setCategoryFilter] = useState<
    SuggestionCategory | "all"
  >("all");

  const [statusFilter, setStatusFilter] = useState<
    SuggestionStatus | "all"
  >("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState<
    number | null
  >(null);

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    setError("");
    setAccessDenied(false);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          translations[locale].loginRequired
        );
      }

      const params = new URLSearchParams({
        page: String(page),
        category: categoryFilter,
        status: statusFilter,
      });

      const response = await fetch(
        `/api/admin/suggestions?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      if (response.status === 403) {
        setAccessDenied(true);
        return;
      }

      if (response.status === 401) {
        throw new Error(
          translations[locale].loginRequired
        );
      }

      if (!response.ok) {
        throw new Error(
          translations[locale].loadError
        );
      }

      const result =
        (await response.json()) as SuggestionsResponse;

      setItems(result.items);
      setTotal(result.total);
      setNewCount(result.newCount);
      setPageSize(result.pageSize);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : translations[locale].loadError
      );
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, statusFilter, locale]);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

  async function changeStatus(
    id: number,
    status: SuggestionStatus
  ) {
    setUpdatingId(id);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(t.loginRequired);
      }

      const response = await fetch(
        "/api/admin/suggestions",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(t.updateError);
      }

      await loadSuggestions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.updateError
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center text-red-700">
          {t.accessDenied}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
        >
          <ArrowLeft size={17} />
          {t.back}
        </Link>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
              <MessageSquareText size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">
                {t.title}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {t.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadSuggestions()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            {t.refresh}
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              {t.newSuggestions}
            </p>

            <p className="mt-2 text-3xl font-extrabold text-indigo-700">
              {newCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              {t.filteredTotal}
            </p>

            <p className="mt-2 text-3xl font-extrabold text-slate-950">
              {total}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <select
            aria-label={t.allCategories}
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(
                event.target.value as
                  | SuggestionCategory
                  | "all"
              );
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
          >
            <option value="all">
              {t.allCategories}
            </option>

            {categoryIds.map((id) => (
              <option key={id} value={id}>
                {t.categories[id]}
              </option>
            ))}
          </select>

          <select
            aria-label={t.allStatuses}
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value as
                  | SuggestionStatus
                  | "all"
              );
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
          >
            <option value="all">
              {t.allStatuses}
            </option>

            {statusIds.map((id) => (
              <option key={id} value={id}>
                {t.statuses[id]}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            {t.loading}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            {t.empty}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {t.categories[item.category]}
                    </span>

                    <span
                      className={`rounded-lg border px-3 py-1 text-xs font-bold ${statusColors[item.status]}`}
                    >
                      {t.statuses[item.status]}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500">
                    {t.date}:{" "}
                    {new Date(
                      item.created_at
                    ).toLocaleString(
                      locale === "fr"
                        ? "fr-FR"
                        : "ro-RO",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    )}
                  </span>
                </div>

                <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
                  {item.message}
                </p>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <label
                    htmlFor={`status-${item.id}`}
                    className="mb-2 block text-xs font-semibold text-slate-500"
                  >
                    {t.changeStatus}
                  </label>

                  <select
                    id={`status-${item.id}`}
                    value={item.status}
                    disabled={updatingId !== null}
                    onChange={(event) =>
                      void changeStatus(
                        item.id,
                        event.target.value as SuggestionStatus
                      )
                    }
                    className="w-full max-w-xs rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 disabled:opacity-50"
                  >
                    {statusIds.map((id) => (
                      <option key={id} value={id}>
                        {t.statuses[id]}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && total > 0 && (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              disabled={page <= 1}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              {t.previous}
            </button>

            <span className="text-sm text-slate-600">
              {t.page} {page} {t.of} {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              disabled={page >= totalPages}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
            >
              {t.next}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
