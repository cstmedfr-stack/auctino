"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AccountNavigation from "@/components/profile/AccountNavigation";
import AccountPageHeader from "@/components/profile/AccountPageHeader";
import AccountPageState from "@/components/profile/AccountPageState";
import EditProfileForm from "@/components/profile/EditProfileForm";
import { useMessages } from "@/i18n/useMessages";
import { useProfile } from "@/hooks/useProfile";

export default function AccountProfilePage() {
  const messages = useMessages();

  const {
    profile,
    loading,
    error,
    refreshProfile,
  } = useProfile();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={17} />
            {messages.accountProfile.edit.backToProfile}
          </Link>
        </div>

        <AccountPageHeader mode="edit" />

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <AccountNavigation active="editProfile" />

          <section>
            {loading ? (
              <AccountPageState
                type="loading"
                mode="edit"
              />
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
              <EditProfileForm
                profile={profile}
                onSaved={() => {
                  void refreshProfile();
                }}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}