"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useLocale } from "@/i18n/LocaleProvider";
import { useMessages } from "@/i18n/useMessages";
import { formatLocalizedDateTime } from "@/i18n/format";

type SuspensionInfo = {
  reason: string | null;
  suspendedAt: string | null;
};

export default function AccountSuspendedPage() {
  const router = useRouter();
  const messages = useMessages();
  const { locale } = useLocale();
  const t = messages.accountSuspended;

  const [
    suspensionInfo,
    setSuspensionInfo,
  ] = useState<SuspensionInfo>({
    reason: null,
    suspendedAt: null,
  });

  const [checking, setChecking] =
    useState(true);

  const [
    statusMessage,
    setStatusMessage,
  ] = useState("");

  const checkAccountStatus = useCallback(
    async (showMessage = false) => {
      setChecking(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "account_status, suspension_reason, suspended_at"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.warn(
          "Suspended account check failed:",
          profileError.message
        );

        setStatusMessage(t.verifyError);
        setChecking(false);
        return;
      }

      if (
        profile?.account_status !== "suspended"
      ) {
        router.replace("/dashboard");
        return;
      }

      setSuspensionInfo({
        reason:
          profile.suspension_reason ?? null,
        suspendedAt:
          profile.suspended_at ?? null,
      });

      if (showMessage) {
        setStatusMessage(t.stillSuspended);
      }

      setChecking(false);
    },
    [
      router,
      t.stillSuspended,
      t.verifyError,
    ]
  );

  useEffect(() => {
    let profileChannel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    let statusInterval: number | null = null;

    async function initializePage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      await checkAccountStatus();

      profileChannel = supabase
        .channel(
          `suspended-page-profile-${user.id}`
        )
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
                suspension_reason?: string | null;
                suspended_at?: string | null;
              };

            if (
              updatedProfile.account_status !==
              "suspended"
            ) {
              router.replace("/dashboard");
              return;
            }

            setSuspensionInfo({
              reason:
                updatedProfile.suspension_reason ??
                null,
              suspendedAt:
                updatedProfile.suspended_at ?? null,
            });
          }
        )
        .subscribe();

      statusInterval = window.setInterval(
        () => {
          void checkAccountStatus(false);
        },
        15000
      );
    }

    void initializePage();

    return () => {
      if (profileChannel) {
        void supabase.removeChannel(
          profileChannel
        );
      }

      if (statusInterval !== null) {
        window.clearInterval(statusInterval);
      }
    };
  }, [checkAccountStatus, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const formattedSuspensionDate =
    suspensionInfo.suspendedAt
      ? formatLocalizedDateTime(
          suspensionInfo.suspendedAt,
          locale
        )
      : null;

  return (
    <main className="min-h-[75vh] bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <section className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-xl">
          <div className="bg-red-700 px-8 py-10 text-center text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
              <ShieldAlert size={42} />
            </div>

            <h1 className="mt-5 text-3xl font-black">
              {t.title}
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-red-100">
              {t.description}
            </p>
          </div>

          <div className="space-y-6 p-8">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-red-700">
                {t.reasonTitle}
              </p>

              <p className="mt-3 whitespace-pre-wrap text-slate-800">
                {suspensionInfo.reason ||
                  t.fallbackReason}
              </p>

              {formattedSuspensionDate && (
                <p className="mt-4 text-sm text-slate-600">
                  {t.suspendedAt}:{" "}
                  <span className="font-semibold">
                    {formattedSuspensionDate}
                  </span>
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
              {t.limitation}
            </div>

            {statusMessage && (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                {statusMessage}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  void checkAccountStatus(true)
                }
                disabled={checking}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                <RefreshCcw
                  size={17}
                  className={
                    checking
                      ? "animate-spin"
                      : ""
                  }
                />
                {checking
                  ? t.checking
                  : t.checkAgain}
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleLogout();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut size={17} />
                {t.logout}
              </button>
            </div>

            <p className="text-center text-xs text-slate-500">
              {t.autoCheck}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}