"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { getDisputesForAdmin } from "@/services/dispute.service";
import { useMessages } from "@/i18n/useMessages";
import type { AdminDispute } from "@/types/transaction";

export function useAdminDashboard() {
  const messages = useMessages();
  const t = messages.adminDashboard;

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

  const loadDashboard = useCallback(
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
    void loadDashboard();
  }, [loadDashboard]);

  return {
    disputes,
    loading,
    accessDenied,
    error,
    loadDashboard,
  };
}