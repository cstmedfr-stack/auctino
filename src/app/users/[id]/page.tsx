"use client";

import { useParams } from "next/navigation";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useFavorites } from "@/hooks/useFavorites";
import TrustScoreCard from "@/components/profile/TrustScoreCard";
import VerificationCard from "@/components/profile/VerificationCard";
import StatisticsCard from "@/components/profile/StatisticsCard";
import BadgesCard from "@/components/profile/BadgesCard";
import { calculateTrustScore } from "@/utils/trustScore";
import { getUserBadges } from "@/utils/badges";
import ReviewsCard from "@/components/profile/ReviewsCard";
import { useReviews } from "@/hooks/useReviews";
import PublicProfileHero from "@/components/profile/PublicProfileHero";
import { usePublicUserProducts } from "@/hooks/usePublicUserProducts";
import ProductGrid from "@/components/product/ProductGrid";

export default function PublicUserPage() {
  const params = useParams();
  const userId = params.id as string;
const {  favoriteIds,  toggleFavorite,} = useFavorites();
  const { profile, loading } = usePublicProfile(userId);
  const {  reviews,  averageRating,} = useReviews(userId);
const {
  products,
  loading: productsLoading,
} = usePublicUserProducts(userId);
  const trustScore = profile ? calculateTrustScore(profile) : null;
  const badges = profile ? getUserBadges(profile) : [];
  const displayedRating =  reviews.length > 0    ? averageRating    : Number(profile?.rating ?? 0);
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        Se încarcă profilul...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        Utilizatorul nu există.
      </main>
    );
  }

return (
  <main className="min-h-screen bg-slate-50 p-8">
    <div className="mx-auto max-w-7xl">
      <PublicProfileHero
  profile={profile}
  trustScore={trustScore?.score ?? 0}
  rating={displayedRating}/>

      <section>
  <div className="space-y-6">
          {trustScore && (
            <TrustScoreCard
              score={trustScore.score}
              level={trustScore.level}
              breakdown={trustScore.breakdown}
            />
          )}

          <BadgesCard badges={badges} />

          <VerificationCard
            phoneVerified={profile.phone_verified}
            identityVerified={profile.identity_verified}
          />

          <StatisticsCard
            activeProducts={products.length}
            soldProducts={profile.sold_count ?? 0}
            wonAuctions={profile.won_auctions ?? 0}
            rating={displayedRating}
          />

         <ReviewsCard  reviews={reviews}  averageRating={displayedRating}/>
          <section className="rounded-3xl bg-white p-6 shadow-sm">
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-slate-900">
      Produsele utilizatorului
    </h2>

    <p className="text-slate-500">
      Licitațiile active publicate de acest utilizator.
    </p>
  </div>

  {productsLoading ? (
    <p>Se încarcă produsele...</p>
  ) : products.length === 0 ? (
    <p className="text-slate-500">
      Acest utilizator nu are produse active.
    </p>
  ) : (
    <ProductGrid
  products={products}
  favoriteIds={favoriteIds}
  onToggleFavorite={toggleFavorite}
  mode="marketplace"/>
  )}
</section>
        </div>
      </section>
    </div>
  </main>
);
}