"use client";

import AccountNavigation from "@/components/profile/AccountNavigation";
import Link from "next/link";
import AccountPageState from "@/components/profile/AccountPageState";
import PrivateProfileOverview from "@/components/profile/PrivateProfileOverview";
import { useProfile } from "@/hooks/useProfile";
import { useMessages } from "@/i18n/useMessages";
import { calculateTrustScore } from "@/utils/trustScore";

export default function ProfilePage() {
  const messages = useMessages();
  const t = messages.accountProfile.overview;

  const {
  profile,
  loading,
  error,
  refreshProfile,
} = useProfile();

  const trustScore = profile
    ? calculateTrustScore(
        profile,
        messages.publicProfile.trustScoreLabels
      )
    : null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
   <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
  <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
    {t.eyebrow}
  </p>

  <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
    <div>
      <h1 className="text-3xl font-black text-slate-950 md:text-4xl">
        {t.title}
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {t.description}
      </p>
    </div>

    <div className="flex flex-wrap gap-3">
      <Link
        href="/account/profile"
        className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
      >
        {t.editProfile}
      </Link>

      {profile && (
        <Link
          href={`/users/${profile.id}`}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          {t.publicProfile}
        </Link>
      )}
    </div>
  </div>
</section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <AccountNavigation active="overview" />

          <div>
            {loading ? (
              <AccountPageState type="loading" />
            ) : error ? (
              <AccountPageState
                type="error"
                message={error}
                onRetry={() => {
                 void refreshProfile();
                }}
              />
            ) : !profile ? (
              <AccountPageState type="notFound" />
            ) : (
              <PrivateProfileOverview
                profile={profile}
                trustScore={trustScore}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}