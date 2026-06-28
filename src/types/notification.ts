export type NotificationType =
  | "new_bid"
  | "outbid"
  | "auction_won"
  | "auction_ended"
  | "new_message";

export interface Notification {
  id: string;

  user_id: string;
  product_id: string | null;
  conversation_id: string | null;

  title: string;
  message: string;

  type: NotificationType;

  is_read: boolean;

  created_at: string;
}