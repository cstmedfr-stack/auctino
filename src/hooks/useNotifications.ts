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
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notification.service";

import { Notification } from "@/types/notification";

export function useNotifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);

  const channelInstanceId = useRef(
    Math.random().toString(36).slice(2)
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data, error } =
      await getUserNotifications(user.id);

    if (error) {
      console.error(
        "Eroare la încărcarea notificărilor:",
        error
      );

      setLoading(false);
      return;
    }

    setNotifications(
      (data ?? []) as Notification[]
    );

    setLoading(false);
  }, []);

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
      const { data, error } =
        await getUserNotifications(userId);

      if (!isActive) {
        return;
      }

      if (error) {
        console.error(
          "Eroare la actualizarea notificărilor:",
          error
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
              "Realtime pentru notificări nu este disponibil momentan. Se folosește actualizarea periodică."
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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      if (userError || !user) {
        setNotifications([]);
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
  }, []);

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.is_read
  ).length;

  const markAsRead = async (
    notificationId: string
  ) => {
    const { error } =
      await markNotificationAsRead(
        notificationId
      );

    if (error) {
      console.error(
        "Eroare la marcarea notificării:",
        error
      );

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error } =
      await markAllNotificationsAsRead(
        user.id
      );

    if (error) {
      console.error(
        "Eroare la marcarea tuturor notificărilor:",
        error
      );

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
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };
}