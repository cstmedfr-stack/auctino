
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
} from "lucide-react";

import AuthPageShell from "@/components/forms/AuthPageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { useMessages } from "@/i18n/useMessages";

export default function ForgotPasswordPage() {
  const messages = useMessages();

  const isFr =
    messages.auth.login.forgotPassword ===
    "Mot de passe oublié ?";

  const t = isFr
    ? {
        eyebrow: "Récupération du compte",
        title: "Mot de passe oublié ?",
        description:
          "Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.",
        email: "Adresse e-mail",
        placeholder: "votre@email.fr",
        submit: "Envoyer le lien",
        submitting: "Envoi en cours...",
        success:
          "Si un compte est associé à cette adresse, vous recevrez un e-mail avec les instructions de réinitialisation.",
        error:
          "Impossible d'envoyer la demande pour le moment. Veuillez réessayer.",
        back: "Retour à la connexion",
      }
    : {
        eyebrow: "Recuperare cont",
        title: "Ai uitat parola?",
        description:
          "Introdu adresa de e-mail asociată contului tău pentru a primi un link de resetare.",
        email: "Adresă de e-mail",
        placeholder: "email@exemplu.ro",
        submit: "Trimite linkul de resetare",
        submitting: "Se trimite...",
        success:
          "Dacă există un cont asociat acestei adrese, vei primi un e-mail cu instrucțiunile pentru resetarea parolei.",
        error:
          "Nu am putut trimite cererea momentan. Te rugăm să încerci din nou.",
        back: "Înapoi la autentificare",
      };

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSent(false);
    setLoading(true);

    try {
      const redirectTo =
        `${window.location.origin}/reset-password`;

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo }
        );

      if (resetError) {
        setError(t.error);
        return;
      }

      setSent(true);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell>
      <Card className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
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

        {sent ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            <CheckCircle2
              size={20}
              className="shrink-0"
            />
            <p>{t.success}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <Input
              id="email"
              type="email"
              label={t.email}
              placeholder={t.placeholder}
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
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
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  {t.submitting}
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <Mail size={17} />
                  {t.submit}
                </span>
              )}
            </Button>
          </form>
        )}

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
        >
          <ArrowLeft size={16} />
          {t.back}
        </Link>
      </Card>
    </AuthPageShell>
  );
}
