"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import { Button } from "../ui/Button";
import { Container } from "./Container";

type UserInfo = {
  email: string;
  fullName: string | null;
};

export function Navbar() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setUser(null);
        return;
      }

      setUser({
        email: data.user.email ?? "",
        fullName: data.user.user_metadata?.full_name ?? null,
      });
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  }

  const initials =
    user?.fullName
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container>
        <div className="flex min-h-20 flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="text-3xl font-bold text-slate-900">
            Vendora
          </Link>

          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
            <Link href="/dashboard" className="hover:text-slate-900">
              Licitații
            </Link>

            <Link href="/my-products" className="hover:text-slate-900">
              Produsele mele
            </Link>

            <Link href="/favorites" className="hover:text-slate-900">
              Favorite
            </Link>

            <Link
              href="/add-product"
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Adaugă produs
            </Link>
          </nav>

          {!user ? (
            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>

              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/my-products">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    {initials}
                  </div>

                  <span className="hidden text-sm font-semibold text-slate-700 sm:block">
                    {user.fullName || user.email}
                  </span>
                </div>
              </Link>

              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}