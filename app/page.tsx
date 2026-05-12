import type { Viewport } from "next";

import ArchitectureOfCareSection from "./components/ArchitectureOfCareSection";
import BlogSection from "./components/BlogSection";
import BuildingSection from "./components/BuildingSection";
import CareMapSection from "./components/CareMapSection";
import HeroSection from "./components/HeroSection";
import InitiativesSection from "./components/InitiativesSection";
import LeaderSection from "./components/LeaderSection";
import WhyBpiSection from "./components/WhyBpiSection";

// Tint mobile browser chrome (iOS status bar, Android URL bar) the same
// deep navy as the hero card so the time/status area reads as a seamless
// extension of the hero on mobile.
export const viewport: Viewport = {
  themeColor: "#000036",
};

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
