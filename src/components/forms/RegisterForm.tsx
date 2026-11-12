
"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  UserPlus,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { validateRegisterForm } from "@/utils/authValidation";

export function RegisterForm() {
  const messages = useMessages();
  const t = messages.auth.register;
  const { locale } = useLocale();
  const validationMessages = messages.auth.validation;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isFrench = locale === "fr";

  const registrationSuccessMessage = isFrench
    ? "Si cette adresse peut être enregistrée, vous recevrez un email de confirmation. Si vous avez déjà un compte, connectez-vous ou réinitialisez votre mot de passe."
    : "Dacă adresa poate fi înregistrată, vei primi un email de confirmare. Dacă ai deja cont, autentifică-te sau recuperează parola.";

  const existingAccountMessage = isFrench
    ? "Cette adresse email est déjà enregistrée. Connectez-vous ou utilisez l'option « Mot de passe oublié ? »."
    : "Această adresă de email este deja înregistrată. Autentifică-te sau folosește opțiunea « Ai uitat parola? ».";

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading || success) {
      return;
    }

    setError("");
    setSuccess("");

    const validationError = validateRegisterForm(
      fullName,
      email,
      password,
      validationMessages
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const { error: registerError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

      if (registerError) {
        const errorMessage =
          registerError.message.toLowerCase();

        const existingAccount =
          registerError.code === "user_already_exists" ||
          registerError.code === "email_exists" ||
          errorMessage.includes("already registered") ||
          errorMessage.includes("already exists");

        setError(
          existingAccount
            ? existingAccountMessage
            : t.genericError
        );

        return;
      }

      // Supabase poate ascunde existenta unui cont
      // deja inregistrat. Nu afirmam ca un cont
      // nou a fost creat fara confirmare.
      setSuccess(registrationSuccessMessage);
    } catch (err) {
      console.error("Registration error:", err);
      setError(t.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full min-w-0 max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-7">
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
          <UserPlus size={17} />
          {t.eyebrow}
        </p>

        <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
          {t.title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t.description}
        </p>

        {/* Mesaj gratuitate RO / FR */}
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={22}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div className="min-w-0">
              <p className="text-sm font-bold text-emerald-900">
                {isFrench
                  ? "Votre compte Vandivo est gratuit !"
                  : "Contul Vandivo este gratuit!"}
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-800">
                {isFrench
                  ? "Inscrivez-vous gratuitement pour vendre ou participer aux enchères, sans frais de plateforme pendant cette phase."
                  : "Înregistrează-te gratuit și începe să vinzi sau să participi la licitații, fără taxe din partea platformei în această etapă."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleRegister}
        className="w-full min-w-0 space-y-5"
      >
        <Input
          id="name"
          label={t.fullNameLabel}
          placeholder={t.fullNamePlaceholder}
          value={fullName}
          onChange={(event) =>
            setFullName(event.target.value)
          }
          required
        />

        <Input
          id="email"
          type="email"
          label={t.emailLabel}
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
        />

        <Input
          id="password"
          type="password"
          label={t.passwordLabel}
          placeholder={t.passwordPlaceholder}
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
          minLength={6}
        />

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span className="min-w-0 break-words">
              {error}
            </span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
          >
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span className="min-w-0 break-words">
              {success}
            </span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || Boolean(success)}
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
            t.submit
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link
          href="/forgot-password"
          className="font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
        >
          {isFrench
            ? "Mot de passe oublié ?"
            : "Ai uitat parola?"}
        </Link>
      </p>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t.alreadyHaveAccount}{" "}
        <Link
          href="/login"
          className="font-bold text-indigo-700 hover:text-indigo-900"
        >
          {t.loginLink}
        </Link>
      </p>
    </Card>
  );
}
