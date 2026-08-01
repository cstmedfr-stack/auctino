"use client";

import {
  Award,
  BadgeCheck,
} from "lucide-react";
import { Badge } from "@/types/badge";
import { useMessages } from "@/i18n/useMessages";

type BadgesCardProps = {
  badges: Badge[];
};

export default function BadgesCard({
  badges,
}: BadgesCardProps) {
  const messages = useMessages();
  const t = messages.publicProfile;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Award size={22} />
        </div>

        <h2 className="text-xl font-bold text-slate-950">
          {t.badgesTitle}
        </h2>
      </div>

      {badges.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">
          {t.noBadges}
        </div>
      ) : (
        <div className="space-y-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600">
                <BadgeCheck size={20} />
              </div>

              <p className="font-bold text-slate-950">
                {badge.title}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}