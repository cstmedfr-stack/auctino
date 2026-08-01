"use client";

import {
  MapPin,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";
import { Profile } from "@/types/profile";
import { useMessages } from "@/i18n/useMessages";

type PublicProfileHeroProps = {
  profile: Profile;
  trustScore: number;
  rating: number;
};

export default function PublicProfileHero({
  profile,
  trustScore,
  rating,
}: PublicProfileHeroProps) {
  const messages = useMessages();
  const t = messages.publicProfile;

  const displayName =
    profile.full_name?.trim() ||
    t.defaultUserName;

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl shadow-slate-300/40">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-2xl font-extrabold text-indigo-600 ring-4 ring-white/10">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-300">
              <Store size={16} />
              {t.sellerProfile}
            </p>

            <h1 className="text-4xl font-extrabold tracking-tight">
              {displayName}
            </h1>

            <p className="mt-2 text-slate-300">
              {t.activeSeller}
            </p>

            {profile.city && (
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={16} />
                <span className="sr-only">
                  {t.locationLabel}
                </span>
                {profile.city}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/10 px-5 py-4">
            <p className="inline-flex items-center gap-2 text-sm text-slate-300">
              <ShieldCheck size={16} />
              {t.trustScore}
            </p>

            <p className="mt-1 text-3xl font-bold text-indigo-300">
              {trustScore}
              <span className="text-lg text-slate-400">
                {t.scoreOutOf}
              </span>
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-4">
            <p className="inline-flex items-center gap-2 text-sm text-slate-300">
              <Star size={16} />
              {t.rating}
            </p>

            <p className="mt-1 text-3xl font-bold text-yellow-300">
              {rating.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}