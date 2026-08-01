"use client";

import { useMemo, useState } from "react";

import NotificationCard from "@/components/notifications/NotificationCard";
import NotificationFilters, {
  NotificationFilter,
} from "@/components/notifications/NotificationFilters";
import NotificationListState from "@/components/notifications/NotificationListState";
import NotificationPageHeader from "@/components/notifications/NotificationPageHeader";
import { useNotifications } from "@/hooks/useNotifications";
import { useMessages } from "@/i18n/useMessages";
import { getNotificationCategory } from "@/utils/notifications";

export default function NotificationsPage() {
  const messages = useMessages();
  const t = messages.notificationsPage;

  const {
    notifications,
    loading,
    error,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] =
    useState<NotificationFilter>("all");

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const categoryCounts = useMemo(() => {
    return notifications.reduce(
      (accumulator, notification) => {
        const category =
          getNotificationCategory(
            notification.type
          );

        accumulator.all += 1;

        if (!notification.is_read) {
          accumulator.unread += 1;
        }

        accumulator[category] += 1;

        return accumulator;
      },
      {
        all: 0,
        unread: 0,
        messages: 0,
        transactions: 0,
        auctions: 0,
        reviews: 0,
        reports: 0,
        account: 0,
      } satisfies Record<
        NotificationFilter,
        number
      >
    );
  }, [notifications]);

  const filterOptions = [
    {
      value: "all",
      label: t.filterAll,
      count: categoryCounts.all,
    },
    {
      value: "unread",
      label: t.filterUnread,
      count: categoryCounts.unread,
    },
    {
      value: "messages",
      label: t.filterMessages,
      count: categoryCounts.messages,
    },
    {
      value: "transactions",
      label: t.filterTransactions,
      count: categoryCounts.transactions,
    },
    {
      value: "auctions",
      label: t.filterAuctions,
      count: categoryCounts.auctions,
    },
    {
      value: "reviews",
      label: t.filterReviews,
      count: categoryCounts.reviews,
    },
    {
      value: "reports",
      label: t.filterReports,
      count: categoryCounts.reports,
    },
    {
      value: "account",
      label: t.filterAccount,
      count: categoryCounts.account,
    },
  ] as const;

  const visibleNotifications = useMemo(() => {
    const normalizedQuery =
      searchQuery.trim().toLowerCase();

    return notifications.filter(
      (notification) => {
        const matchesFilter =
          filter === "all"
            ? true
            : filter === "unread"
              ? !notification.is_read
              : getNotificationCategory(
                  notification.type
                ) === filter;

        if (!matchesFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const searchableText = [
          notification.title,
          notification.message,
          notification.type,
          notification.metadata?.productTitle,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedQuery
        );
      }
    );
  }, [
    notifications,
    filter,
    searchQuery,
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <NotificationPageHeader
          unreadCount={unreadCount}
          loading={loading}
          onMarkAllAsRead={() => {
            void markAllAsRead();
          }}
        />

        <NotificationFilters
          filter={filter}
          searchQuery={searchQuery}
          options={filterOptions}
          onFilterChange={setFilter}
          onSearchChange={setSearchQuery}
        />

        {loading ? (
          <NotificationListState type="loading" />
        ) : error ? (
          <NotificationListState
            type="error"
            message={error}
            onRetry={() => {
              void loadNotifications();
            }}
          />
        ) : notifications.length === 0 ? (
          <NotificationListState type="empty" />
        ) : visibleNotifications.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              {t.noResultsTitle}
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              {t.noResultsDescription}
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {visibleNotifications.map(
              (notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={(
                    notificationId
                  ) => {
                    void markAsRead(
                      notificationId
                    );
                  }}
                />
              )
            )}
          </section>
        )}
      </div>
    </main>
  );
}