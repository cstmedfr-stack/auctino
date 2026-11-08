
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
} from "lucide-react";

import AuthPageShell from "@/components/forms/AuthPageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import {
  supabase,
  PASSWORD_RECOVERY_KEY,
} from "@/lib/supabase";

import { useMessages } from "@/i18n/useMessages";

// Indicatorul local expiră după 10 minute.
// Durata reală a linkului este controlată de Supabase.
const RECOVERY_MARKER_MAX_AGE = 10 * 60 * 1000;

function hasValidRecoveryMarker(
  userId: string
): boolean {
  try {
    const raw = window.sessionStorage.getItem(
      PASSWORD_RECOVERY_KEY
    );

    if (!raw) return false;

    const marker = JSON.parse(raw) as {
      userId?: string;
      createdAt?: number;
    };

    const age =
      Date.now() - (marker.createdAt ?? 0);

    return (
      marker.userId === userId &&
      age >= 0 &&
      age < RECOVERY_MARKER_MAX_AGE
    );
  } catch {
    return false;
  }
}

export default function ResetPasswordPage() {
  const messages = useMessages();

  const isFr =
    messages.auth.login.forgotPassword ===
    "Mot de passe oublié ?";

  const t = isFr
    ? {
        eyebrow: "Sécurité du compte",
        title: "Nouveau mot de passe",
        description:
          "Choisissez un nouveau mot de passe pour votre compte Vandivo.",
        password: "Nouveau mot de passe",
        confirm: "Confirmer le nouveau mot de passe",
        submit: "Enregistrer le mot de passe",
        loading: "Enregistrement...",
        checking: "Vérification du lien...",
        invalid:
          "Le lien est invalide ou expiré. Veuillez demander un nouveau lien.",
        mismatch:
          "Les mots de passe ne correspondent pas.",
        short:
          "Le mot de passe doit contenir au moins 8 caractères.",
        error:
          "Impossible de modifier le mot de passe. Veuillez réessayer.",
        success:
          "Votre mot de passe a été modifié avec succès.",
        login: "Retour à la connexion",
        retry: "Demander un nouveau lien",
      }
    : {
        eyebrow: "Securitatea contului",
        title: "Parolă nouă",
        description:
          "Alege o parolă nouă pentru contul tău Vandivo.",
        password: "Parolă nouă",
        confirm: "Confirmă parola nouă",
        submit: "Salvează parola nouă",
        loading: "Se salvează...",
        checking: "Verificăm linkul...",
        invalid:
          "Linkul este invalid sau expirat. Solicită un link nou.",
        mismatch: "Parolele nu coincid.",
        short:
          "Parola trebuie să conțină cel puțin 8 caractere.",
        error:
          "Nu am putut actualiza parola. Încearcă din nou.",
        success:
          "Parola a fost schimbată cu succes.",
        login: "Înapoi la autentificare",
        retry: "Solicită un link nou",
      };

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!active) return;

          if (
            event === "PASSWORD_RECOVERY" &&
            session?.user
          ) {
            setAllowed(true);
            setError("");
            setChecking(false);
          }

          if (event === "SIGNED_OUT") {
            setAllowed(false);
          }
        }
      );

    async function checkRecovery() {
      try {
        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (!active) return;

        if (
          !sessionError &&
          data.session?.user &&
          hasValidRecoveryMarker(
            data.session.user.id
          )
        ) {
          setAllowed(true);
          setError("");
        }
      } catch {
        // Linkul va fi considerat invalid
        // dacă nu există un eveniment sau
        // un indicator de recuperare valid.
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    void checkRecovery();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!allowed || loading || success) return;

    setError("");

    if (password.length < 8) {
      setError(t.short);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.mismatch);
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user = sessionData.session?.user;

      if (
        !user ||
        !hasValidRecoveryMarker(user.id)
      ) {
        setAllowed(false);
        setError(t.invalid);
        return;
      }

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        setError(t.error);
        return;
      }

      // Consumăm indicatorul de recuperare.
      window.sessionStorage.removeItem(
        PASSWORD_RECOVERY_KEY
      );

      setAllowed(false);
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      // După resetare, utilizatorul va
      // trebui să se autentifice din nou.
      await supabase.auth.signOut();
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell>
      <Card className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7">
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
            <KeyRound size={17} />
            {t.eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            {t.title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t.description}
          </p>
        </div>

        {checking ? (
          <div
            role="status"
            className="flex items-center gap-3 text-sm text-slate-600"
          >
            <Loader2
              size={20}
              className="animate-spin"
            />
            {t.checking}
          </div>
        ) : success ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            <CheckCircle2
              size={20}
              className="shrink-0"
            />
            {t.success}
          </div>
        ) : !allowed ? (
          <div className="space-y-4">
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
            >
              <AlertTriangle
                size={20}
                className="shrink-0"
              />
              {error || t.invalid}
            </div>

            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-indigo-700 hover:underline"
            >
              {t.retry}
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <Input
              id="new-password"
              type="password"
              label={t.password}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />

            <Input
              id="confirm-password"
              type="password"
              label={t.confirm}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              required
            />

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertTriangle
                  size={18}
                  className="shrink-0"
                />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  {t.loading}
                </span>
              ) : (
                t.submit
              )}
            </Button>
          </form>
        )}

        {(success || !allowed) && !checking && (
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-semibold text-indigo-700 hover:underline"
          >
            {t.login}
          </Link>
        )}
      </Card>
    </AuthPageShell>
  );
}
