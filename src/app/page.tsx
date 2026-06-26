import { Hero } from "@/components/home/Hero";
import { TrustSection } from "@/components/home/TrustSection";
import { Categories } from "@/components/home/Categories";
import { FeaturedAuctions } from "@/components/home/FeaturedAuctions";

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustSection />
      <Categories />
      <FeaturedAuctions />
    </main>
  );
}