"use client";

import AdminAccessState from "@/components/admin/shared/AdminAccessState";
import AdminDashboardCards from "@/components/admin/dashboard/AdminDashboardCards";
import AdminDashboardHeader from "@/components/admin/dashboard/AdminDashboardHeader";
import RecentDisputesList from "@/components/admin/dashboard/RecentDisputesList";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useMessages } from "@/i18n/useMessages";

export default function AdminPage() {
  const messages = useMessages();
  const t = messages.adminDashboard;

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
            description={
              t.accessDeniedDescription
            }
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