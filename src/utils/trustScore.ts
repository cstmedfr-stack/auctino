import { Profile } from "@/types/profile";

export type TrustScoreLevel =
  | "Excelent"
  | "Foarte bun"
  | "Bun"
  | "În dezvoltare"
  | "Nou";

export type TrustScoreBreakdownItem = {
  label: string;
  points: number;
  achieved: boolean;
};

export function calculateTrustScore(profile: Profile) {
  const accountCreatedAt = new Date(profile.created_at);
  const now = new Date();

  const accountAgeMonths =
    (now.getFullYear() - accountCreatedAt.getFullYear()) * 12 +
    (now.getMonth() - accountCreatedAt.getMonth());

  const breakdown: TrustScoreBreakdownItem[] = [
    {
      label: "Telefon verificat",
      points: profile.phone_verified ? 20 : 0,
      achieved: profile.phone_verified,
    },
    {
      label: "Identitate verificată",
      points: profile.identity_verified ? 30 : 0,
      achieved: profile.identity_verified,
    },
    {
      label: "Rating peste 4.8",
      points: profile.rating >= 4.8 && profile.reviews_count > 0 ? 15 : 0,
      achieved: profile.rating >= 4.8 && profile.reviews_count > 0,
    },
    {
      label: "Minimum 10 produse vândute",
      points: profile.sold_count >= 10 ? 10 : 0,
      achieved: profile.sold_count >= 10,
    },
    {
      label: "Minimum 5 licitații câștigate",
      points: profile.won_auctions >= 5 ? 5 : 0,
      achieved: profile.won_auctions >= 5,
    },
    {
      label: "Cont mai vechi de 6 luni",
      points: accountAgeMonths >= 6 ? 10 : 0,
      achieved: accountAgeMonths >= 6,
    },
  ];

  const score = breakdown.reduce((total, item) => total + item.points, 0);

  let level: TrustScoreLevel = "Nou";

  if (score >= 90) level = "Excelent";
  else if (score >= 75) level = "Foarte bun";
  else if (score >= 60) level = "Bun";
  else if (score >= 40) level = "În dezvoltare";

  return {
    score,
    level,
    breakdown,
  };
}