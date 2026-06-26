"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  verification_level: string | null;
  is_verified: boolean | null;
};

export function AccountDashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccount() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      setEmail(userData.user.email ?? "");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    }

    loadAccount();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return <p className="text-slate-500">Se încarcă...</p>;
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-500">
            Contul meu
          </p>

          <h1 className="text-4xl font-extrabold text-slate-900">
            Bun venit, {profile?.full_name || "utilizator"} 👋
          </h1>
        </div>

        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Profil
          </h2>

          <div className="space-y-4 text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Email:</span>{" "}
              {email}
            </p>

            <p>
              <span className="font-semibold text-slate-900">Nume:</span>{" "}
              {profile?.full_name || "Necompletat"}
            </p>

            <p>
              <span className="font-semibold text-slate-900">Telefon:</span>{" "}
              {profile?.phone || "Necompletat"}
            </p>

            <p>
              <span className="font-semibold text-slate-900">Oraș:</span>{" "}
              {profile?.city || "Necompletat"}
            </p>

            <div className="pt-2">
              <Badge variant={profile?.is_verified ? "success" : "accent"}>
                Nivel verificare: {profile?.verification_level || "email"}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Activitatea ta
          </h2>

          <div className="grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              Produsele mele
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              Licitațiile mele
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              Favorite
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}