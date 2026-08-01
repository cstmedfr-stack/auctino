"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import {
  getAdminUsers,
  setUserAccountStatus,
} from "@/lib/admin";
import { useMessages } from "@/i18n/useMessages";
import { formatMessage } from "@/utils/formatMessage";
import type { AdminUser } from "@/types/admin-user";
import {
  filterAdminUsers,
  getAdminUserDisplayName,
  getAdminUserStats,
  type AdminUserFilter,
} from "@/utils/adminUsers";

export function useAdminUsers() {
  const messages = useMessages();
  const t = messages.adminUsers;

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState<string | null>(null);

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

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<AdminUserFilter>("all");

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<AdminUser | null>(null);

  const [
    reactivationUser,
    setReactivationUser,
  ] = useState<AdminUser | null>(null);

  const [
    suspensionReason,
    setSuspensionReason,
  ] = useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [actionError, setActionError] =
    useState("");

  const loadUsers = useCallback(
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

      setCurrentUserId(user.id);

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
        error: usersError,
      } = await getAdminUsers();

      if (usersError) {
        console.error(
          t.loadError,
          usersError.message
        );

        setError(t.loadError);
        setLoading(false);
        return;
      }

      setUsers((data ?? []) as AdminUser[]);
      setLoading(false);
    },
    [t.authRequired, t.loadError]
  );

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return filterAdminUsers({
      users,
      search,
      filter,
    });
  }, [users, search, filter]);

  const stats = useMemo(() => {
    return getAdminUserStats(users);
  }, [users]);

  function openSuspendForm(user: AdminUser) {
    setSelectedUser(user);
    setReactivationUser(null);
    setSuspensionReason("");
    setActionError("");
    setSuccessMessage("");
  }

  function closeSuspendForm() {
    if (actionLoading) {
      return;
    }

    setSelectedUser(null);
    setSuspensionReason("");
    setActionError("");
  }

  function openReactivateForm(user: AdminUser) {
    setReactivationUser(user);
    setSelectedUser(null);
    setActionError("");
    setSuccessMessage("");
  }

  function closeReactivateForm() {
    if (actionLoading) {
      return;
    }

    setReactivationUser(null);
    setActionError("");
  }

  async function suspendSelectedUser() {
    if (!selectedUser) {
      return;
    }

    const cleanReason =
      suspensionReason.trim();

    setActionError("");
    setSuccessMessage("");

    if (cleanReason.length < 5) {
      setActionError(t.suspend.reasonTooShort);
      return;
    }

    if (cleanReason.length > 1000) {
      setActionError(t.suspend.reasonTooLong);
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

    const name = getAdminUserDisplayName(
      selectedUser,
      t.selectedUserFallback
    );

    setSuccessMessage(
      formatMessage(t.suspend.success, {
        name,
      })
    );

    setSelectedUser(null);
    setSuspensionReason("");
    setActionLoading(false);

    await loadUsers();
  }

  async function reactivateSelectedUser() {
    if (!reactivationUser) {
      return;
    }

    setActionLoading(true);
    setActionError("");
    setSuccessMessage("");

    const { error: statusError } =
      await setUserAccountStatus({
        userId: reactivationUser.id,
        status: "active",
      });

    if (statusError) {
      setActionError(statusError.message);
      setActionLoading(false);
      return;
    }

    const name = getAdminUserDisplayName(
      reactivationUser,
      t.selectedUserFallback
    );

    setSuccessMessage(
      formatMessage(t.reactivate.success, {
        name,
      })
    );

    setReactivationUser(null);
    setActionLoading(false);

    await loadUsers();
  }

  return {
    users,
    filteredUsers,
    currentUserId,
    loading,
    accessDenied,
    error,
    successMessage,
    search,
    filter,
    stats,
    selectedUser,
    reactivationUser,
    suspensionReason,
    actionLoading,
    actionError,
    setSearch,
    setFilter,
    setSuspensionReason,
    loadUsers,
    openSuspendForm,
    closeSuspendForm,
    openReactivateForm,
    closeReactivateForm,
    suspendSelectedUser,
    reactivateSelectedUser,
  };
}