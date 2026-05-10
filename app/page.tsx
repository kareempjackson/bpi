import ArchitectureOfCareSection from "./components/ArchitectureOfCareSection";
import BlogSection from "./components/BlogSection";
import BuildingSection from "./components/BuildingSection";
import CareMapSection from "./components/CareMapSection";
import HeroSection from "./components/HeroSection";
import InitiativesSection from "./components/InitiativesSection";
import LeaderSection from "./components/LeaderSection";
import WhyBpiSection from "./components/WhyBpiSection";

export default function Home() {
  return (
    <main className="bg-error-25">
      <HeroSection />
      <LeaderSection />
      <ArchitectureOfCareSection />
      <CareMapSection />
      <WhyBpiSection />
      <InitiativesSection />
      <BlogSection />
      <BuildingSection />
    </main>
  );
}
