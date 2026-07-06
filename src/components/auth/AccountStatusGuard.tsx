"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AccountStatusGuardProps = {
  children: ReactNode;
};

type AccountStatus = "active" | "suspended";

const SUSPENDED_ROUTE = "/account-suspended";

export default function AccountStatusGuard({
  children,
}: AccountStatusGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [checkingAccount, setCheckingAccount] =
    useState(true);

  useEffect(() => {
    let isMounted = true;

    let profileChannel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    function applyAccountStatus(
      accountStatus: AccountStatus
    ) {
      if (!isMounted) return;

      if (
        accountStatus === "suspended" &&
        pathname !== SUSPENDED_ROUTE
      ) {
        router.replace(SUSPENDED_ROUTE);
        return;
      }

      if (
        accountStatus === "active" &&
        pathname === SUSPENDED_ROUTE
      ) {
        router.replace("/dashboard");
      }
    }

    async function removeProfileChannel() {
      if (!profileChannel) return;

      await supabase.removeChannel(profileChannel);
      profileChannel = null;
    }

    async function checkAccountStatus() {
      if (isMounted) {
        setCheckingAccount(true);
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError || !user) {
        await removeProfileChannel();

        if (pathname === SUSPENDED_ROUTE) {
          router.replace("/login");
        }

        setCheckingAccount(false);
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("account_status")
          .eq("id", user.id)
          .maybeSingle();

      if (!isMounted) return;

      if (profileError) {
        console.error(
          "Eroare la verificarea statutului contului:",
          profileError.message
        );

        setCheckingAccount(false);
        return;
      }

      const accountStatus: AccountStatus =
        profile?.account_status === "suspended"
          ? "suspended"
          : "active";

      applyAccountStatus(accountStatus);

      await removeProfileChannel();

      profileChannel = supabase
        .channel(`account-status-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            const updatedProfile = payload.new as {
              account_status?: string | null;
            };

            const updatedStatus: AccountStatus =
              updatedProfile.account_status ===
              "suspended"
                ? "suspended"
                : "active";

            applyAccountStatus(updatedStatus);
          }
        )
        .subscribe();

      setCheckingAccount(false);
    }

    void checkAccountStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        void checkAccountStatus();
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();

      if (profileChannel) {
        void supabase.removeChannel(profileChannel);
      }
    };
  }, [pathname, router]);

  if (
    checkingAccount &&
    pathname !== SUSPENDED_ROUTE
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-black" />

          <p className="font-semibold text-slate-700">
            Se verifică starea contului...
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}