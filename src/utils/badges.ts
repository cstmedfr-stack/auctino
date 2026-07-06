import { Badge } from "@/types/badge";
import { Profile } from "@/types/profile";
import { calculateTrustScore } from "@/utils/trustScore";

export function getUserBadges(profile: Profile): Badge[] {
  const trust = calculateTrustScore(profile);

  const badges: Badge[] = [];

  if (trust.score >= 95 && profile.sold_count >= 50 && profile.rating >= 4.9) {
    badges.push({
      id: "trusted_seller_elite",
      title: "Trusted Seller Elite",
      description: "Vânzător cu reputație excelentă pe Vendora.",
      icon: "🛡️",
      color: "bg-emerald-50 text-emerald-700",
    });
  }

  if (trust.score >= 80) {
    badges.push({
      id: "trusted_seller",
      title: "Trusted Seller",
      description: "Utilizator cu nivel ridicat de încredere.",
      icon: "✅",
      color: "bg-green-50 text-green-700",
    });
  }

  if ((profile.sold_count ?? 0) >= 10) {
    badges.push({
      id: "active_seller",
      title: "Vânzător activ",
      description: "A vândut minimum 10 produse.",
      icon: "📦",
      color: "bg-blue-50 text-blue-700",
    });
  }

  if ((profile.won_auctions ?? 0) >= 5) {
    badges.push({
      id: "auction_winner",
      title: "Licitații câștigate",
      description: "A câștigat minimum 5 licitații.",
      icon: "🏆",
      color: "bg-amber-50 text-amber-700",
    });
  }

  if ((profile.rating ?? 0) >= 4.8 && (profile.reviews_count ?? 0) >= 5) {
    badges.push({
      id: "top_rated",
      title: "Top Rated",
      description: "Are rating foarte bun din review-uri.",
      icon: "⭐",
      color: "bg-yellow-50 text-yellow-700",
    });
  }

  if (badges.length === 0) {
    badges.push({
      id: "new_member",
      title: "Membru nou",
      description: "La început de drum pe Vendora.",
      icon: "🌱",
      color: "bg-slate-50 text-slate-600",
    });
  }

  return badges;
}