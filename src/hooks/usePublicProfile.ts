"use client";

import {
  useEffect,
  useState,
} from "react";
import { getPublicProfile } from "@/services/publicProfile.service";
import { Profile } from "@/types/profile";

export function usePublicProfile(
  userId: string
) {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    if (!userId) {
      setProfile(null);
      setError("");
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      const {
        data,
        error: profileError,
      } = await getPublicProfile(userId);

      if (!isMounted) {
        return;
      }

      if (profileError) {
        console.error(
          profileError.message
        );

        setProfile(null);
        setError(
          profileError.message
        );
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return {
    profile,
    loading,
    error,
  };
}