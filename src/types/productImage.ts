export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  storage_path?: string | null;
  display_order: number;
  created_at: string;
}