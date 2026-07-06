export interface MyBidProduct {
  product_id: string;
  seller_id: string;

  title: string;
  description: string | null;
  image_url: string | null;
  location: string | null;

  starting_price: number;
  current_price: number | null;

  auction_end: string | null;
  status: string | null;
  winner_id: string | null;
  bid_count: number;

  my_highest_bid: number;
  highest_bid: number;
  last_bid_at: string;

  is_leading: boolean;
  is_winner: boolean;
}