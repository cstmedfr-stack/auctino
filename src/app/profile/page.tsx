"use client";

import Link from "next/link";
import UserProfileHeader from "@/components/profile/UserProfileHeader";
import VerificationCard from "@/components/profile/VerificationCard";
import StatisticsCard from "@/components/profile/StatisticsCard";
import { useProfile } from "@/hooks/useProfile";
import TrustScoreCard from "@/components/profile/TrustScoreCard";
import { calculateTrustScore } from "@/utils/trustScore";

export default function ProfilePage() {
  const { profile, loading } = useProfile();
  const trustScore = profile? calculateTrustScore(profile) : null;

  if (loading) {
 
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <p>Se încarcă profilul...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <p>Profilul nu a fost găsit.</p>
      </main>
    );
  }
console.log(profile);
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            Contul meu
          </h1>
          <p className="mt-2 text-slate-500">
            Profil, încredere, licitații și setări Vendora.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl bg-white p-5 shadow-sm">
            <nav className="space-y-2">
              <Link href="/profile" className="block rounded-2xl bg-black px-4 py-3 font-semibold text-white">
                👤 Profil
              </Link>

              <Link href="/my-products" className="block rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100">
                📦 Produsele mele
              </Link>

              <Link href="/chat" className="block rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100">
                💬 Mesaje
              </Link>

              <Link href="/favorites" className="block rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100">
                ❤️ Favorite
              </Link>

              <Link href="/dashboard" className="block rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100">
                🏷 Licitații
              </Link>

              <button className="w-full rounded-2xl px-4 py-3 text-left font-semibold text-slate-700 hover:bg-slate-100">
                ⚙ Setări
              </button>

              <button className="w-full rounded-2xl px-4 py-3 text-left font-semibold text-slate-700 hover:bg-slate-100">
                🔐 Securitate
              </button>
            </nav>
          </aside>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <UserProfileHeader
                fullName={profile.full_name}
                avatarUrl={profile.avatar_url}
              />
            </div>

            <div className="space-y-6 lg:col-span-2">

                {trustScore && (
                <TrustScoreCard
                score={trustScore.score}
                level={trustScore.level}
                breakdown={trustScore.breakdown}
                />
            )}

                <VerificationCard
                phoneVerified={profile.phone_verified}
                identityVerified={profile.identity_verified}
              />

              <StatisticsCard
                activeProducts={0}
                soldProducts={profile.sold_count}
                wonAuctions={profile.won_auctions}
                rating={profile.rating ?? 0}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}