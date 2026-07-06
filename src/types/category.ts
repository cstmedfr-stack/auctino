export type Category = {
  id: string;
  name_ro: string;
  name_fr: string | null;
  slug: string;
  icon: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export type Subcategory = {
  id: string;
  category_id: string;
  name_ro: string;
  name_fr: string | null;
  slug: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
};