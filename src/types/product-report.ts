export type ProductReportStatus =
  | "open"
  | "dismissed"
  | "removed";

export type AdminProductReport = {
  id: string;
  product_id: string;
  reporter_id: string;
  reason: string;
  status: ProductReportStatus;
  created_at: string;

  product_title: string;
  product_image_url: string | null;
  product_price: number | string | null;
  product_status: string | null;

  seller_id: string;
  seller_name: string;

  reporter_name: string;
  reporter_email: string | null;
};