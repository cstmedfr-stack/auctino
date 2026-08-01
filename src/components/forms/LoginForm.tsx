"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {  AlertTriangle,  Loader2,  LogIn,} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/i18n/useMessages";
import { validateLoginForm } from "@/utils/authValidation";

export function LoginForm() {
  const router = useRouter();
  const messages = useMessages();
  const t = messages.auth.login;
  const validationMessages = messages.auth.validation;
  const [email, setEmail] =    useState("");
  const [password, setPassword] =    useState("");
  const [error, setError] =    useState("");
  const [loading, setLoading] =    useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);
    const validationError = validateLoginForm(
  email,
  password,
  validationMessages
);

    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
}

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (loginError) {
      setError(t.invalidCredentials);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
          <LogIn size={17} />
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
        onSubmit={handleLogin}
        className="space-y-5"
      >
        <Input
          id="email"
          label={t.emailLabel}
          type="email"
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
        />

        <Input
          id="password"
          label={t.passwordLabel}
          type="password"
          placeholder={t.passwordPlaceholder}
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
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
            t.submit
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t.noAccount}{" "}
        <Link
          href="/register"
          className="font-bold text-indigo-700 hover:text-indigo-900"
        >
          {t.registerLink}
        </Link>
      </p>
    </Card>
  );
}