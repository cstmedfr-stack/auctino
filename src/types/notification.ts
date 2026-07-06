export type NotificationType =
  | "new_bid"
  | "outbid"
  | "auction_won"
  | "auction_ended"
  | "new_message"
  | "transaction_created"
  | "transaction_confirmed"
  | "transaction_completed"
  | "transaction_cancelled"
  | "transaction_disputed"
  | "dispute_resolved"
  | "review_pending"
  | "review_received"
  | "product_reported"
  | "product_report_dismissed"
  | "product_report_removed"
  | "product_removed"
  | "account_suspended"
  | "account_reactivated"
  | "auction_extended"
 | "auction_ending_soon"
  | (string & {});

export interface Notification {
  id: string;
  user_id: string;

  product_id: string | null;
  conversation_id: string | null;
  transaction_id: string | null;

  title: string;
  message: string;
  type: NotificationType;

  is_read: boolean;
  created_at: string;
  event_key?: string | null;
}