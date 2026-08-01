"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { useMessages } from "@/i18n/useMessages";
import {
  dismissReport,
  getProductReportsForAdmin,
  removeProductFromReport,
} from "@/services/report.service";
import type {
  AdminProductReport,
  ModerationDecision,
} from "@/types/report";
import { formatMessage } from "@/utils/formatMessage";

export function useAdminReports() {
  const messages = useMessages();
  const t = messages.adminReports;

  const [reports, setReports] =
    useState<AdminProductReport[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    accessDenied,
    setAccessDenied,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    selectedReportId,
    setSelectedReportId,
  ] = useState<string | null>(null);

  const [
    decision,
    setDecision,
  ] = useState<ModerationDecision>("dismiss");

  const [
    resolutionReason,
    setResolutionReason,
  ] = useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    actionError,
    setActionError,
  ] = useState("");

  const loadReports = useCallback(
    async () => {
      setLoading(true);
      setError("");
      setAccessDenied(false);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(t.authRequired);
        setLoading(false);
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError(t.loadError);
        setLoading(false);
        return;
      }

      if (profile?.role !== "admin") {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const {
        data,
        error: reportsError,
      } = await getProductReportsForAdmin();

      if (reportsError) {
        console.error(
          t.loadError,
          reportsError.message
        );

        setError(t.loadError);
        setLoading(false);
        return;
      }

      setReports(
        (data ?? []) as AdminProductReport[]
      );

      setLoading(false);
    },
    [
      t.authRequired,
      t.loadError,
    ]
  );

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

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
    if (actionLoading) {
      return;
    }

    setSelectedReportId(null);
    setResolutionReason("");
    setActionError("");
  }

  async function resolveReport(
    report: AdminProductReport
  ) {
    const cleanReason =
      resolutionReason.trim();

    setActionError("");
    setSuccessMessage("");

    if (cleanReason.length < 5) {
      setActionError(t.reasonTooShort);
      return;
    }

    if (cleanReason.length > 1000) {
      setActionError(t.reasonTooLong);
      return;
    }

    setActionLoading(true);

    const result =
      decision === "dismiss"
        ? await dismissReport({
            reportId: report.id,
            reason: cleanReason,
          })
        : await removeProductFromReport({
            reportId: report.id,
            reason: cleanReason,
          });

    if (result.error) {
      setActionError(result.error.message);
      setActionLoading(false);
      return;
    }

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

    const title =
      report.product_title ||
      t.unknownValue;

    setSuccessMessage(
      decision === "dismiss"
        ? formatMessage(
            t.dismissSuccess,
            { title }
          )
        : formatMessage(
            t.removeSuccess,
            { title }
          )
    );

    setSelectedReportId(null);
    setResolutionReason("");
    setActionLoading(false);
  }

  return {
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
  };
}