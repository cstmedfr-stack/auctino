export interface Review {
  id: string;
  product_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}