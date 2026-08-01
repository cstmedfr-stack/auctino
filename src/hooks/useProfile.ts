"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { getProfile } from "@/services/profile.service";
import { useMessages } from "@/i18n/useMessages";
import type { Profile } from "@/types/profile";

export function useProfile() {
  const messages = useMessages();
  const t = messages.accountProfile.overview;

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [userId, setUserId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadProfile = useCallback(
    async () => {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setUserId("");
        setProfile(null);
        setError(t.authRequired);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const {
        data,
        error: profileError,
      } = await getProfile(user.id);

      if (profileError || !data) {
        console.error(
          t.loadError,
          profileError?.message
        );

        setProfile(null);
        setError(t.loadError);
        setLoading(false);
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    },
    [t.authRequired, t.loadError]
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return {
    profile,
    userId,
    loading,
    error,
    refreshProfile: loadProfile,
  };
}