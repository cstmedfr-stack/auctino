import { supabase } from "@/lib/supabase";

export async function getProfile(userId: string) {
  return await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
}