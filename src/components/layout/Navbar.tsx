"use client";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ban,
  ChevronDown,
  Heart,
  Inbox,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Pencil,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  User,
  Wallet,
  Handshake,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Button } from "../ui/Button";
import { Container } from "./Container";
import { useNotifications } from "@/hooks/useNotifications";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import NotificationBell from "@/components/notifications/NotificationBell";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useMessages } from "@/i18n/useMessages";

type UserInfo = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "user" | "admin";
  accountStatus: "active" | "suspended";
};

export function Navbar() {
  const messages = useMessages();
  const pathname = usePathname();

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

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
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

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "full_name, avatar_url, role, account_status"
        )
        .eq("id", authenticatedUser.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        console.error(
          "Navbar profile load failed:",
          profileError.message
        );
      }

      const accountStatus:
        | "active"
        | "suspended" =
        profile?.account_status === "suspended"
          ? "suspended"
          : "active";

      setUser({
        id: authenticatedUser.id,
        email: authenticatedUser.email ?? "",
        fullName:
          profile?.full_name ??
          authenticatedUser.user_metadata
            ?.full_name ??
          null,
        avatarUrl: profile?.avatar_url ?? null,
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
    setMobileMenuOpen(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <Container>
        <div className="py-3">
          <div className="flex min-h-12 items-center justify-between gap-3">
            <Link
  href={
    isSuspended
      ? "/account-suspended"
      : "/"
  }
  className="inline-flex items-center"
  aria-label="Auctino"
>
  <Image
    src="/images/auctino-logo.png"
    alt="Auctino"
    width={180}
    height={64}
    priority
    className="h-12 w-auto object-contain sm:h-14"
  />
</Link>

            <div className="hidden items-center gap-3 xl:flex">
              {!user ? (
                <>
                  <LanguageSwitcher />

                  <Link href="/login">
                    <Button variant="outline">
                      {messages.navbar.login}
                    </Button>
                  </Link>

                  <Link href="/register">
                    <Button>
                      {messages.navbar.register}
                    </Button>
                  </Link>
                </>
              ) : isSuspended ? (
                <>
                  <LanguageSwitcher />

                  <Link
                    href="/account-suspended"
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700"
                  >
                    <Ban size={16} />
                    {messages.navbar.suspendedAccount}
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <LogOut size={16} />
                    {messages.navbar.logout}
                  </button>
                </>
              ) : (
                <>
                  <LanguageSwitcher />

                  <IconLink
                    href="/favorites"
                    title={
                      messages.navbar.favorites
                    }
                  >
                    <Heart size={19} />
                  </IconLink>

                  <Link
                    href="/chat"
                    className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600"
                    title={messages.navbar.messages}
                  >
                    <MessageCircle size={19} />

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
                      onMarkAllRead={markAllAsRead}
                    />
                  )}

                  <ProfileMenu
                    user={user}
                    initials={initials}
                    showProfileMenu={
                      showProfileMenu
                    }
                    setShowProfileMenu={
                      setShowProfileMenu
                    }
                    profileMenuRef={
                      profileMenuRef
                    }
                    onLogout={handleLogout}
                  />
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  (previous) => !previous
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm xl:hidden"
            >
              {mobileMenuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>

          {!isSuspended && (
            <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(320px,640px)_auto] xl:items-center xl:justify-between">
              <form
                onSubmit={handleSearchSubmit}
                className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 sm:px-4"
              >
                <Search
                  size={18}
                  className="shrink-0 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder={
                    messages.navbar.searchPlaceholder
                  }
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:px-4"
                >
                  {messages.navbar.search}
                </button>
              </form>

              <nav className="hidden items-center gap-3 text-sm font-medium text-slate-600 xl:flex">
                <Link
                  href="/dashboard"
                  className="rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  {messages.navbar.allAuctions}
                </Link>

                <Link
                  href="/categories"
                  className="rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  {messages.navbar.categories}
                </Link>

                <Link
                  href="/add-product"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <PlusCircle size={16} />
                  {messages.navbar.sellProduct}
                </Link>
              </nav>
            </div>
          )}

          {mobileMenuOpen && (
            <MobileMenu
              user={user}
              isSuspended={isSuspended}
              unreadMessages={unreadMessages}
              unreadNotifications={unreadCount}
              onLogout={handleLogout}
            />
          )}
        </div>
      </Container>
    </header>
  );
}

