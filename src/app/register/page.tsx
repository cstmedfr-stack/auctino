"use client";

import AuthLoadingState from "@/components/forms/AuthLoadingState";
import AuthPageShell from "@/components/forms/AuthPageShell";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";

export default function RegisterPage() {
  const { checkingAuth } =
    useRedirectIfAuthenticated();

  return (
    <AuthPageShell>
      {checkingAuth ? (
        <AuthLoadingState />
      ) : (
        <RegisterForm />
      )}
    </AuthPageShell>
  );
}