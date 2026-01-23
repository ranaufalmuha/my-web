"use client";

/* eslint-disable @next/next/no-img-element */

import DinoGame from "@/shared/components/DinoGame";
// import { MobileUI } from "@/shared/components/MobileUI";
import { Resume } from "@/shared/components/Resume";
import { useCursor } from "@/shared/contexts/CursorContext";
import ProjectSection from "./_components/ProjectSection";
import HeroSection from "./_components/HeroSection";
import { WhatIDoSection } from "@/features/my-service/components/WhatIDoSection";

// ========================================================
// MAIN PAGE
// ========================================================

export default function LandingPage() {
  const { handleMouseEnter, handleMouseLeave } = useCursor();
  // const experiences = new Date().getFullYear() - 2022;

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* ========================================================
          SECTION HERO
      ======================================================== */}
      <HeroSection />

      {/* ========================================================
          SECTION WORKS COMPANY
      ======================================================== */}
      <WhatIDoSection />

      {/* ========================================================
          SECTION WORKS COMPANY
      ======================================================== */}
      <WorksCompaniesSection />

      {/* section 4 Projects ----------------------  */}
      <ProjectSection
        onMouseEnter={() => handleMouseEnter(3)}
        onMouseLeave={handleMouseLeave}
      />

      {/* section 2 Game ----------------------  */}
      <section className="w-full flex justify-center relative">
        <hr className="border-gradient-to-r absolute bottom-0 w-full" />
        <div className="w-full max-w-[1500px] bg-surface ">
          <div className="p-20">
            <DinoGame />
          </div>
        </div>
      </section>

      {/* section 5 Resume ----------------------  */}
      <section id="resume" className="w-full flex relative justify-center">
        <hr className="border-gradient-to-l absolute bottom-0 left-0 z-10 w-full" />
        <div className="bg-surface absolute w-1/2 left-0 h-full"></div>
        <div className="w-full max-w-[1500px] relative">
          <Resume />
        </div>
      </section>
    </div>
  );

  // ===========================
  // UI
  // ===========================

  //========================================================
  // SECTION HERO
  // ========================================================
  // function HeroSection() {
  //   return (
  //     <section className="w-full flex max-lg:flex-col max-w-[1500px]">
  //       {/* left  */}
  //       <div className="w-full order-2 lg:order-1 lg:w-[45%]">
  //         <hr className="border-gradient-to-t absolute top-0 h-full" />
  //         <div className="h-[50dvh] max-h-[700px]">
  //           <img
  //             src="https://marchantweb.com/torn-paper-corner.png"
  //             className="w-full h-[80%]"
  //             alt="Decorative torn paper edge"
  //           />
  //         </div>
  //         <hr className="border-gradient-to-l" />
  //         {/* Bio  */}
  //         <div className="p-10 flex flex-col gap-44 bg-surface">
  //           <p
  //             className="text-6xl font-light w-[480px] leading-[70px]"
  //             onMouseEnter={() => handleMouseEnter(3)}
  //             onMouseLeave={handleMouseLeave}
  //           >
  //             Hello! Im Ranaufal Muha
  //           </p>
  //           <p
  //             className="mt-8 text-2xl"
  //             onMouseEnter={() => handleMouseEnter(1.5)}
  //             onMouseLeave={handleMouseLeave}
  //           >
  //             {experiences}+ years of crafting innovative projects 🔥
  //           </p>
  //         </div>
  //         <hr className="border-gradient-to-r" />
  //         <div className="h-[50dvh] max-h-[350px]"></div>
  //         {/* Profile  */}
  //         <hr className="absolute left-0 w-full border-gradient-to-r" />
  //         <div
  //           className="flex bg-background"
  //           onMouseEnter={() => handleMouseEnter(3)}
  //           onMouseLeave={handleMouseLeave}
  //         >
  //           <img src="./me/1.png" alt="Ranaufal Muha profile" />
  //         </div>
  //       </div>

  //       {/* right  */}
  //       <div className="w-full order-1 lg:order-2 lg:w-[55%] ">
  //         <div className="w-full flex h-[80dvh] max-h-[1200px]">
  //           <MobileUI />
  //           <hr className="border-gradient-to-b h-[80%]" />
  //         </div>
  //         <div className="max-lg:hidden h-[80dvh] max-h-[900px] w-full bg-radial-[at_90%_0%] from-purple-950/50 via-gray-800 to-black/80"></div>
  //         <hr className="absolute right-0 w-full border-gradient-to-l" />
  //       </div>
  //     </section>
  //   );
  // }

  // ========================================================
  // SECTION WORKS COMPANY
  // ========================================================
  function WorksCompaniesSection() {
    return (
      <section className="w-full relative">
        <hr className="border-gradient-to-r absolute top-0 w-full" />
        <hr className="border-gradient-to-l absolute bottom-0 w-full" />

        {/* Companies  */}
        <div className="bg-surface py-12 pl-14 overflow-x-auto flex justify-center">
          <div className="flex gap-16 w-max snap-x invert">
            <div className="snap-start ">
              <img
                src="https://internetcomputer.org/img/IC_logo_horizontal.svg"
                className="h-6 grayscale"
                alt="Internet Computer"
              />
            </div>
            <div className="snap-start ">
              <img
                src="https://indonesiaonchain.com/wp-content/uploads/2024/03/Disruptives-_-blck-letter-2-1024x181.png"
                className="h-6 grayscale"
                alt="Disruptives"
              />
            </div>
            <div className="snap-start ">
              <img
                src="./company/peridot.png"
                className="h-6 grayscale"
                alt="Peridot"
              />
            </div>
            <div className="snap-start ">
              <img
                src="https://indonesiaonchain.com/wp-content/uploads/2024/02/Indonesia-On-Chain-for-wihte-BG-1-1024x700.png"
                className="h-6 grayscale px-2 scale-200"
                alt="Indonesia On Chain"
              />
            </div>
            <div className="snap-start ">
              <img
                src="https://pbs.twimg.com/profile_images/1222627230536343558/LRFCfJqi_400x400.jpg"
                alt="University of Zurich Blockchain Center"
                className="h-6 grayscale px-2 scale-200"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }
}
