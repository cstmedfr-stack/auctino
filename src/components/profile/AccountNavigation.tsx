"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Gavel,
  Heart,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  Package,
  Pencil,
  ReceiptText,
  Store,
  UserRound,
} from "lucide-react";


import { useMessages } from "@/i18n/useMessages";

type AccountNavigationKey =
  | "overview"
  | "editProfile"
  | "myProducts"
  | "transactions"
  | "messages"
  | "favorites"
  | "notifications"
  | "marketplace"
  | "myBids"
  | "receivedBids";

type AccountNavigationItem = {
  key: AccountNavigationKey;
  href: string;
  label: string;
  icon: LucideIcon;
};

type AccountNavigationProps = {
  active: AccountNavigationKey;
};

export default function AccountNavigation({
  active,
}: AccountNavigationProps) {
  const messages = useMessages();
  const t = messages.accountProfile.nav;

  const items: AccountNavigationItem[] = [
    {
      key: "overview",
      href: "/profile",
      label: t.overview,
      icon: UserRound,
    },
    {
      key: "editProfile",
      href: "/account/profile",
      label: t.editProfile,
      icon: Pencil,
    },
    {
      key: "myProducts",
      href: "/my-products",
      label: t.myProducts,
      icon: Package,
    },
    {
      key: "myBids",
      href: "/my-bids",
      label: t.myBids,
      icon: Gavel,
    },
    {
      key: "receivedBids",
      href: "/received-bids",
      label: t.receivedBids,
      icon: Inbox,
    },
    {
      key: "transactions",
      href: "/transactions",
      label: t.transactions,
      icon: ReceiptText,
    },
    {
      key: "messages",
      href: "/chat",
      label: t.messages,
      icon: MessageCircle,
    },
    {
      key: "favorites",
      href: "/favorites",
      label: t.favorites,
      icon: Heart,
    },
    {
      key: "notifications",
      href: "/notifications",
      label: t.notifications,
      icon: Bell,
    },
    {
      key: "marketplace",
      href: "/dashboard",
      label: t.marketplace,
      icon: Store,
    },
  ];

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-28 lg:p-4">
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition lg:flex lg:w-full lg:gap-3 ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon
                size={18}
                className="shrink-0"
              />
              <span className="whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 hidden rounded-2xl bg-slate-50 p-4 text-slate-500 lg:block">
        <LayoutDashboard
          size={20}
          className="mb-2"
        />
        <p className="text-xs leading-5">
          Auctino
        </p>
      </div>
    </aside>
  );
}