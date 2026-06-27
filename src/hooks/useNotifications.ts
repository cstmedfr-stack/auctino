"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notification.service";

import { Notification } from "@/types/notification";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data, error } = await getUserNotifications(user.id);

    if (!error && data) {
      setNotifications(data as Notification[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      await loadNotifications();

      channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification;

            setNotifications((prev) => [
              newNotification,
              ...prev,
            ]);
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const markAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );
  };

  const markAllAsRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await markAllNotificationsAsRead(user.id);

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        is_read: true,
      }))
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