import type { Metadata } from "next";
import AboutHeroSection from "@/feat/about/components/AboutHeroSection";
import AboutMeSection from "@/feat/me/components/AboutMeSection";

export const metadata: Metadata = {
  title: "About — Ranaufal Muha",
  description:
    "Software Engineer building interactive experiences, smart contracts, and Web3 products.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AboutHeroSection />
      <AboutMeSection cta={false} />
    </div>
  );
}
