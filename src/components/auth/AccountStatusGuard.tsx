"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useMessages } from "@/i18n/useMessages";

type AccountStatusGuardProps = {
  children: ReactNode;
};

type AccountStatus =
  | "active"
  | "suspended";

const SUSPENDED_ROUTE =
  "/account-suspended";

export default function AccountStatusGuard({
  children,
}: AccountStatusGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const messages = useMessages();

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

      await supabase.removeChannel(
        profileChannel
      );

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

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("account_status")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (profileError) {
        console.warn(
          messages.guards
            .accountStatusConsoleError,
          profileError.message
        );

        setCheckingAccount(false);
        return;
      }

      const accountStatus: AccountStatus =
        profile?.account_status ===
        "suspended"
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
            const updatedProfile =
              payload.new as {
                account_status?: string | null;
              };

            const updatedStatus: AccountStatus =
              updatedProfile.account_status ===
              "suspended"
                ? "suspended"
                : "active";

            applyAccountStatus(
              updatedStatus
            );
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
        void supabase.removeChannel(
          profileChannel
        );
      }
    };
  }, [pathname, router, messages.guards]);

  if (
    checkingAccount &&
    pathname !== SUSPENDED_ROUTE
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Loader2
              size={26}
              className="animate-spin"
            />
          </div>

          <p className="font-semibold text-slate-700">
            {
              messages.guards
                .checkingAccountStatus
            }
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}