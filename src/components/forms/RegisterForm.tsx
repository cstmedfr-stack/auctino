"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Cont creat cu succes! Verifică emailul pentru confirmare.");

    setTimeout(() => {
      router.push("/login");
    }, 2500);
  }

  return (
    <Card className="w-full max-w-md p-8">
      <h1 className="mb-2 text-3xl font-extrabold text-slate-900">
        Creează un cont
      </h1>

      <p className="mb-8 text-slate-500">
        Începe să vinzi și să licitezi pe Vendora.
      </p>

      <form onSubmit={handleRegister} className="space-y-5">
        <Input
          id="name"
          label="Nume complet"
          placeholder="Nume și prenume"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="nume@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          id="password"
          type="password"
          label="Parolă"
          placeholder="Minimum 6 caractere"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        {success && (
          <p className="text-sm font-medium text-green-600">{success}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Se creează contul..." : "Creează cont"}
        </Button>
      </form>
    </Card>
  );
}