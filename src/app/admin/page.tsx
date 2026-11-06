
"use client";

import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";

import AdminAccessState from "@/components/admin/shared/AdminAccessState";
import AdminDashboardCards from "@/components/admin/dashboard/AdminDashboardCards";
import AdminDashboardHeader from "@/components/admin/dashboard/AdminDashboardHeader";
import RecentDisputesList from "@/components/admin/dashboard/RecentDisputesList";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";

export default function AdminPage() {
  const messages = useMessages();
  const t = messages.adminDashboard;
  const { locale } = useLocale();

  const {
    disputes,
    loading,
    accessDenied,
    error,
    loadDashboard,
  } = useAdminDashboard();

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <AdminAccessState
            type="loading"
            title={t.loadingTitle}
            description={t.loadingDescription}
          />
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <AdminAccessState
            type="accessDenied"
            eyebrow={t.accessDeniedEyebrow}
            title={t.accessDeniedTitle}
            description={t.accessDeniedDescription}
            backHome={t.backHome}
          />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <AdminAccessState
            type="error"
            title={t.loadError}
            message={error}
            retry={t.retry}
            onRetry={() => {
              void loadDashboard();
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <AdminDashboardHeader />

        <Link
          href="/admin/suggestions"
          className="my-6 flex flex-wrap items-center gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 transition hover:border-indigo-400 hover:bg-indigo-100"
        >
          <div className="rounded-xl bg-white p-3 text-indigo-700 shadow-sm">
            <MessageSquareText size={26} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-950">
              {locale === "fr"
                ? "Suggestions des utilisateurs"
                : "Sugestii utilizatori"}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {locale === "fr"
                ? "Consultez les idées de la communauté et gérez leur statut."
                : "Consultă ideile comunității și gestionează statusul sugestiilor."}
            </p>
          </div>

          <ArrowRight
            size={21}
            className="text-indigo-700"
          />
        </Link>

        <AdminDashboardCards
          disputesCount={disputes.length}
        />

        <RecentDisputesList
          disputes={disputes}
        />
      </div>
    </main>
  );
}
