"use client";

import { Bell } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type NotificationBellProps = {
  unreadCount: number;
  onClick: () => void;
};

export default function NotificationBell({
  unreadCount,
  onClick,
}: NotificationBellProps) {
  const messages = useMessages();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={messages.navbar.notifications}
      title={messages.navbar.notifications}
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600"
    >
      <Bell size={19} />

      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
}