"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useMessages } from "@/i18n/useMessages";

type AdminGuardProps = {
  children: ReactNode;
};

export default function AdminGuard({
  children,
}: AdminGuardProps) {
  const router = useRouter();
  const messages = useMessages();

  const [checkingRole, setCheckingRole] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyAdminRole() {
      setCheckingRole(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        setIsAdmin(false);
        setCheckingRole(false);
        router.replace("/login");
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role, account_status")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        console.warn(
          messages.guards
            .adminRoleConsoleError,
          profileError.message
        );

        setIsAdmin(false);
        setCheckingRole(false);
        router.replace("/dashboard");
        return;
      }

      if (
        profile?.account_status ===
        "suspended"
      ) {
        setIsAdmin(false);
        setCheckingRole(false);
        router.replace(
          "/account-suspended"
        );
        return;
      }

      if (profile?.role !== "admin") {
        setIsAdmin(false);
        setCheckingRole(false);
        router.replace("/dashboard");
        return;
      }

      setIsAdmin(true);
      setCheckingRole(false);
    }

    void verifyAdminRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        if (!cancelled) {
          void verifyAdminRole();
        }
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router, messages.guards]);

  if (checkingRole) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Loader2
              size={26}
              className="animate-spin"
            />
          </div>

          <p className="font-semibold text-slate-700">
            {
              messages.guards
                .checkingAdminAccess
            }
          </p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}