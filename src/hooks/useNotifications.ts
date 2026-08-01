"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { useMessages } from "@/i18n/useMessages";

type LoadNotificationsOptions = {
  silent?: boolean;
};

export function useNotifications() {
  const messages = useMessages();
  const t = messages.notificationsPage;

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const channelInstanceId = useRef(
    Math.random().toString(36).slice(2)
  );

  const loadNotifications = useCallback(
    async (
      options?: LoadNotificationsOptions
    ) => {
      if (!options?.silent) {
        setLoading(true);
      }

      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setNotifications([]);
        setError(t.authRequired);
        setLoading(false);
        return;
      }

      const {
        data,
        error: notificationsError,
      } = await getUserNotifications(user.id);

      if (notificationsError) {
        console.error(
          t.loadError,
          notificationsError.message
        );

        setError(t.loadError);
        setLoading(false);
        return;
      }

      setNotifications(
        (data ?? []) as Notification[]
      );

      setLoading(false);
    },
    [t.authRequired, t.loadError]
  );

  useEffect(() => {
    let isActive = true;

    let channel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    let retryTimeout: number | null = null;
    let pollingInterval: number | null = null;
    let retryCount = 0;

    async function refreshNotifications(
      userId: string
    ) {
      const {
        data,
        error: refreshError,
      } = await getUserNotifications(userId);

      if (!isActive) {
        return;
      }

      if (refreshError) {
        console.error(
          t.updateError,
          refreshError.message
        );

        return;
      }

      setNotifications(
        (data ?? []) as Notification[]
      );

      setLoading(false);
    }

    async function removeCurrentChannel() {
      if (!channel) {
        return;
      }

      const oldChannel = channel;
      channel = null;

      await supabase.removeChannel(oldChannel);
    }

    async function subscribeToNotifications(
      userId: string
    ) {
      if (!isActive) {
        return;
      }

      await removeCurrentChannel();

      if (!isActive) {
        return;
      }

      const channelName = [
        "notifications",
        userId,
        channelInstanceId.current,
        Date.now(),
      ].join("-");

      const newChannel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (!isActive) {
              return;
            }

            const newNotification =
              payload.new as Notification;

            setNotifications(
              (previousNotifications) => {
                const alreadyExists =
                  previousNotifications.some(
                    (notification) =>
                      notification.id ===
                      newNotification.id
                  );

                if (alreadyExists) {
                  return previousNotifications;
                }

                return [
                  newNotification,
                  ...previousNotifications,
                ];
              }
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (!isActive) {
              return;
            }

            const updatedNotification =
              payload.new as Notification;

            setNotifications(
              (previousNotifications) =>
                previousNotifications.map(
                  (notification) =>
                    notification.id ===
                    updatedNotification.id
                      ? updatedNotification
                      : notification
                )
            );
          }
        );

      channel = newChannel;

      newChannel.subscribe((status) => {
        if (!isActive) {
          return;
        }

        if (status === "SUBSCRIBED") {
          retryCount = 0;
          return;
        }

        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT"
        ) {
          if (retryCount >= 3) {
            console.warn(
              t.realtimeUnavailable
            );

            return;
          }

          retryCount += 1;

          if (retryTimeout !== null) {
            window.clearTimeout(retryTimeout);
          }

          retryTimeout = window.setTimeout(
            () => {
              void subscribeToNotifications(
                userId
              );
            },
            retryCount * 3000
          );
        }
      });
    }

    async function initializeNotifications() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      if (userError || !user) {
        setNotifications([]);
        setError(t.authRequired);
        setLoading(false);
        return;
      }

      await refreshNotifications(user.id);

      if (!isActive) {
        return;
      }

      await subscribeToNotifications(user.id);

      pollingInterval = window.setInterval(
        () => {
          void refreshNotifications(user.id);
        },
        30000
      );
    }

    void initializeNotifications();

    return () => {
      isActive = false;

      if (retryTimeout !== null) {
        window.clearTimeout(retryTimeout);
      }

      if (pollingInterval !== null) {
        window.clearInterval(
          pollingInterval
        );
      }

      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [
    t.authRequired,
    t.realtimeUnavailable,
    t.updateError,
  ]);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const markAsRead = async (
    notificationId: string
  ) => {
    setError("");

    const { error: markError } =
      await markNotificationAsRead(
        notificationId
      );

    if (markError) {
      console.error(
        t.markReadError,
        markError.message
      );

      setError(t.markReadError);
      return;
    }

    setNotifications(
      (previousNotifications) =>
        previousNotifications.map(
          (notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification
        )
    );
  };

  const markAllAsRead = async () => {
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(t.authRequired);
      return;
    }

    const { error: markAllError } =
      await markAllNotificationsAsRead(
        user.id
      );

    if (markAllError) {
      console.error(
        t.markAllReadError,
        markAllError.message
      );

      setError(t.markAllReadError);
      return;
    }

    setNotifications(
      (previousNotifications) =>
        previousNotifications.map(
          (notification) => ({
            ...notification,
            is_read: true,
          })
        )
    );
  };

  return {
    notifications,
    loading,
    error,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };
}