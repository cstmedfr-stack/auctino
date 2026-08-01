"use client";

import type { ComponentProps } from "react";

import type { Profile } from "@/types/profile";

import UserProfileHeader from "@/components/profile/UserProfileHeader";
import VerificationCard from "@/components/profile/VerificationCard";
import StatisticsCard from "@/components/profile/StatisticsCard";
import TrustScoreCard from "@/components/profile/TrustScoreCard";

type TrustScoreCardProps = ComponentProps<
  typeof TrustScoreCard
>;

type TrustScoreResult = {
  score: TrustScoreCardProps["score"];
  level: TrustScoreCardProps["level"];
  breakdown: TrustScoreCardProps["breakdown"];
};

type PrivateProfileOverviewProps = {
  profile: Profile;
  trustScore: TrustScoreResult | null;
};

export default function PrivateProfileOverview({
  profile,
  trustScore,
}: PrivateProfileOverviewProps) {
  const fullName =
    getStringValue(profile, "full_name") || "";

  const avatarUrl =
    getStringValue(profile, "avatar_url") || "";

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <UserProfileHeader
          fullName={fullName}
          avatarUrl={avatarUrl}
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
          phoneVerified={getBooleanValue(
            profile,
            "phone_verified"
          )}
          identityVerified={getBooleanValue(
            profile,
            "identity_verified"
          )}
        />

        <StatisticsCard
          activeProducts={getNumberValue(
            profile,
            "active_products"
          )}
          soldProducts={getNumberValue(
            profile,
            "sold_count"
          )}
          wonAuctions={getNumberValue(
            profile,
            "won_auctions"
          )}
          rating={getNumberValue(
            profile,
            "rating"
          )}
        />
      </div>
    </section>
  );
}

function getProfileRecord(profile: Profile) {
  return profile as unknown as Record<
    string,
    unknown
  >;
}

function getStringValue(
  profile: Profile,
  key: string
) {
  const value = getProfileRecord(profile)[key];

  return typeof value === "string"
    ? value
    : null;
}

function getNumberValue(
  profile: Profile,
  key: string
) {
  const value = getProfileRecord(profile)[key];

  return typeof value === "number"
    ? value
    : 0;
}

function getBooleanValue(
  profile: Profile,
  key: string
) {
  const value = getProfileRecord(profile)[key];

  return Boolean(value);
}