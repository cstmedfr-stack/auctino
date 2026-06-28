"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import { Button } from "../ui/Button";
import { Container } from "./Container";
import { useNotifications } from "@/hooks/useNotifications";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

import NotificationBell from "@/components/notifications/NotificationBell";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

type UserInfo = {
  email: string;
  fullName: string | null;
};

export function Navbar() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const { unreadCount: unreadMessages } = useUnreadMessages();

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
            <div className="relative flex flex-wrap items-center gap-3">
              <Link
                href="/chat"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100"
              >
                <span className="text-xl">💬</span>

                {unreadMessages > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadMessages}
                  </span>
                )}
              </Link>

              <NotificationBell
                unreadCount={unreadCount}
                onClick={() => setShowNotifications((prev) => !prev)}
              />

              {showNotifications && (
                <NotificationDropdown
                  notifications={notifications}
                  onRead={markAsRead}
                  onMarkAllRead={markAllAsRead}
                />
              )}

              <div ref={profileMenuRef} className="relative">
                <button
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 transition hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    {initials}
                  </div>

                  <span className="hidden font-semibold text-slate-700 sm:block">
                    {user.fullName || user.email}
                  </span>

                  <span
                    className={`text-slate-400 transition-transform ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {user.fullName || "Utilizator Vendora"}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      className="block px-6 py-4 hover:bg-slate-50"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      👤 Profilul meu
                    </Link>

                    <Link
                      href="/my-products"
                      className="block px-6 py-4 hover:bg-slate-50"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      📦 Produsele mele
                    </Link>

                    <Link
                      href="/favorites"
                      className="block px-6 py-4 hover:bg-slate-50"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      ❤️ Favorite
                    </Link>

                    <Link
                      href="/chat"
                      className="block px-6 py-4 hover:bg-slate-50"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      💬 Mesaje
                    </Link>

                    <div className="border-t border-slate-200" />

                    <button
                      className="w-full px-6 py-4 text-left text-slate-500 hover:bg-slate-50"
                      disabled
                    >
                      ⚙️ Setări — în curând
                    </button>

                    <button
                      className="w-full px-6 py-4 text-left text-slate-500 hover:bg-slate-50"
                      disabled
                    >
                      🔐 Securitate — în curând
                    </button>

                    <div className="border-t border-slate-200" />

                    <button
                      onClick={handleLogout}
                      className="w-full px-6 py-4 text-left font-semibold text-red-600 hover:bg-red-50"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}