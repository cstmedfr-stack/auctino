"use client";

import { useEffect, useState } from "react";
import { getPublicProfile } from "@/services/publicProfile.service";
import { Profile } from "@/types/profile";

export function usePublicProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);

      const { data, error } = await getPublicProfile(userId);

      if (error) {
        console.error(error.message);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    loadProfile();
  }, [userId]);

  return {
    profile,
    loading,
  };
}