"use client";

import HeroSection from "./_components/HeroSection";
import { WhatIDoSection } from "@/features/me/components/WhatIDoSection";
import AboutMeSection from "@/features/me/components/AboutMeSection";
import { WorksSection } from "@/features/work/components/WorksSection";

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
          SECTION WHAT I DO?
      ======================================================== */}
      <WhatIDoSection />

      {/* ========================================================
          SECTION ABOUT ME
      ======================================================== */}
      <AboutMeSection />

      {/* ========================================================
          SECTION WORKS
      ======================================================== */}
      <WorksSection />
      {/* <WorksCompaniesSection /> */}

      {/* section 4 Projects ----------------------  */}
      {/* <ProjectSection
        onMouseEnter={() => handleMouseEnter(3)}
        onMouseLeave={handleMouseLeave}
      /> */}

      {/* section 2 Game ----------------------  */}
      {/* <section className="w-full flex justify-center relative">
        <hr className="border-gradient-to-r absolute bottom-0 w-full" />
        <div className="w-full max-w-[1500px] bg-surface ">
          <div className="p-20">
            <DinoGame />
          </div>
        </div>
      </section> */}

      {/* section 5 Resume ----------------------  */}
      {/* <section id="resume" className="w-full flex relative justify-center">
        <hr className="border-gradient-to-l absolute bottom-0 left-0 z-10 w-full" />
        <div className="bg-surface absolute w-1/2 left-0 h-full"></div>
        <div className="w-full max-w-[1500px] relative">
          <Resume />
        </div>
      </section> */}
    </div>
  );
}
