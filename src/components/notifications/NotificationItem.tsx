"use client";

import Link from "next/link";
import { Notification } from "@/types/notification";

type NotificationItemProps = {
  notification: Notification;
  onRead: (notificationId: string) => void;
};

function getNotificationStyle(type: Notification["type"]) {
  switch (type) {
    case "new_bid":
      return "bg-blue-50 text-blue-600";
    case "outbid":
      return "bg-orange-50 text-orange-600";
    case "auction_won":
      return "bg-green-50 text-green-600";
    case "auction_ended":
      return "bg-red-50 text-red-600";
    default:
      return "bg-slate-50 text-slate-600";
  }
}

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "new_bid":
      return "💰";
    case "outbid":
      return "⚠️";
    case "auction_won":
      return "🏆";
    case "auction_ended":
      return "⏳";
    default:
      return "🔔";
  }
}

export default function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const content = (
    <div
      onClick={() => onRead(notification.id)}
      className={`cursor-pointer rounded-2xl p-4 transition hover:bg-slate-50 ${
        notification.is_read ? "bg-white" : "bg-slate-50"
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getNotificationStyle(
            notification.type
          )}`}
        >
          {getNotificationIcon(notification.type)}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            {notification.title}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {notification.message}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {new Date(notification.created_at).toLocaleString("ro-RO")}
          </p>
        </div>
      </div>
    </div>
  );

  if (notification.product_id) {
    return (
      <Link href={`/products/${notification.product_id}`}>
        {content}
      </Link>
    );
  }

  return content;
}