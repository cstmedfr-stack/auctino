"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Email sau parolă incorectă.");
      return;
    }

    router.push("/cont");
  }

  return (
    <Card className="w-full max-w-md p-8">
      <h1 className="mb-2 text-3xl font-extrabold text-slate-900">
        Login
      </h1>

      <p className="mb-8 text-slate-500">
        Intră în contul tău Vendora.
      </p>

      <form onSubmit={handleLogin} className="space-y-5">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="nume@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          id="password"
          label="Parolă"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm font-medium text-red-500">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Se conectează..." : "Login"}
        </Button>
      </form>
    </Card>
  );
}