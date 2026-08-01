"use client";

import { useParams } from "next/navigation";

import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useFavorites } from "@/hooks/useFavorites";
import { useReviews } from "@/hooks/useReviews";
import { usePublicUserProducts } from "@/hooks/usePublicUserProducts";

import TrustScoreCard from "@/components/profile/TrustScoreCard";
import VerificationCard from "@/components/profile/VerificationCard";
import StatisticsCard from "@/components/profile/StatisticsCard";
import BadgesCard from "@/components/profile/BadgesCard";
import ReviewsCard from "@/components/profile/ReviewsCard";
import PublicProfileHero from "@/components/profile/PublicProfileHero";
import PublicProfileState from "@/components/profile/PublicProfileState";
import PublicProfileProductsSection from "@/components/profile/PublicProfileProductsSection";
import { useMessages } from "@/i18n/useMessages";

import { calculateTrustScore } from "@/utils/trustScore";
import { getUserBadges } from "@/utils/badges";

export default function PublicUserPage() {
  const params = useParams();
  const messages = useMessages();
const publicProfileMessages =  messages.publicProfile;

  const userId =
    typeof params.id === "string"
      ? params.id
      : "";

  const {
    favoriteIds,
    toggleFavorite,
  } = useFavorites();

  const {
    profile,
    loading,
    error,
  } = usePublicProfile(userId);

  const {
    reviews,
    averageRating,
  } = useReviews(userId);

  const {
    products,
    loading: productsLoading,
  } = usePublicUserProducts(userId);

  if (loading) {
    return (
      <PublicProfileState type="loading" />
    );
  }

  if (error) {
    return (
      <PublicProfileState
        type="error"
        message={error}
      />
    );
  }

  if (!profile) {
    return (
      <PublicProfileState type="not-found" />
    );
  }

  const trustScore =
  calculateTrustScore(
    profile,
    publicProfileMessages.trustScoreLabels
  );

const badges =
  getUserBadges(
    profile,
    publicProfileMessages.badgeLabels,
    publicProfileMessages.trustScoreLabels
  );

  const displayedRating =
    reviews.length > 0
      ? averageRating
      : Number(profile.rating ?? 0);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PublicProfileHero
          profile={profile}
          trustScore={trustScore.score}
          rating={displayedRating}
        />

        <section className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <TrustScoreCard
              score={trustScore.score}
              level={trustScore.level}
              breakdown={trustScore.breakdown}
            />

            <BadgesCard badges={badges} />

            <VerificationCard
              phoneVerified={
                profile.phone_verified
              }
              identityVerified={
                profile.identity_verified
              }
            />

            <StatisticsCard
              activeProducts={
                products.length
              }
              soldProducts={
                profile.sold_count ?? 0
              }
              wonAuctions={
                profile.won_auctions ?? 0
              }
              rating={displayedRating}
            />
          </aside>

          <div className="space-y-8">
            <ReviewsCard
              reviews={reviews}
              averageRating={displayedRating}
            />

            <PublicProfileProductsSection
              products={products}
              loading={productsLoading}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        </section>
      </div>
    </main>
  );
}