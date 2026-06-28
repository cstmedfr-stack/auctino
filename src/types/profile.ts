export interface Profile {
  id: string;

  email: string;

  full_name: string;

  avatar_url: string | null;

  city: string | null;

  phone_verified: boolean;

  identity_verified: boolean;

  trust_score: number;

  rating: number;

  reviews_count: number;

  sold_count: number;

  won_auctions: number;

  created_at: string;
}