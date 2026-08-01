"use client";

import AdminUserCard from "@/components/admin/users/AdminUserCard";
import AdminUsersHeader from "@/components/admin/users/AdminUsersHeader";
import AdminUsersState from "@/components/admin/users/AdminUsersState";
import AdminUsersToolbar from "@/components/admin/users/AdminUsersToolbar";
import { useAdminUsers } from "@/hooks/useAdminUsers";

export default function AdminUsersPage() {
  const {
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
  } = useAdminUsers();

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <AdminUsersState type="loading" />
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <AdminUsersState type="accessDenied" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <AdminUsersState
            type="error"
            message={error}
            onRetry={() => {
              void loadUsers();
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <AdminUsersHeader
          total={stats.total}
          suspended={stats.suspended}
          admins={stats.admins}
        />

        {successMessage && (
          <div className="mt-6 rounded-2xl bg-green-50 p-4 font-medium text-green-700">
            {successMessage}
          </div>
        )}

        <AdminUsersToolbar
          search={search}
          filter={filter}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
        />

        {filteredUsers.length === 0 ? (
          <AdminUsersState type="empty" />
        ) : (
          <section className="mt-8 grid gap-5">
            {filteredUsers.map((user) => (
              <AdminUserCard
                key={user.id}
                user={user}
                currentUserId={currentUserId}
                selectedUserId={
                  selectedUser?.id ?? null
                }
                reactivationUserId={
                  reactivationUser?.id ?? null
                }
                suspensionReason={
                  suspensionReason
                }
                actionLoading={actionLoading}
                actionError={actionError}
                onOpenSuspend={
                  openSuspendForm
                }
                onCloseSuspend={
                  closeSuspendForm
                }
                onOpenReactivate={
                  openReactivateForm
                }
                onCloseReactivate={
                  closeReactivateForm
                }
                onReasonChange={
                  setSuspensionReason
                }
                onSuspend={() => {
                  void suspendSelectedUser();
                }}
                onReactivate={() => {
                  void reactivateSelectedUser();
                }}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}