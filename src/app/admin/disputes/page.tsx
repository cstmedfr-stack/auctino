"use client";

import AdminDisputeCard from "@/components/admin/disputes/AdminDisputeCard";
import AdminDisputesEmptyState from "@/components/admin/disputes/AdminDisputesState";
import AdminDisputesHeader from "@/components/admin/disputes/AdminDisputesHeader";
import AdminAccessState from "@/components/admin/shared/AdminAccessState";
import { useAdminDisputes } from "@/hooks/useAdminDisputes";
import { useMessages } from "@/i18n/useMessages";

export default function AdminDisputesPage() {
  const messages = useMessages();
  const t = messages.adminDisputes;

  const {
    disputes,
    loading,
    accessDenied,
    error,
    selectedDisputeId,
    decision,
    reason,
    submitting,
    actionError,
    successMessage,
    setDecision,
    setReason,
    loadDisputes,
    openResolutionForm,
    closeResolutionForm,
    resolveDispute,
  } = useAdminDisputes();

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
              void loadDisputes();
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <AdminDisputesHeader
          count={disputes.length}
        />

        {successMessage && (
          <div className="mt-6 rounded-2xl bg-green-50 p-4 font-medium text-green-700">
            {successMessage}
          </div>
        )}

        {disputes.length === 0 ? (
          <AdminDisputesEmptyState />
        ) : (
          <div className="mt-8 space-y-6">
            {disputes.map((dispute) => (
              <AdminDisputeCard
                key={dispute.id}
                dispute={dispute}
                isSelected={
                  selectedDisputeId ===
                  dispute.id
                }
                decision={decision}
                reason={reason}
                submitting={submitting}
                actionError={actionError}
                onOpen={openResolutionForm}
                onClose={closeResolutionForm}
                onDecisionChange={setDecision}
                onReasonChange={setReason}
                onResolve={(selectedDispute) => {
                  void resolveDispute(
                    selectedDispute
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