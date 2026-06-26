import { Hero } from "@/components/home/Hero";
import { TrustSection } from "@/components/home/TrustSection";
import { Categories } from "@/components/home/Categories";
import { FeaturedAuctions } from "@/components/home/FeaturedAuctions";
import { WhyVendora } from "@/components/home/WhyVendora";
import { HowItWorks } from "@/components/home/HowItWorks";

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustSection />
      <Categories />
      <FeaturedAuctions />
      <WhyVendora />
      <HowItWorks />
    </main>
  );
}