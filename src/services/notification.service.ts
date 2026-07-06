import { supabase } from "@/lib/supabase";

export async function getUserNotifications(
  userId: string
) {
  return await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });
}

export async function markNotificationAsRead(
  notificationId: string
) {
  return await supabase.rpc(
    "mark_own_notification_as_read",
    {
      p_notification_id: notificationId,
    }
  );
}

export async function markAllNotificationsAsRead(
  userId: string
) {
  /*
   * Păstrăm parametrul pentru compatibilitate cu
   * componentele existente. RPC-ul folosește auth.uid().
   */
  void userId;

  return await supabase.rpc(
    "mark_all_own_notifications_as_read"
  );
}