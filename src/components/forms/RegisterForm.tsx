"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { validateRegisterForm } from "@/utils/authValidation";

export function RegisterForm() {
  const router = useRouter();
  const messages = useMessages();
  const t = messages.auth.register;
  const validationMessages = messages.auth.validation;
  const [fullName, setFullName] =    useState("");
  const [email, setEmail] =    useState("");
  const [password, setPassword] =    useState("");
  const [loading, setLoading] =    useState(false);
  const [error, setError] =    useState("");
  const [success, setSuccess] =    useState("");

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);
    const validationError = validateRegisterForm(
  fullName,
  email,
  password,
  validationMessages
);

if (validationError) {
  setError(validationError);
  setLoading(false);
  return;
}

    const { error: registerError } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

    setLoading(false);

    if (registerError) {
      setError(t.genericError);
      return;
    }

    setSuccess(t.success);

    window.setTimeout(() => {
      router.push("/login");
    }, 2500);
  }

  return (
    <Card className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
          <UserPlus size={17} />
          {t.eyebrow}
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          {t.title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t.description}
        </p>
      </div>

      <form
        onSubmit={handleRegister}
        className="space-y-5"
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
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />
            {success}
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