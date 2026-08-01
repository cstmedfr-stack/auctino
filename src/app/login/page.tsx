"use client";

import AuthLoadingState from "@/components/forms/AuthLoadingState";
import AuthPageShell from "@/components/forms/AuthPageShell";
import { LoginForm } from "@/components/forms/LoginForm";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";

export default function LoginPage() {
  const { checkingAuth } =
    useRedirectIfAuthenticated();

  return (
    <AuthPageShell>
      {checkingAuth ? (
        <AuthLoadingState />
      ) : (
        <LoginForm />
      )}
    </AuthPageShell>
  );
}