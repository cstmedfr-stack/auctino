"use client";

import Link from "next/link";

import { useLocale } from "@/i18n/LocaleProvider";
import { useMessages } from "@/i18n/useMessages";
import { formatLocalizedDateTime } from "@/i18n/format";
import type { AdminUser } from "@/types/admin-user";
import {
  formatAdminRating,
  getAdminUserStatusLabel,
} from "@/utils/adminUsers";

type AdminUserCardProps = {
  user: AdminUser;
  currentUserId: string | null;
  selectedUserId: string | null;
  reactivationUserId: string | null;
  suspensionReason: string;
  actionLoading: boolean;
  actionError: string;
  onOpenSuspend: (user: AdminUser) => void;
  onCloseSuspend: () => void;
  onOpenReactivate: (
    user: AdminUser
  ) => void;
  onCloseReactivate: () => void;
  onReasonChange: (value: string) => void;
  onSuspend: () => void;
  onReactivate: () => void;
};

export default function AdminUserCard({
  user,
  currentUserId,
  selectedUserId,
  reactivationUserId,
  suspensionReason,
  actionLoading,
  actionError,
  onOpenSuspend,
  onCloseSuspend,
  onOpenReactivate,
  onCloseReactivate,
  onReasonChange,
  onSuspend,
  onReactivate,
}: AdminUserCardProps) {
  const messages = useMessages();
  const { locale } = useLocale();
  const t = messages.adminUsers;

  const isCurrentUser =
    user.id === currentUserId;

  const cannotSuspend =
    isCurrentUser || user.role === "admin";

  const isSuspendOpen =
    selectedUserId === user.id;

  const isReactivateOpen =
    reactivationUserId === user.id;

  const statusLabel =
    getAdminUserStatusLabel(
      user.account_status,
      t.status
    );

  return (
    <article className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-black text-slate-950">
              {user.full_name || t.unknownUser}
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                user.account_status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {statusLabel}
            </span>

            {user.role === "admin" && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                {t.adminBadge}
              </span>
            )}

            {isCurrentUser && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                {t.currentAccount}
              </span>
            )}
          </div>

          <p className="mt-2 break-all text-sm text-slate-500">
            {user.email || t.unavailableEmail}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {t.createdAt}:{" "}
            {user.created_at
              ? formatLocalizedDateTime(
                  user.created_at,
                  locale
                )
              : "-"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric
            label={t.products}
            value={user.products_count}
          />

          <Metric
            label={t.purchases}
            value={user.purchases_count}
          />

          <Metric
            label={t.sales}
            value={user.sales_count}
          />

          <Metric
            label={t.rating}
            value={formatAdminRating(
              user.rating,
              t.noRating
            )}
          />
        </div>
      </div>

      {user.account_status === "suspended" && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="font-bold text-red-800">
            {t.suspendedBlockTitle}
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm text-red-700">
            {t.suspensionReasonPrefix}:{" "}
            {user.suspension_reason ||
              t.unspecifiedReason}
          </p>

          <p className="mt-2 text-xs text-red-600">
            {t.suspendedAt}:{" "}
            {user.suspended_at
              ? formatLocalizedDateTime(
                  user.suspended_at,
                  locale
                )
              : "-"}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/users/${user.id}`}
          className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-800 transition hover:bg-slate-50"
        >
          {t.viewProfile}
        </Link>

        {user.account_status === "active" ? (
          <button
            type="button"
            onClick={() => onOpenSuspend(user)}
            disabled={
              cannotSuspend || actionLoading
            }
            title={
              cannotSuspend
                ? t.cannotSuspendAdmin
                : undefined
            }
            className="rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.suspend.open}
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              onOpenReactivate(user)
            }
            disabled={actionLoading}
            className="rounded-2xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800 disabled:opacity-60"
          >
            {t.reactivate.open}
          </button>
        )}
      </div>

      {isSuspendOpen && (
        <section className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="text-lg font-black text-red-900">
            {t.suspend.title}
          </h3>

          <p className="mt-2 text-sm text-red-700">
            {t.suspend.description}
          </p>

          <label
            htmlFor={`suspension-reason-${user.id}`}
            className="mt-4 block font-bold text-slate-900"
          >
            {t.suspend.reasonLabel}
          </label>

          <textarea
            id={`suspension-reason-${user.id}`}
            value={suspensionReason}
            onChange={(event) =>
              onReasonChange(event.target.value)
            }
            rows={4}
            minLength={5}
            maxLength={1000}
            placeholder={
              t.suspend.reasonPlaceholder
            }
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-red-600"
          />

          <p className="mt-1 text-right text-xs text-slate-500">
            {suspensionReason.length}/1000
          </p>

          {actionError && (
            <div className="mt-4 rounded-xl bg-white p-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onSuspend}
              disabled={actionLoading}
              className="rounded-2xl bg-red-700 px-5 py-3 font-bold text-white transition hover:bg-red-800 disabled:opacity-60"
            >
              {actionLoading
                ? t.suspend.submitting
                : t.suspend.confirm}
            </button>

            <button
              type="button"
              onClick={onCloseSuspend}
              disabled={actionLoading}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-60"
            >
              {t.suspend.cancel}
            </button>
          </div>
        </section>
      )}

      {isReactivateOpen && (
        <section className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
          <h3 className="text-lg font-black text-green-900">
            {t.reactivate.title}
          </h3>

          <p className="mt-2 text-sm text-green-700">
            {t.reactivate.description}
          </p>

          {actionError && (
            <div className="mt-4 rounded-xl bg-white p-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onReactivate}
              disabled={actionLoading}
              className="rounded-2xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800 disabled:opacity-60"
            >
              {actionLoading
                ? t.reactivate.submitting
                : t.reactivate.confirm}
            </button>

            <button
              type="button"
              onClick={onCloseReactivate}
              disabled={actionLoading}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-60"
            >
              {t.reactivate.cancel}
            </button>
          </div>
        </section>
      )}
    </article>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
      <p className="text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-black">
        {value}
      </p>
    </div>
  );
}