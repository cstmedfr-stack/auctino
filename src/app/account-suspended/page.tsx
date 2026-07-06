"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SuspensionInfo = {
  reason: string | null;
  suspendedAt: string | null;
};

export default function AccountSuspendedPage() {
  const router = useRouter();

  const [suspensionInfo, setSuspensionInfo] =
    useState<SuspensionInfo>({
      reason: null,
      suspendedAt: null,
    });

  const [checking, setChecking] = useState(true);
  const [statusMessage, setStatusMessage] =
    useState("");

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

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select(
            "account_status, suspension_reason, suspended_at"
          )
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) {
        console.error(
          "Eroare la verificarea suspendării:",
          profileError.message
        );

        setStatusMessage(
          "Nu am putut verifica momentan starea contului."
        );

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
        setStatusMessage(
          "Contul este încă suspendat."
        );
      }

      setChecking(false);
    },
    [router]
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

      statusInterval = window.setInterval(() => {
        void checkAccountStatus(false);
      }, 15000);
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
      ? new Date(
          suspensionInfo.suspendedAt
        ).toLocaleString("ro-RO", {
          timeZone: "Europe/Bucharest",
        })
      : null;

  return (
    <main className="min-h-[75vh] bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <section className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-xl">
          <div className="bg-red-700 px-8 py-10 text-center text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-4xl">
              ⛔
            </div>

            <h1 className="mt-5 text-3xl font-black">
              Cont suspendat
            </h1>

            <p className="mt-3 text-red-100">
              Accesul la funcțiile platformei Vendora
              este momentan restricționat.
            </p>
          </div>

          <div className="space-y-6 p-8">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-red-700">
                Motivul suspendării
              </p>

              <p className="mt-3 whitespace-pre-wrap text-slate-800">
                {suspensionInfo.reason ||
                  "Administratorul nu a furnizat un motiv suplimentar."}
              </p>

              {formattedSuspensionDate && (
                <p className="mt-4 text-sm text-slate-600">
                  Suspendat la:{" "}
                  <span className="font-semibold">
                    {formattedSuspensionDate}
                  </span>
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
              Cât timp contul este suspendat, nu
              poți publica produse, licita, trimite
              mesaje, modifica tranzacții, publica
              recenzii sau raporta produse.
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
                className="rounded-xl bg-black px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {checking
                  ? "Se verifică..."
                  : "Verifică din nou"}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
              >
                🚪 Deconectare
              </button>
            </div>

            <p className="text-center text-xs text-slate-500">
              Pagina verifică automat starea contului.
              După reactivare vei fi redirecționat în
              aplicație.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}