export interface Product {
  id: string;
  user_id: string;

  title: string;
  description: string | null;

  category: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  condition: string | null;
market_code: "RO" | "FR";
  starting_price: number;
  current_price: number | null;

  location: string | null;
  image_url: string | null;

  status?: string | null;

  auction_start: string | null;
  auction_end: string | null;
  bid_count: number | null;
  winner_id: string | null;

  created_at: string;

  removed_by?: string | null;
  removal_reason?: string | null;
  removed_at?: string | null;

  categories?: {
    id: string;
    name_ro: string;
    icon: string | null;
  } | null;

  subcategories?: {
    id: string;
    name_ro: string;
  } | null;
}