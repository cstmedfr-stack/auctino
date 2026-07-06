import { supabase } from "@/lib/supabase";

export type UpdateOwnProfileInput = {
  fullName: string | null;
  phone: string | null;
  city: string | null;
  avatarUrl: string | null;
};

export async function getProfile(
  userId: string
) {
  return await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
}

export async function updateOwnProfile({
  fullName,
  phone,
  city,
  avatarUrl,
}: UpdateOwnProfileInput) {
  return await supabase.rpc(
    "update_own_public_profile",
    {
      p_full_name: fullName,
      p_phone: phone,
      p_city: city,
      p_avatar_url: avatarUrl,
    }
  );
}