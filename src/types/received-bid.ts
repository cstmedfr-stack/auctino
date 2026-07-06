export interface ReceivedBidProduct {
  product_id: string;

  title: string;
  description: string | null;
  image_url: string | null;
  location: string | null;

  starting_price: number;
  current_price: number | null;

  auction_end: string | null;
  status: string | null;
  winner_id: string | null;

  total_bids: number;
  unique_bidders: number;
  highest_bid: number;
  last_bid_at: string;

  transaction_id: string | null;
  transaction_status: string | null;

  is_active: boolean;
  can_finalize: boolean;
}