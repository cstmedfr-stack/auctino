import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Flag,
  Gavel,
  MessageCircle,
  ShieldAlert,
  Star,
  UserX,
  XCircle,
} from "lucide-react";

import type {
  Notification,
  NotificationType,
} from "@/types/notification";

export type NotificationCategory =
  | "messages"
  | "transactions"
  | "auctions"
  | "reviews"
  | "reports"
  | "account";

export function getNotificationHref(
  notification: Notification
) {
  if (
    notification.type === "new_message" &&
    notification.conversation_id
  ) {
    return `/chat?conversation=${notification.conversation_id}`;
  }

  if (
    isTransactionNotification(notification.type) &&
    notification.product_id
  ) {
    return `/transactions/${notification.product_id}`;
  }

  if (notification.product_id) {
    return `/products/${notification.product_id}`;
  }

  return "/notifications";
}

export function getNotificationCategory(
  type: NotificationType
): NotificationCategory {
  if (type === "new_message") {
    return "messages";
  }

  if (isTransactionNotification(type)) {
    return "transactions";
  }

  if (isAuctionNotification(type)) {
    return "auctions";
  }

  if (isReviewNotification(type)) {
    return "reviews";
  }

  if (isReportNotification(type)) {
    return "reports";
  }

  return "account";
}

export function getNotificationIcon(
  type: NotificationType
): LucideIcon {
  if (type === "auction_ending_soon") {
    return Clock3;
  }

  if (isAuctionNotification(type)) {
    return Gavel;
  }

  if (type === "new_message") {
    return MessageCircle;
  }

  if (
    type === "transaction_cancelled" ||
    type === "product_removed"
  ) {
    return XCircle;
  }

  if (
    type === "transaction_disputed" ||
    type === "product_reported"
  ) {
    return ShieldAlert;
  }

  if (isTransactionNotification(type)) {
    return CheckCircle2;
  }

  if (isReviewNotification(type)) {
    return Star;
  }

  if (isReportNotification(type)) {
    return Flag;
  }

  if (
    type === "account_suspended" ||
    type === "account_reactivated"
  ) {
    return UserX;
  }

  return Bell;
}

export function isTransactionNotification(
  type: NotificationType
) {
  return [
    "transaction_created",
    "transaction_confirmed",
    "transaction_completed",
    "transaction_cancelled",
    "transaction_disputed",
    "dispute_resolved",
    "review_pending",
  ].includes(type);
}

export function isAuctionNotification(
  type: NotificationType
) {
  return [
    "new_bid",
    "outbid",
    "auction_won",
    "auction_ended",
    "auction_extended",
    "auction_ending_soon",
  ].includes(type);
}

export function isReviewNotification(
  type: NotificationType
) {
  return [
    "review_pending",
    "review_received",
  ].includes(type);
}

export function isReportNotification(
  type: NotificationType
) {
  return [
    "product_reported",
    "product_report_dismissed",
    "product_report_removed",
    "product_removed",
  ].includes(type);
}