function ProfileMenu({
  user,
  initials,
  showProfileMenu,
  setShowProfileMenu,
  profileMenuRef,
  onLogout,
}: {
  user: UserInfo;
  initials: string;
  showProfileMenu: boolean;
  setShowProfileMenu: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  profileMenuRef: React.RefObject<HTMLDivElement | null>;
  onLogout: () => void;
}) {
  const messages = useMessages();

  return (
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
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm transition hover:bg-slate-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={
                user.fullName ||
                messages.navbar.profileImage
              }
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <span className="hidden max-w-40 truncate font-semibold text-slate-700 sm:block">
          {user.fullName || user.email}
        </span>

        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${
            showProfileMenu ? "rotate-180" : ""
          }`}
        />
      </button>

      {showProfileMenu && (
        <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <ProfileMenuContent
            user={user}
            onClose={() =>
              setShowProfileMenu(false)
            }
            onLogout={onLogout}
          />
        </div>
      )}
    </div>
  );
}

function ProfileMenuContent({
  user,
  onClose,
  onLogout,
}: {
  user: UserInfo;
  onClose: () => void;
  onLogout: () => void;
}) {
  const messages = useMessages();

  return (
    <>
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="font-bold text-slate-900">
          {user.fullName ||
            messages.navbar.defaultUser}
        </p>

        <p className="mt-1 truncate text-sm text-slate-500">
          {user.email}
        </p>
      </div>

      <ProfileMenuLink
        href={`/users/${user.id}`}
        icon={<User size={17} />}
        onClick={onClose}
      >
        {messages.navbar.publicProfile}
      </ProfileMenuLink>

      <ProfileMenuLink
        href="/account/profile"
        icon={<Pencil size={17} />}
        onClick={onClose}
      >
        {messages.navbar.editProfile}
      </ProfileMenuLink>

      <ProfileMenuLink
        href="/my-products"
        icon={<Package size={17} />}
        onClick={onClose}
      >
        {messages.navbar.myProducts}
      </ProfileMenuLink>

      <ProfileMenuLink
        href="/transactions"
        icon={<Handshake size={17} />}
        onClick={onClose}
      >
        {messages.navbar.myTransactions}
      </ProfileMenuLink>

      <ProfileMenuLink
        href="/my-bids"
        icon={<Wallet size={17} />}
        onClick={onClose}
      >
        {messages.navbar.myBids}
      </ProfileMenuLink>

      <ProfileMenuLink
        href="/received-bids"
        icon={<Inbox size={17} />}
        onClick={onClose}
      >
        {messages.navbar.receivedBids}
      </ProfileMenuLink>

      {user.role === "admin" && (
        <ProfileMenuLink
          href="/admin"
          icon={<ShieldCheck size={17} />}
          onClick={onClose}
          className="bg-amber-50 font-semibold text-amber-900 hover:bg-amber-100"
        >
          {messages.navbar.adminPanel}
        </ProfileMenuLink>
      )}

      <ProfileMenuLink
        href="/favorites"
        icon={<Heart size={17} />}
        onClick={onClose}
      >
        {messages.navbar.favorites}
      </ProfileMenuLink>

      <ProfileMenuLink
        href="/chat"
        icon={<MessageCircle size={17} />}
        onClick={onClose}
      >
        {messages.navbar.messages}
      </ProfileMenuLink>

      <div className="border-t border-slate-200" />

      <ProfileMenuLink
        href="/account/profile"
        icon={<Settings size={17} />}
        onClick={onClose}
      >
        {messages.navbar.profileSettings}
      </ProfileMenuLink>

      <div className="border-t border-slate-200" />

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 px-6 py-4 text-left font-semibold text-red-600 transition hover:bg-red-50"
      >
        <LogOut size={17} />
        {messages.navbar.logout}
      </button>
    </>
  );
}

function MobileMenu({
  user,
  isSuspended,
  unreadMessages,
  unreadNotifications,
  onLogout,
}: {
  user: UserInfo | null;
  isSuspended: boolean;
  unreadMessages: number;
  unreadNotifications: number;
  onLogout: () => void;
}) {
  const messages = useMessages();

  return (
    <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70 xl:hidden">
      <div className="mb-3 flex justify-end">
        <LanguageSwitcher />
      </div>

      {!user ? (
        <div className="grid gap-2">
          <MobileMenuLink href="/dashboard">
            {messages.navbar.allAuctions}
          </MobileMenuLink>

          <MobileMenuLink href="/categories">
            {messages.navbar.categories}
          </MobileMenuLink>

          <MobileMenuLink href="/login">
            {messages.navbar.login}
          </MobileMenuLink>

          <MobileMenuLink href="/register" primary>
            {messages.navbar.register}
          </MobileMenuLink>
        </div>
      ) : isSuspended ? (
        <div className="grid gap-2">
          <MobileMenuLink
            href="/account-suspended"
            danger
          >
            {messages.navbar.suspendedAccount}
          </MobileMenuLink>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-700"
          >
            {messages.navbar.logout}
          </button>
        </div>
      ) : (
        <div className="grid gap-2">
          <MobileMenuLink href="/dashboard">
            {messages.navbar.allAuctions}
          </MobileMenuLink>

          <MobileMenuLink href="/categories">
            {messages.navbar.categories}
          </MobileMenuLink>

          <MobileMenuLink href="/add-product" primary>
            {messages.navbar.sellProduct}
          </MobileMenuLink>

          <MobileMenuLink href="/favorites">
            {messages.navbar.favorites}
          </MobileMenuLink>

          <MobileMenuLink href="/chat">
            {messages.navbar.messages}
            {unreadMessages > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {unreadMessages}
              </span>
            )}
          </MobileMenuLink>

          <MobileMenuLink href="/notifications">
            {messages.navbar.notifications}
            {unreadNotifications > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {unreadNotifications}
              </span>
            )}
          </MobileMenuLink>

          <MobileMenuLink href="/profile">
            {messages.navbar.profileSettings}
          </MobileMenuLink>

          <MobileMenuLink href="/my-products">
            {messages.navbar.myProducts}
          </MobileMenuLink>

          <MobileMenuLink href="/my-bids">
            {messages.navbar.myBids}
          </MobileMenuLink>

          <MobileMenuLink href="/received-bids">
            {messages.navbar.receivedBids}
          </MobileMenuLink>

          <MobileMenuLink href="/transactions">
            {messages.navbar.myTransactions}
          </MobileMenuLink>

          {user.role === "admin" && (
            <MobileMenuLink href="/admin">
              {messages.navbar.adminPanel}
            </MobileMenuLink>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-bold text-red-700"
          >
            {messages.navbar.logout}
          </button>
        </div>
      )}
    </div>
  );
}

function MobileMenuLink({
  href,
  children,
  primary = false,
  danger = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl px-4 py-3 text-sm font-bold ${
        primary
          ? "bg-slate-950 text-white"
          : danger
            ? "border border-red-200 bg-red-50 text-red-700"
            : "border border-slate-200 bg-white text-slate-700"
      }`}
    >
      {children}
    </Link>
  );
}

function IconLink({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600"
    >
      {children}
    </Link>
  );
}

function ProfileMenuLink({
  href,
  icon,
  children,
  onClick,
  className = "",
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-6 py-4 text-slate-700 transition hover:bg-slate-50 ${className}`}
      onClick={onClick}
    >
      <span className="text-slate-500">
        {icon}
      </span>
      {children}
    </Link>
  );
}