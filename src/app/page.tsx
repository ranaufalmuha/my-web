"use client";

import HeroSection from "./_components/HeroSection";
import { WhatIDoSection } from "@/features/me/components/WhatIDoSection";
import AboutMeSection from "@/features/me/components/AboutMeSection";
import { WorksSection } from "@/features/work/components/WorksSection";
import { MyProjectsSection } from "@/features/work/components/MyProjectsSection";

// ========================================================
// MAIN PAGE
// ========================================================

export default function LandingPage() {
  // const experiences = new Date().getFullYear() - 2022;

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* ========================================================
          SECTION HERO
      ======================================================== */}
      <HeroSection />

      {/* ========================================================
          SECTION ABOUT ME
      ======================================================== */}
      <AboutMeSection />

      {/* ========================================================
          SECTION WHAT I DO?
      ======================================================== */}
      <WhatIDoSection />

      {/* ========================================================
          SECTION WORKS
      ======================================================== */}
      <WorksSection />

      {/* ========================================================
          SECTION MY PROJECTS
      ======================================================== */}
      <MyProjectsSection />

    </div>
  );
}
