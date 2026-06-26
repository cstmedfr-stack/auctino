export interface Product {
  id: string;
  user_id: string;

  title: string;
  description: string | null;

  category: string | null;
  condition: string | null;

  starting_price: number;
  current_price: number | null;

  location: string | null;

  image_url: string | null;

  status?: string;

  auction_start: string | null;
  auction_end: string | null;
  bid_count: number | null;
  winner_id: string | null;

  created_at: string;
}