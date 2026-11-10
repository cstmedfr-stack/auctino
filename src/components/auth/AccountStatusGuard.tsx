
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

import { AlertTriangle, Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useMessages } from "@/i18n/useMessages";

type AccountStatusGuardProps = {
  children: ReactNode;
};

type AccountStatus =
  | "checking"
  | "active"
  | "suspended"
  | "error";

type AccountState = {
  status: AccountStatus;
  authenticated: boolean;
};

const SUSPENDED_ROUTE = "/account-suspended";

export default function AccountStatusGuard({
  children,
}: AccountStatusGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const messages = useMessages();

  const consoleError =
    messages.guards.accountStatusConsoleError;

  const [account, setAccount] =
    useState<AccountState>({
      status: "checking",
      authenticated: false,
    });

  useEffect(() => {
    let mounted = true;
    let requestId = 0;
    let currentUserId: string | null = null;
    let initialized = false;

    let profileChannel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    function clearProfileChannel() {
      if (profileChannel) {
        void supabase.removeChannel(profileChannel);
        profileChannel = null;
      }
    }

    async function checkUser(
      userId: string | null
    ) {
      // Evitam verificari repetate pentru acelasi cont.
      if (
        initialized &&
        currentUserId === userId
      ) {
        return;
      }

      initialized = true;
      currentUserId = userId;

      const currentRequest = ++requestId;

      clearProfileChannel();

      if (!userId) {
        if (mounted) {
          setAccount({
            status: "active",
            authenticated: false,
          });
        }
        return;
      }

      setAccount({
        status: "checking",
        authenticated: true,
      });

      const { data, error } = await supabase
        .from("profiles")
        .select("account_status")
        .eq("id", userId)
        .maybeSingle();

      if (
        !mounted ||
        currentRequest !== requestId
      ) {
        return;
      }

      if (error) {
        console.warn(
          consoleError,
          error.message
        );

        setAccount({
          status: "error",
          authenticated: true,
        });
        return;
      }

      const status =
        data?.account_status === "suspended"
          ? "suspended"
          : "active";

      setAccount({
        status,
        authenticated: true,
      });

      // Monitorizam suspendarea si reactivarea contului.
      profileChannel = supabase
        .channel(`account-status-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            if (!mounted) return;

            const updatedProfile =
              payload.new as {
                account_status?: string | null;
              };

            const updatedStatus =
              updatedProfile.account_status ===
              "suspended"
                ? "suspended"
                : "active";

            setAccount({
              status: updatedStatus,
              authenticated: true,
            });
          }
        )
        .subscribe();
    }

    async function initialize() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error && user) {
        console.warn(
          consoleError,
          error.message
        );
      }

      await checkUser(user?.id ?? null);
    }

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Ignoram evenimentele care nu schimba contul.
        if (
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT"
        ) {
          void checkUser(
            session?.user?.id ?? null
          );
        }
      }
    );

    return () => {
      mounted = false;
      requestId += 1;
      subscription.unsubscribe();
      clearProfileChannel();
    };
  }, [consoleError]);

  // Redirectionarea este separata de verificarea contului.
  useEffect(() => {
    if (
      account.status === "checking" ||
      account.status === "error"
    ) {
      return;
    }

    if (
      account.status === "suspended" &&
      pathname !== SUSPENDED_ROUTE
    ) {
      router.replace(SUSPENDED_ROUTE);
      return;
    }

    if (
      account.status === "active" &&
      pathname === SUSPENDED_ROUTE
    ) {
      router.replace(
        account.authenticated
          ? "/dashboard"
          : "/login"
      );
    }
  }, [
    account.status,
    account.authenticated,
    pathname,
    router,
  ]);

  if (account.status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <AlertTriangle
            size={28}
            className="mx-auto mb-4 text-red-600"
          />
          <p className="font-semibold text-slate-700">
            Nu am putut verifica starea contului.
            Reîncarcă pagina pentru a încerca din nou.
          </p>
        </div>
      </main>
    );
  }

  const redirecting =
    (account.status === "suspended" &&
      pathname !== SUSPENDED_ROUTE) ||
    (account.status === "active" &&
      pathname === SUSPENDED_ROUTE);

  if (
    account.status === "checking" ||
    redirecting
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
