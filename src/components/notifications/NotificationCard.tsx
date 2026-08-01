"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Notification } from "@/types/notification";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatLocalizedDateTime } from "@/i18n/format";
import {
  getNotificationHref,
  getNotificationIcon,
} from "@/utils/notifications";

type NotificationCardProps = {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
};

export default function NotificationCard({
  notification,
  onMarkAsRead,
}: NotificationCardProps) {
  const messages = useMessages();
  const { locale } = useLocale();
  const t = messages.notificationsPage;

  const href = getNotificationHref(notification);
  const Icon = getNotificationIcon(notification.type);
  const typeLabel = getTypeLabel(notification.type, t);

  function handleOpen() {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  }

  return (
    <article
      className={`rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        notification.is_read
          ? "border-slate-200"
          : "border-indigo-200 ring-4 ring-indigo-50"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            notification.is_read
              ? "bg-slate-100 text-slate-600"
              : "bg-indigo-50 text-indigo-700"
          }`}
        >
          <Icon size={23} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {typeLabel}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                notification.is_read
                  ? "bg-slate-100 text-slate-600"
                  : "bg-indigo-50 text-indigo-700"
              }`}
            >
              {notification.is_read
                ? t.read
                : t.unread}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-black text-slate-950">
            {notification.title ||
              t.notificationFallback}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {notification.message || t.noMessage}
          </p>

          {notification.metadata?.productTitle && (
            <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              {String(
                notification.metadata.productTitle
              )}
            </p>
          )}

          <p className="mt-3 text-xs font-medium text-slate-400">
            {formatLocalizedDateTime(
              notification.created_at,
              locale
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-end">
          {!notification.is_read && (
            <button
              type="button"
              onClick={() =>
                onMarkAsRead(notification.id)
              }
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              aria-label={t.unread}
              title={t.unread}
            >
              <CheckCircle2 size={17} />
            </button>
          )}

          <Link
            href={href}
            onClick={handleOpen}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            {t.open}
          </Link>
        </div>
      </div>
    </article>
  );
}

function getTypeLabel(
  type: string,
  t: {
    genericType: string;
    types: Record<string, string>;
  }
) {
  return t.types[type] ?? t.genericType;
}