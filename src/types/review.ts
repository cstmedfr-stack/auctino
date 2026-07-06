export type ReviewType = "seller" | "buyer";

export type Review = {
  id: string;
  transaction_id: string | null;
  product_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  review_type: "seller" | "buyer";
  rating: number;
  communication: number | null;
  accuracy: number | null;
  comment: string | null;
  created_at: string;
  is_published: boolean;
};