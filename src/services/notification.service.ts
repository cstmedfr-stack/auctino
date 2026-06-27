import { supabase } from "@/lib/supabase";

export type NotificationType =
  | "new_bid"
  | "outbid"
  | "auction_won"
  | "auction_ended";

export async function createNotification({
  userId,
  productId,
  title,
  message,
  type,
}: {
  userId: string;
  productId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
}) {
  return await supabase.from("notifications").insert({
    user_id: userId,
    product_id: productId,
    title,
    message,
    type,
    is_read: false,
  });
}

export async function getUserNotifications(userId: string) {
  return await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function markNotificationAsRead(notificationId: string) {
  return await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
}

export async function markAllNotificationsAsRead(userId: string) {
  return await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId);
}