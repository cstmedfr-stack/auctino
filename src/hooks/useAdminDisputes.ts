"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import {
  getDisputesForAdmin,
  resolveAdminDispute,
} from "@/services/dispute.service";
import { useMessages } from "@/i18n/useMessages";
import type { AdminDispute } from "@/types/transaction";
import { formatMessage } from "@/utils/formatMessage";
import {
  ResolutionDecision,
  validateResolutionReason,
} from "@/utils/adminDisputes";

export function useAdminDisputes() {
  const messages = useMessages();
  const t = messages.adminDisputes;

  const [disputes, setDisputes] =
    useState<AdminDispute[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    accessDenied,
    setAccessDenied,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    selectedDisputeId,
    setSelectedDisputeId,
  ] = useState<string | null>(null);

  const [decision, setDecision] =
    useState<ResolutionDecision>("completed");

  const [reason, setReason] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const loadDisputes = useCallback(
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
        error: disputesError,
      } = await getDisputesForAdmin();

      if (disputesError) {
        console.error(
          t.loadError,
          disputesError.message
        );

        setError(t.loadError);
        setLoading(false);
        return;
      }

      setDisputes(
        (data ?? []) as AdminDispute[]
      );

      setLoading(false);
    },
    [t.authRequired, t.loadError]
  );

  useEffect(() => {
    void loadDisputes();
  }, [loadDisputes]);

  function openResolutionForm(
    disputeId: string
  ) {
    setSelectedDisputeId(disputeId);
    setDecision("completed");
    setReason("");
    setActionError("");
    setSuccessMessage("");
  }

  function closeResolutionForm() {
    if (submitting) {
      return;
    }

    setSelectedDisputeId(null);
    setReason("");
    setActionError("");
  }

  async function resolveDispute(
    dispute: AdminDispute
  ) {
    const cleanReason = reason.trim();

    setActionError("");
    setSuccessMessage("");

    const validationError =
      validateResolutionReason(
        cleanReason,
        {
          reasonTooShort:
            t.reasonTooShort,
          reasonTooLong:
            t.reasonTooLong,
        }
      );

    if (validationError) {
      setActionError(validationError);
      return;
    }

    setSubmitting(true);

    const {
      error: resolveError,
    } = await resolveAdminDispute({
      transactionId: dispute.id,
      decision,
      reason: cleanReason,
    });

    if (resolveError) {
      setActionError(
        resolveError.message
      );
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
        ? formatMessage(
            t.successCompleted,
            {
              title:
                dispute.product_title,
            }
          )
        : formatMessage(
            t.successCancelled,
            {
              title:
                dispute.product_title,
            }
          )
    );

    setSelectedDisputeId(null);
    setReason("");
    setSubmitting(false);
  }

  return {
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
  };
}