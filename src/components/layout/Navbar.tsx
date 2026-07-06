"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { supabase } from "@/lib/supabase";

import { Button } from "../ui/Button";
import { Container } from "./Container";

import { useNotifications } from "@/hooks/useNotifications";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

import NotificationBell from "@/components/notifications/NotificationBell";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

type UserInfo = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "user" | "admin";
  accountStatus: "active" | "suspended";
};
export function Navbar() {
  const [user, setUser] =
    useState<UserInfo | null>(null);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    showProfileMenu,
    setShowProfileMenu,
  ] = useState(false);

  const [search, setSearch] = useState("");

  const profileMenuRef =
    useRef<HTMLDivElement | null>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const { unreadCount: unreadMessages } =
    useUnreadMessages();

   const pathname = usePathname();
  useEffect(() => {
  let cancelled = false;

  async function loadUser() {
    const {
      data: { user: authenticatedUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (cancelled) return;

    if (userError || !authenticatedUser) {
      setUser(null);
      setShowNotifications(false);
      setShowProfileMenu(false);
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
       .select(  "full_name, avatar_url, role, account_status")
        .eq("id", authenticatedUser.id)
        .maybeSingle();

    if (cancelled) return;

    if (profileError) {
      console.error(
        "Eroare la încărcarea profilului din Navbar:",
        profileError.message
      );
    }

    const accountStatus: "active" | "suspended" =
      profile?.account_status === "suspended"
        ? "suspended"
        : "active";

    setUser({
  id: authenticatedUser.id,

  email:
    authenticatedUser.email ?? "",

  fullName:
    profile?.full_name ??
    authenticatedUser.user_metadata
      ?.full_name ??
    null,

  avatarUrl:
    profile?.avatar_url ?? null,

  role:
    profile?.role === "admin"
      ? "admin"
      : "user",

  accountStatus,
});

    if (accountStatus === "suspended") {
      setShowNotifications(false);
      setShowProfileMenu(false);
    }
  }

  void loadUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    window.setTimeout(() => {
      if (!cancelled) {
        void loadUser();
      }
    }, 0);
  });

  return () => {
    cancelled = true;
    subscription.unsubscribe();
  };
}, [pathname]);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    setUser(null);

    window.location.href = "/login";
  }
 
  function handleSearchSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      window.location.href = "/dashboard";
      return;
    }

    window.location.href =
      `/dashboard?search=${encodeURIComponent(
        query
      )}`;
  }

  const initials =
    user?.fullName
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const isSuspended =
    user?.accountStatus === "suspended";

 

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <Container>
        <div className="flex min-h-20 flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={
                isSuspended
                  ? "/account-suspended"
                  : "/"
              }
              className="text-3xl font-extrabold tracking-tight text-slate-900"
            >
              Vendora
            </Link>

            {!isSuspended && (
              <Link
                href="/add-product"
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 xl:hidden"
              >
                Vinde
              </Link>
            )}
          </div>

          {!isSuspended && (
            <>
              <form
                onSubmit={handleSearchSubmit}
                className="flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2"
              >
                <span className="text-lg">
                  🔍
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Caută produse, categorii, orașe..."
                  className="w-full bg-transparent text-sm outline-none"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Caută
                </button>
              </form>

              <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
                <Link
                  href="/dashboard"
                  className="hover:text-slate-900"
                >
                  Toate licitațiile
                </Link>

                <Link
                  href="/categories"
                  className="hover:text-slate-900"
                >
                  Categorii
                </Link>

                <Link
                  href="/add-product"
                  className="hidden rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 xl:inline-block"
                >
                  Vinde un produs
                </Link>
              </nav>
            </>
          )}

          {!user ? (
            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <Button variant="outline">
                  Login
                </Button>
              </Link>

              <Link href="/register">
                <Button>
                  Register
                </Button>
              </Link>
            </div>
          ) : isSuspended ? (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/account-suspended"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700"
              >
                ⛔ Cont suspendat
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                🚪 Logout
              </button>
            </div>
          ) : (
            <div className="relative flex flex-wrap items-center gap-3">
              <Link
                href="/favorites"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100"
                title="Favorite"
              >
                ❤️
              </Link>

              <Link
                href="/chat"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100"
                title="Mesaje"
              >
                <span className="text-xl">
                  💬
                </span>

                {unreadMessages > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadMessages}
                  </span>
                )}
              </Link>

              <NotificationBell
                unreadCount={unreadCount}
                onClick={() =>
                  setShowNotifications(
                    (previous) => !previous
                  )
                }
              />

              {showNotifications && (
                <NotificationDropdown
                  notifications={notifications}
                  onRead={markAsRead}
                  onMarkAllRead={
                    markAllAsRead
                  }
                />
              )}

              <div
                ref={profileMenuRef}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowProfileMenu(
                      (previous) => !previous
                    )
                  }
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 transition hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={
                          user.fullName ||
                          "Imagine profil"
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <span className="hidden max-w-40 truncate font-semibold text-slate-700 sm:block">
                    {user.fullName ||
                      user.email}
                  </span>

                  <span
                    className={`text-slate-400 transition-transform ${
                      showProfileMenu
                        ? "rotate-180"
                        : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {user.fullName ||
                          "Utilizator Vendora"}
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {user.email}
                      </p>
                    </div>

                    <Link
                        href={`/users/${user.id}`}
                        className="block px-6 py-4 hover:bg-slate-50"
                        onClick={() =>
                          setShowProfileMenu(false)
                        }
                      >
                        👤 Vezi profilul public
                      </Link>

                      <Link
                        href="/account/profile"
                        className="block px-6 py-4 hover:bg-slate-50"
                        onClick={() =>
                          setShowProfileMenu(false)
                        }
                      >
                        ✏️ Editează profilul
                      </Link>

                    <Link
                      href="/my-products"
                      className="block px-6 py-4 hover:bg-slate-50"
                      onClick={() =>
                        setShowProfileMenu(false)
                      }
                    >
                      📦 Produsele mele
                    </Link>

                    <Link
                      href="/transactions"
                      className="block px-6 py-4 hover:bg-slate-50"
                      onClick={() =>
                        setShowProfileMenu(false)
                      }
                    >
                      🤝 Tranzacțiile mele
                    </Link>
                    <Link
                    href="/my-bids"
                    className="block px-6 py-4 hover:bg-slate-50"
                    onClick={() =>
                      setShowProfileMenu(false)
                    }>
                    💰 Ofertele mele
                  </Link>

                  <Link
                  href="/received-bids"
                  className="block px-6 py-4 hover:bg-slate-50"
                  onClick={() =>
                    setShowProfileMenu(false)
                  }
                >
                  📥 Oferte primite
                </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="block bg-amber-50 px-6 py-4 font-semibold text-amber-900 hover:bg-amber-100"
                        onClick={() =>
                          setShowProfileMenu(
                            false
                          )
                        }
                      >
                        🛡️ Panou administrare
                      </Link>
                    )}

                    <Link
                      href="/favorites"
                      className="block px-6 py-4 hover:bg-slate-50"
                      onClick={() =>
                        setShowProfileMenu(false)
                      }
                    >
                      ❤️ Favorite
                    </Link>

                    <Link
                      href="/chat"
                      className="block px-6 py-4 hover:bg-slate-50"
                      onClick={() =>
                        setShowProfileMenu(false)
                      }
                    >
                      💬 Mesaje
                    </Link>

                    <div className="border-t border-slate-200" />

                    <Link
                    href="/account/profile"
                    className="block px-6 py-4 text-slate-700 hover:bg-slate-50"
                    onClick={() =>
                      setShowProfileMenu(false)
                    }
                  >
                    ⚙️ Setările profilului
                    </Link>

                    <div className="border-t border-slate-200" />

                    <button
                      type="button"
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