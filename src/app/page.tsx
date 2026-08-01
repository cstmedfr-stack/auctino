import { Hero } from "@/components/home/Hero";
import { TrustSection } from "@/components/home/TrustSection";
import { Categories } from "@/components/home/Categories";
import { FeaturedAuctions } from "@/components/home/FeaturedAuctions";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhyAuctino } from "@/components/home/WhyAuctino";
import { FAQ } from "@/components/home/FAQ";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <TrustSection />
      <Categories />
      <FeaturedAuctions />
      <HowItWorks />
      <WhyAuctino />
      <FAQ />
      <FinalCTA />
    </main>
  );
}