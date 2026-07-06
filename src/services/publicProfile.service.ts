import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/profile";

export async function getPublicProfile(
  userId: string
) {
  const { data, error } = await supabase.rpc(
    "get_public_profile",
    {
      p_user_id: userId,
    }
  );

  return {
    data: (data as Profile | null) ?? null,
    error,
  };
}

export async function getPublicProfiles(
  userIds: string[]
) {
  if (userIds.length === 0) {
    return {
      data: [] as Profile[],
      error: null,
    };
  }

  const { data, error } = await supabase.rpc(
    "get_public_profiles",
    {
      p_user_ids: userIds,
    }
  );

  return {
    data: Array.isArray(data)
      ? (data as Profile[])
      : [],
    error,
  };
}