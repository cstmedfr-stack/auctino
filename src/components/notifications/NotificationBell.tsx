"use client";

type NotificationBellProps = {
  unreadCount: number;
  onClick: () => void;
};

export default function NotificationBell({
  unreadCount,
  onClick,
}: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-xl border border-slate-200 bg-white px-4 py-2 text-lg hover:bg-slate-50"
    >
      🔔

      {unreadCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
}