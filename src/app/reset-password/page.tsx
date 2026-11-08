
"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { supabase } from "@/lib/supabase";
import { useMessages } from "@/i18n/useMessages";

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
        confirm: "Confirmer le mot de passe",
        submit: "Enregistrer le mot de passe",
        loading: "Enregistrement...",
        checking: "Vérification du lien...",
        invalid:
          "Le lien est invalide, expiré ou a déjà été utilisé. Demandez un nouveau lien.",
        mismatch: "Les mots de passe ne correspondent pas.",
        short: "Le mot de passe doit contenir au moins 8 caractères.",
        error:
          "Impossible de modifier le mot de passe. Veuillez réessayer.",
        success: "Votre mot de passe a été modifié avec succès.",
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
          "Linkul este invalid, expirat sau a fost deja folosit. Solicită un link nou.",
        mismatch: "Parolele nu coincid.",
        short: "Parola trebuie să conțină cel puțin 8 caractere.",
        error:
          "Nu am putut actualiza parola. Încearcă din nou.",
        success: "Parola a fost schimbată cu succes.",
        login: "Înapoi la autentificare",
        retry: "Solicită un link nou",
      };

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    // Supabase emite PASSWORD_RECOVERY când linkul
    // de recuperare a fost verificat cu succes.
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        if (!active) return;

        if (event === "PASSWORD_RECOVERY" && session) {
          setAllowed(true);
          setChecking(false);
          setError("");
        }
      });

    // Pentru fluxul implicit, linkul conține
    // inițial type=recovery în fragmentul URL.
    const hash = new URLSearchParams(
      window.location.hash.replace(/^#/, "")
    );

    const isRecoveryLink =
      hash.get("type") === "recovery";

    // Supabase poate procesa linkul înainte ca pagina
    // să termine inițializarea. Verificăm sesiunea
    // numai dacă URL-ul conține un link de recovery.
    if (isRecoveryLink) {
      supabase.auth.getSession().then(({ data, error }) => {
        if (!active) return;
        if (!error && data.session) {
          setAllowed(true);
        }
        setChecking(false);
      }).catch(() => {
        if (active) setChecking(false);
      });
    } else {
      // Permitem timp inițializării evenimentului de
      // recuperare înainte să declarăm linkul invalid.
      supabase.auth.getSession().finally(() => {
        if (active) setChecking(false);
      });
    }

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
      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        setError(t.error);
        return;
      }

      setSuccess(true);
      setAllowed(false);
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

        {checking && !allowed ? (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Loader2 size={20} className="animate-spin" />
            {t.checking}
          </div>
        ) : success ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            <CheckCircle2 size={20} className="shrink-0" />
            {t.success}
          </div>
        ) : !allowed ? (
          <div
            role="alert"
            className="space-y-4"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle size={20} className="shrink-0" />
              {t.invalid}
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
                setConfirmPassword(event.target.value)
              }
              required
            />

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertTriangle size={18} className="shrink-0" />
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
