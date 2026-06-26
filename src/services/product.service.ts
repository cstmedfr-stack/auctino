import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";

export async function getProducts() {
  return await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
}

export async function getProductById(id: string) {
  return await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
}

export async function getUserProducts(userId: string) {
  return await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at">
) {
  return await supabase
    .from("products")
    .insert(product);
}

export async function updateProduct(
  id: string,
  values: Partial<Product>
) {
  return await supabase
    .from("products")
    .update(values)
    .eq("id", id);
}

export async function deleteProduct(id: string) {
  return await supabase
    .from("products")
    .delete()
    .eq("id", id);
}