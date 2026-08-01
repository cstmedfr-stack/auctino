"use client";

import AdminReportCard from "@/components/reports/AdminReportCard";
import AdminReportsHeader from "@/components/reports/AdminReportsHeader";
import AdminReportsState from "@/components/reports/AdminReportsState";
import { useAdminReports } from "@/hooks/useAdminReports";

export default function AdminProductReportsPage() {
  const {
    reports,
    loading,
    accessDenied,
    error,
    successMessage,
    selectedReportId,
    decision,
    resolutionReason,
    actionLoading,
    actionError,
    setDecision,
    setResolutionReason,
    loadReports,
    openModerationForm,
    closeModerationForm,
    resolveReport,
  } = useAdminReports();

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <AdminReportsState type="loading" />
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <AdminReportsState type="accessDenied" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <AdminReportsHeader
          count={reports.length}
        />

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

        {error ? (
          <div className="mt-8">
            <AdminReportsState
              type="error"
              message={error}
              onRetry={() => {
                void loadReports();
              }}
            />
          </div>
        ) : reports.length === 0 ? (
          <div className="mt-8">
            <AdminReportsState type="empty" />
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {reports.map((report) => (
              <AdminReportCard
                key={report.id}
                report={report}
                isSelected={
                  selectedReportId === report.id
                }
                decision={decision}
                resolutionReason={
                  resolutionReason
                }
                actionLoading={actionLoading}
                actionError={actionError}
                onOpen={openModerationForm}
                onClose={closeModerationForm}
                onDecisionChange={setDecision}
                onReasonChange={
                  setResolutionReason
                }
                onResolve={(selectedReport) => {
                  void resolveReport(
                    selectedReport
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}