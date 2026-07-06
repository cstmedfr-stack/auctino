export type AccountStatus = "active" | "suspended";

export type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "user" | "admin";
  account_status: AccountStatus;
  rating: number | string | null;
  suspension_reason: string | null;
  suspended_by: string | null;
  suspended_at: string | null;
  created_at: string;
  products_count: number;
  purchases_count: number;
  sales_count: number;
};