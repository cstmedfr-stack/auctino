import { Profile } from "@/types/profile";

export type TrustScoreLevelKey =
  | "excellent"
  | "veryGood"
  | "good"
  | "growing"
  | "new";

export type TrustScoreLevel = string;

export type TrustScoreBreakdownKey =
  | "phoneVerified"
  | "identityVerified"
  | "highRating"
  | "soldProducts"
  | "wonAuctions"
  | "accountAge";

export type TrustScoreBreakdownItem = {
  key: TrustScoreBreakdownKey;
  label: string;
  points: number;
  achieved: boolean;
};

export type TrustScoreLabels = {
  levels: Record<TrustScoreLevelKey, string>;
  breakdown: Record<
    TrustScoreBreakdownKey,
    string
  >;
};

const fallbackTrustScoreLabels: TrustScoreLabels = {
  levels: {
    excellent: "Excellent",
    veryGood: "Very good",
    good: "Good",
    growing: "Growing",
    new: "New",
  },
  breakdown: {
    phoneVerified: "Phone verified",
    identityVerified: "Identity verified",
    highRating: "Rating above 4.8",
    soldProducts: "At least 10 sold products",
    wonAuctions: "At least 5 won auctions",
    accountAge: "Account older than 6 months",
  },
};

export function calculateTrustScore(
  profile: Profile,
  labels: TrustScoreLabels =
    fallbackTrustScoreLabels
) {
  const accountCreatedAt = new Date(
    profile.created_at
  );

  const now = new Date();

  const accountAgeMonths =
    (now.getFullYear() -
      accountCreatedAt.getFullYear()) *
      12 +
    (now.getMonth() -
      accountCreatedAt.getMonth());

  const rating = Number(profile.rating ?? 0);
  const reviewsCount =
    profile.reviews_count ?? 0;
  const soldCount = profile.sold_count ?? 0;
  const wonAuctions =
    profile.won_auctions ?? 0;

  const breakdown: TrustScoreBreakdownItem[] =
    [
      {
        key: "phoneVerified",
        label:
          labels.breakdown.phoneVerified,
        points: profile.phone_verified
          ? 20
          : 0,
        achieved: profile.phone_verified,
      },
      {
        key: "identityVerified",
        label:
          labels.breakdown
            .identityVerified,
        points: profile.identity_verified
          ? 30
          : 0,
        achieved:
          profile.identity_verified,
      },
      {
        key: "highRating",
        label: labels.breakdown.highRating,
        points:
          rating >= 4.8 &&
          reviewsCount > 0
            ? 15
            : 0,
        achieved:
          rating >= 4.8 &&
          reviewsCount > 0,
      },
      {
        key: "soldProducts",
        label:
          labels.breakdown.soldProducts,
        points: soldCount >= 10 ? 10 : 0,
        achieved: soldCount >= 10,
      },
      {
        key: "wonAuctions",
        label:
          labels.breakdown.wonAuctions,
        points: wonAuctions >= 5 ? 5 : 0,
        achieved: wonAuctions >= 5,
      },
      {
        key: "accountAge",
        label: labels.breakdown.accountAge,
        points:
          accountAgeMonths >= 6 ? 10 : 0,
        achieved: accountAgeMonths >= 6,
      },
    ];

  const score = breakdown.reduce(
    (total, item) =>
      total + item.points,
    0
  );

  let levelKey: TrustScoreLevelKey = "new";

  if (score >= 90) {
    levelKey = "excellent";
  } else if (score >= 75) {
    levelKey = "veryGood";
  } else if (score >= 60) {
    levelKey = "good";
  } else if (score >= 40) {
    levelKey = "growing";
  }

  return {
    score,
    levelKey,
    level: labels.levels[levelKey],
    breakdown,
  };
}