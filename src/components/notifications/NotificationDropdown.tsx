"use client";

import Link from "next/link";
import NotificationItem from "./NotificationItem";
import { Notification } from "@/types/notification";

type NotificationDropdownProps = {
  notifications: Notification[];
  onRead: (id: string) => void;
  onMarkAllRead: () => void;
};

export default function NotificationDropdown({
  notifications,
  onRead,
  onMarkAllRead,
}: NotificationDropdownProps) {
  return (
    <div className="absolute right-0 top-14 z-50 w-96 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-bold text-slate-900">
          Notificări
        </h3>

        {notifications.length > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Marchează toate
          </button>
        )}
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nu ai notificări.
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={onRead}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-3">
        <Link
          href="/notifications"
          className="block rounded-xl px-4 py-3 text-center text-sm font-bold text-blue-600 hover:bg-slate-50"
        >
          Vezi toate notificările
        </Link>
      </div>
    </div>
  );
}