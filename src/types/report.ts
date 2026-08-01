export type ModerationDecision =
  | "dismiss"
  | "remove";

export type AdminProductReport = {
  id: string;
  product_id: string;
  product_title: string;
  product_image_url: string | null;
  product_status: string | null;
  product_price: number | string | null;

  seller_id: string;
  seller_name: string | null;

  reporter_name: string | null;
  reporter_email: string | null;

  reason: string;
  created_at: string | null;
};