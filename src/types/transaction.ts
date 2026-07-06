export type TransactionStatus =
  | "pending_confirmation"
  | "completed"
  | "cancelled"
  | "disputed";

export type Transaction = {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string;
  final_price: number;
  status: TransactionStatus;

  seller_confirmed: boolean;
  buyer_confirmed: boolean;
  seller_confirmed_at: string | null;
  buyer_confirmed_at: string | null;

  completed_at: string | null;

  cancelled_by: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;

  disputed_by: string | null;
  dispute_reason: string | null;
  disputed_at: string | null;
  dispute_resolved_by: string | null;
dispute_resolution: "completed" | "cancelled" | null;
dispute_resolution_reason: string | null;
dispute_resolved_at: string | null;

  created_at: string;
  updated_at: string;
};

export type AdminDispute = {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string;
  final_price: number;
  status: "disputed";
  dispute_reason: string | null;
  disputed_by: string | null;
  disputed_at: string | null;
  created_at: string;
  product_title: string;
  product_image_url: string | null;
  seller_name: string;
  buyer_name: string;
};