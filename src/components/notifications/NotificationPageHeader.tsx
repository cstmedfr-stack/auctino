"use client";

import {
  Bell,
  CheckCheck,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type NotificationPageHeaderProps = {
  unreadCount: number;
  loading: boolean;
  onMarkAllAsRead: () => void;
};

export default function NotificationPageHeader({
  unreadCount,
  loading,
  onMarkAllAsRead,
}: NotificationPageHeaderProps) {
  const messages = useMessages();
  const t = messages.notificationsPage;

  const unreadText =
    unreadCount > 0
      ? t.unreadCount.replace(
          "{count}",
          String(unreadCount)
        )
      : t.allRead;

  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
            <Bell size={17} />
            {t.eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            {t.title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {t.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
            {unreadText}
          </span>

          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={
              loading || unreadCount === 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={17} />
            {t.markAllAsRead}
          </button>
        </div>
      </div>
    </section>
  );
}