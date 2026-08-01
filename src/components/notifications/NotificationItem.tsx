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

type NotificationItemProps = {
  notification: Notification;
  onRead: (id: string) => void;
};

export default function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const messages = useMessages();
  const { locale } = useLocale();
  const t = messages.notificationsPage;

  const href = getNotificationHref(notification);
  const Icon = getNotificationIcon(notification.type);

 const notificationTypeLabels =
  t.types as Record<string, string>;

const typeLabel =
  notificationTypeLabels[notification.type] ??
  t.genericType;

  function handleClick() {
    if (!notification.is_read) {
      onRead(notification.id);
    }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`block rounded-2xl border p-4 transition hover:bg-slate-50 ${
        notification.is_read
          ? "border-slate-100 bg-white"
          : "border-indigo-100 bg-indigo-50/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            notification.is_read
              ? "bg-slate-100 text-slate-600"
              : "bg-white text-indigo-700"
          }`}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-black text-slate-950">
                {notification.title ||
                  t.notificationFallback}
              </p>

              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                {notification.message || t.noMessage}
              </p>
            </div>

            {!notification.is_read && (
              <span
                aria-label={t.unread}
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600"
              />
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
              {typeLabel}
            </span>

            <span className="text-[11px] font-medium text-slate-400">
              {formatLocalizedDateTime(
                notification.created_at,
                locale
              )}
            </span>

            {notification.is_read && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 size={13} />
                {t.read}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}