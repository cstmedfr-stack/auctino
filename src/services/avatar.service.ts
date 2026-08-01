import { supabase } from "@/lib/supabase";

const MAX_AVATAR_SIZE = 3 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function uploadOwnAvatar(file: File) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error("avatar_invalid_type");
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("avatar_oversized");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("avatar_auth_required");
  }

  const storagePath = `${user.id}/avatar`;

  const { error: uploadError } =
    await supabase.storage
      .from("avatars")
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } =
    supabase.storage
      .from("avatars")
      .getPublicUrl(storagePath);

  const avatarUrl =
    `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { data, error } = await supabase.rpc(
    "set_own_avatar",
    {
      p_avatar_url: avatarUrl,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    data,
    avatarUrl,
  };
}

export async function deleteOwnAvatar() {
  const { data: storagePath, error } =
    await supabase.rpc("remove_own_avatar");

  if (error) {
    throw new Error(error.message);
  }

  if (storagePath) {
    const { error: storageError } =
      await supabase.storage
        .from("avatars")
        .remove([storagePath as string]);

    if (storageError) {
      console.warn(
        "Avatar profile record removed but storage file deletion failed:",
        storageError.message
      );
    }
  }

  return true;
}