import { Badge } from "@/types/badge";
import { Profile } from "@/types/profile";
import {
  calculateTrustScore,
  TrustScoreLabels,
} from "@/utils/trustScore";

export type BadgeLabelKey =
  | "trustedSellerElite"
  | "trustedSeller"
  | "activeSeller"
  | "auctionWinner"
  | "topRated"
  | "newMember";

export type BadgeLabels = Record<
  BadgeLabelKey,
  {
    title: string;
    description: string;
  }
>;

const fallbackBadgeLabels: BadgeLabels = {
  trustedSellerElite: {
    title: "Trusted Seller Elite",
    description:
      "Seller with an excellent reputation on Vandivo.",
  },
  trustedSeller: {
    title: "Trusted Seller",
    description:
      "User with a high trust level.",
  },
  activeSeller: {
    title: "Active seller",
    description:
      "Sold at least 10 products.",
  },
  auctionWinner: {
    title: "Auction winner",
    description:
      "Won at least 5 auctions.",
  },
  topRated: {
    title: "Top Rated",
    description:
      "Has a very good rating from reviews.",
  },
  newMember: {
    title: "New member",
    description:
      "Starting their journey on Vandivo.",
  },
};

export function getUserBadges(
  profile: Profile,
  labels: BadgeLabels =
    fallbackBadgeLabels,
  trustScoreLabels?: TrustScoreLabels
): Badge[] {
  const trust = calculateTrustScore(
    profile,
    trustScoreLabels
  );

  const badges: Badge[] = [];

  const soldCount =
    profile.sold_count ?? 0;
  const wonAuctions =
    profile.won_auctions ?? 0;
  const rating =
    Number(profile.rating ?? 0);
  const reviewsCount =
    profile.reviews_count ?? 0;

  if (
    trust.score >= 95 &&
    soldCount >= 50 &&
    rating >= 4.9
  ) {
    badges.push({
      id: "trusted_seller_elite",
      title:
        labels.trustedSellerElite.title,
      description:
        labels.trustedSellerElite
          .description,
      icon: "",
      color:
        "bg-emerald-50 text-emerald-700",
    });
  }

  if (trust.score >= 80) {
    badges.push({
      id: "trusted_seller",
      title: labels.trustedSeller.title,
      description:
        labels.trustedSeller
          .description,
      icon: "",
      color:
        "bg-green-50 text-green-700",
    });
  }

  if (soldCount >= 10) {
    badges.push({
      id: "active_seller",
      title: labels.activeSeller.title,
      description:
        labels.activeSeller.description,
      icon: "",
      color:
        "bg-blue-50 text-blue-700",
    });
  }

  if (wonAuctions >= 5) {
    badges.push({
      id: "auction_winner",
      title:
        labels.auctionWinner.title,
      description:
        labels.auctionWinner
          .description,
      icon: "",
      color:
        "bg-amber-50 text-amber-700",
    });
  }

  if (
    rating >= 4.8 &&
    reviewsCount >= 5
  ) {
    badges.push({
      id: "top_rated",
      title: labels.topRated.title,
      description:
        labels.topRated.description,
      icon: "",
      color:
        "bg-yellow-50 text-yellow-700",
    });
  }

  if (badges.length === 0) {
    badges.push({
      id: "new_member",
      title: labels.newMember.title,
      description:
        labels.newMember.description,
      icon: "",
      color:
        "bg-slate-50 text-slate-600",
    });
  }

  return badges;
}