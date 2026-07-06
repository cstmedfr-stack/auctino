"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "@/components/notifications/NotificationItem";

type NotificationFilter = "all" | "unread";

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] =
    useState<NotificationFilter>("all");

  const visibleNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter(
        (notification) => !notification.is_read
      );
    }

    return notifications;
  }, [notifications, filter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-slate-600">
            Se încarcă notificările...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-slate-600 hover:text-slate-950"        >
          ← Înapoi la licitații
        </Link>

        <section className="mt-6 rounded-3xl bg-slate-950 p-8 text-white">
          <p className="text-sm font-bold uppercase tracking-wide text-orange-400">
            Contul meu
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Notificări
          </h1>

          <p className="mt-3 text-slate-300">
             Urmărește ofertele, tranzacțiile, mesajele și
            recenziile primite.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-sm text-slate-300">
                Total
              </p>

              <p className="mt-1 text-3xl font-black">
                {notifications.length}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-sm text-slate-300">
                Necitite
              </p>

              <p className="mt-1 text-3xl font-black">
                {unreadCount}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-5 py-2 text-sm font-bold ${
                filter === "all"
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-600 shadow-sm"
              }`}
            >
              Toate
            </button>

            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-full px-5 py-2 text-sm font-bold ${
                filter === "unread"
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-600 shadow-sm"
              }`}
            >
              Necitite ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllAsRead()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-slate-50"
            >
              Marchează toate ca citite
            </button>
          )}
        </div>

        {visibleNotifications.length === 0 ? (
          <section className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-bold text-slate-900">
              {filter === "unread"
                ? "Nu ai notificări necitite."
                : "Nu ai notificări."}
            </p>

            <p className="mt-2 text-slate-500">
              Notificările despre licitații și tranzacții
              vor apărea aici.
            </p>
          </section>
        ) : (
          <section className="mt-8 space-y-3 rounded-3xl bg-white p-4 shadow-sm">
            {visibleNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}