"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AdminGuardProps = {
  children: ReactNode;
};

export default function AdminGuard({
  children,
}: AdminGuardProps) {
  const router = useRouter();

  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role, account_status")
          .eq("id", user.id)
          .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        console.error(
          "Eroare la verificarea rolului de administrator:",
          profileError.message
        );

        setIsAdmin(false);
        setCheckingRole(false);
        router.replace("/dashboard");
        return;
      }

      if (profile?.account_status === "suspended") {
        setIsAdmin(false);
        setCheckingRole(false);
        router.replace("/account-suspended");
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
  }, [router]);

  if (checkingRole) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-amber-600" />

          <p className="font-semibold text-slate-700">
            Se verifică accesul de administrator...
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