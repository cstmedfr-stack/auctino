"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Flag,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type AdminDashboardCardsProps = {
  disputesCount: number;
};

type CardItem = {
  href: string;
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
  badge?: number;
  tone: "amber" | "blue" | "red";
};

export default function AdminDashboardCards({
  disputesCount,
}: AdminDashboardCardsProps) {
  const messages = useMessages();
  const t = messages.adminDashboard.cards;

  const items: CardItem[] = [
    {
      href: "/admin/disputes",
      title: t.disputesTitle,
      description: t.disputesDescription,
      action: t.disputesAction,
      icon: ShieldAlert,
      badge: disputesCount,
      tone: "amber",
    },
    {
      href: "/admin/users",
      title: t.usersTitle,
      description: t.usersDescription,
      action: t.usersAction,
      icon: UsersRound,
      tone: "blue",
    },
    {
      href: "/admin/reports",
      title: t.reportsTitle,
      description: t.reportsDescription,
      action: t.reportsAction,
      icon: Flag,
      tone: "red",
    },
  ];

  return (
    <section className="mt-8 grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <DashboardCard
          key={item.href}
          item={item}
        />
      ))}
    </section>
  );
}

function DashboardCard({
  item,
}: {
  item: CardItem;
}) {
  const Icon = item.icon;

  const toneClasses = {
    amber:
      "border-amber-200 bg-amber-100 text-amber-700 group-hover:text-amber-900",
    blue:
      "border-blue-200 bg-blue-100 text-blue-700 group-hover:text-blue-900",
    red:
      "border-red-200 bg-red-100 text-red-700 group-hover:text-red-900",
  }[item.tone];

  const [borderClass, iconBgClass, actionClass] =
    toneClasses.split(" ");

  return (
    <Link
      href={item.href}
      className={`group rounded-3xl border ${borderClass} bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBgClass} ${actionClass}`}
        >
          <Icon size={24} />
        </div>

        {item.badge !== undefined &&
          item.badge > 0 && (
            <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-red-600 px-2 text-sm font-black text-white">
              {item.badge}
            </span>
          )}
      </div>

      <h2 className="mt-5 text-xl font-black text-slate-950">
        {item.title}
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        {item.description}
      </p>

      <p
        className={`mt-5 font-bold ${actionClass}`}
      >
        {item.action}
      </p>
    </Link>
  );
}