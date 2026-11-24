"use client";

import HeroSection from "@/feat/home/components/HeroSection";
import { WhatIDoSection } from "@/feat/me/components/WhatIDoSection";
import AboutMeSection from "@/feat/me/components/AboutMeSection";
import { WorksSection } from "@/feat/work/components/WorksSection";
import { MyProjectsSection } from "@/feat/work/components/MyProjectsSection";
import { PricingSection } from "@/feat/work/components/PricingSection";
import { BookingSection } from "@/feat/work/components/BookingSection";

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

      {/* ========================================================
          SECTION PRICING
      ======================================================== */}
      <PricingSection />

      {/* ========================================================
          SECTION BOOKING
      ======================================================== */}
      <BookingSection />

    </div>
  );
}
