"use client";

import Link from "next/link";
import { Notification } from "@/types/notification";

type NotificationItemProps = {
  notification: Notification;
  onRead: (
    notificationId: string
  ) => void;
};

function getNotificationStyle(
  type: Notification["type"]
) {
  switch (type) {
    case "new_bid":
      return "bg-blue-50 text-blue-600";

    case "outbid":
      return "bg-orange-50 text-orange-600";

    case "auction_won":
      return "bg-green-50 text-green-600";

    case "auction_ended":
      return "bg-red-50 text-red-600";

    case "new_message":
      return "bg-purple-50 text-purple-600";

    case "transaction_created":
      return "bg-blue-50 text-blue-600";

    case "transaction_confirmed":
      return "bg-amber-50 text-amber-700";

    case "transaction_completed":
      return "bg-emerald-50 text-emerald-700";

    case "transaction_cancelled":
      return "bg-red-50 text-red-700";

    case "transaction_disputed":
      return "bg-amber-50 text-amber-800";

    case "dispute_resolved":
      return "bg-emerald-50 text-emerald-700";

    case "review_pending":
      return "bg-amber-50 text-amber-700";

    case "review_received":
      return "bg-yellow-50 text-yellow-700";

    case "product_reported":
      return "bg-red-50 text-red-700";

    case "product_report_dismissed":
      return "bg-green-50 text-green-700";

    case "product_report_removed":
      return "bg-emerald-50 text-emerald-700";

    case "product_removed":
      return "bg-red-100 text-red-800";

    case "account_suspended":
      return "bg-red-100 text-red-800";

    case "account_reactivated":
      return "bg-green-100 text-green-800";

    case "auction_extended":
      return "bg-indigo-50 text-indigo-700";

    case "auction_ending_soon":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-slate-50 text-slate-600";
  }
}

function getNotificationIcon(
  type: Notification["type"]
) {
  switch (type) {
    case "new_bid":
      return "💰";

    case "outbid":
      return "⚠️";

    case "auction_won":
      return "🏆";

    case "auction_ended":
      return "⏳";

    case "new_message":
      return "💬";

    case "transaction_created":
      return "🤝";

    case "transaction_confirmed":
      return "✅";

    case "transaction_completed":
      return "🎉";

    case "transaction_cancelled":
      return "❌";

    case "transaction_disputed":
      return "⚠️";

    case "dispute_resolved":
      return "🛡️";

    case "review_pending":
      return "⭐";

    case "review_received":
      return "🌟";

    case "product_reported":
      return "🚩";

    case "product_report_dismissed":
      return "✅";

    case "product_report_removed":
      return "🗑️";

    case "product_removed":
      return "⛔";

    case "account_suspended":
      return "⛔";

    case "account_reactivated":
      return "✅";

    case "auction_extended":
      return "⏱️";

    case "auction_ending_soon":
      return "⏰";

    default:
      return "🔔";
  }
}

function getNotificationHref(
  notification: Notification
): string | null {
  if (
    notification.type ===
    "account_suspended"
  ) {
    return "/account-suspended";
  }

  if (
    notification.type ===
    "account_reactivated"
  ) {
    return "/dashboard";
  }

  if (
    notification.type ===
    "product_reported"
  ) {
    return "/admin/reports";
  }

  if (
    notification.conversation_id
  ) {
    return `/chat?conversation=${notification.conversation_id}`;
  }

  /*
   * Notificarea automată trimisă vânzătorului
   * folosește tipul auction_ended.
   *
   * Dacă are transaction_id, licitația a avut
   * câștigător și deschidem tranzacția.
   */
  if (
    notification.type ===
      "auction_ended" &&
    notification.transaction_id &&
    notification.product_id
  ) {
    return `/transactions/${notification.product_id}`;
  }

  const transactionTypes: Notification["type"][] =
    [
      "auction_won",
      "transaction_created",
      "transaction_confirmed",
      "transaction_completed",
      "transaction_cancelled",
      "transaction_disputed",
      "review_pending",
      "review_received",
      "dispute_resolved",
    ];

  if (
    transactionTypes.includes(
      notification.type
    ) &&
    notification.product_id
  ) {
    return `/transactions/${notification.product_id}`;
  }

  const productTypes: Notification["type"][] =
    [
      "new_bid",
      "outbid",
      "auction_ended",
      "product_report_dismissed",
      "product_report_removed",
      "product_removed",
      "auction_extended",
      "auction_ending_soon",
    ];

  if (
    productTypes.includes(
      notification.type
    ) &&
    notification.product_id
  ) {
    return `/products/${notification.product_id}`;
  }

  if (notification.product_id) {
    return `/products/${notification.product_id}`;
  }

  return null;
}

export default function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const href =
    getNotificationHref(notification);

  function handleRead() {
    if (!notification.is_read) {
      onRead(notification.id);
    }
  }

  const content = (
    <div
      className={`rounded-2xl p-4 transition hover:bg-slate-100 ${
        notification.is_read
          ? "bg-white"
          : "bg-slate-50"
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getNotificationStyle(
            notification.type
          )}`}
        >
          {getNotificationIcon(
            notification.type
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {notification.title}
          </p>

          <p className="mt-1 text-sm leading-5 text-slate-600">
            {notification.message}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {new Date(
              notification.created_at
            ).toLocaleString("ro-RO", {
              timeZone:
                "Europe/Bucharest",
            })}
          </p>
        </div>

        {!notification.is_read && (
          <span
            className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500"
            title="Notificare necitită"
          />
        )}
      </div>
    </div>
  );

  if (!href) {
    return (
      <button
        type="button"
        onClick={handleRead}
        className="block w-full cursor-pointer text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="block"
      onClick={handleRead}
    >
      {content}
    </Link>
  );
}