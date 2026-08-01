"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export function useRedirectIfAuthenticated(
  redirectTo = "/dashboard"
) {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (session?.user) {
        router.replace(redirectTo);
        router.refresh();
        return;
      }

      setCheckingAuth(false);
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) {
          return;
        }

        if (session?.user) {
          router.replace(redirectTo);
          router.refresh();
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [redirectTo, router]);

  return {
    checkingAuth,
  };
}