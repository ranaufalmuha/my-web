"use client";

import { useRef } from "react";
import { gsap } from "@/shared/lib/gsap";
import photoList from "@/shared/assets/gallery.json";
import Button from "@/shared/components/ui/Button";
import Image from "next/image";
import { useGsapResponsive } from "@/shared/hooks/useGsapResponsive";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sizeVariants = [
    "w-1/10 min-w-42",
    "w-1/12 min-w-35",
    "w-1/8 min-w-60",
    "w-1/12 min-w-41",
    "w-1/9 min-w-55",
    "w-1/8 min-w-47",
    "w-1/10 min-w-58",
    "w-1/12 min-w-36",
  ];

  useGsapResponsive({
    desktop: () => {
      const ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLDivElement>(".hero-card");
        const images = gsap.utils.toArray<HTMLImageElement>(".hero-card-img");

        const heroWelcome = document.querySelector(
          ".hero-welcome",
        ) as HTMLElement | null;

        const scroller = document.querySelector(
          "[data-lenis-wrapper]",
        ) as HTMLElement | null;

        if (!heroWelcome || !cards.length) return;

        const initialPositions = [
          { xFactor: 0.1, yFactor: -0.14, scale: 0.9 },
          { xFactor: -0.25, yFactor: -0.5, scale: 0.7 },
          { xFactor: -0.2, yFactor: -0.65, scale: 0.8 },
          { xFactor: -0.1, yFactor: -0.7, scale: 0.7 },
          { xFactor: -0.08, yFactor: -0.5, scale: 0.5 },
          { xFactor: -0.3, yFactor: -0.2, scale: 0.5 },
          { xFactor: -0.75, yFactor: -0.07, scale: 0.8 },
          { xFactor: -1.2, yFactor: -0.06, scale: 0.6 },
        ];

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            scroller,
            start: "top top",
            end: "+=200%",
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,

            onUpdate: (self) => {
              const progress = self.progress; // 0 → 1
              const shouldClearBlur = progress >= 1 / 3; // kira-kira setelah segmen pertama

              images.forEach((img) => {
                if (shouldClearBlur) {
                  img.classList.remove("blur-lg");
                  img.classList.add("hover:scale-105");
                } else {
                  // cuma tambah lagi kalau belum ada biar nggak spam
                  if (!img.classList.contains("blur-lg")) {
                    img.classList.add("blur-lg");
                    img.classList.remove("hover:scale-105");
                  }
                }
              });
            },
          },
        });

        tl.from(
          cards,
          {
            x: (i) => {
              const w = window.innerWidth;
              const pos = initialPositions[i];
              return pos ? pos.xFactor * w : 0;
            },
            y: (i) => {
              const h = window.innerHeight;
              const pos = initialPositions[i];
              return pos ? pos.yFactor * h : 0;
            },
            scale: (i) => initialPositions[i]?.scale ?? 1,
            ease: "power2.out",
            duration: 1,
          },
          0,
        );

        tl.to(".hero-welcome", { yPercent: -15 }, "<");

        tl.to(
          ".hero-gallery-container",
          {
            xPercent: -30,
            ease: "none",
            duration: 1,
          },
          ">",
        );
      }, containerRef);

      return () => ctx.revert();
    },

    mobile: () => {
      const images = gsap.utils.toArray<HTMLImageElement>(".hero-card-img");

      images.forEach((img) => {
        img.classList.remove("blur-lg");
        img.classList.remove("hover:scale-105");
        img.style.filter = "";
      });

      return () => {
        images.forEach((img) => {
          img.style.filter = "";
        });
      };
    },
  });

  return (
    <div ref={containerRef} id="hero" className="relative">
      <section className="md:h-screen overflow-hidden flex flex-col items-center justify-between relative z-5 bg-background border-b border-foreground/20 gap-18">
        <div className="max-md:mt-20" />
        <div className="hero-welcome flex flex-col items-center gap-8 md:gap-10 z-10 px-4 duration-300 md:absolute h-full w-full justify-center pointer-events-none text-center">
          <div className="flex flex-col gap-4 items-center">
            <span className="text-paragraph max-md:text-sm">
              Hi 👋🏻, I{"'"}m Creative Frontend Engineer
            </span>
            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-center max-w-6xl duration-300">
              Start
              <span className="font-fraunces"> Level One</span>, <br />
              Think <span className="font-fraunces"> Late Game</span>
            </h1>
          </div>

          {/* ========================================================
            CTA
          ======================================================== */}
          <div className="flex gap-6">
            <Button href="/#works" text="My Works" />
            <Button href="/#contact" variant="transparent" text="My Contact" />
          </div>
        </div>

        {/* ========================================================
          GALERY
        ======================================================== */}
        <div className="hero-gallery-container  ml-auto flex gap-6 items-end justify-start w-[200vw] z-0">
          {photoList.slice(0, 8).map((item, i) => (
            <div
              key={i}
              className={`${sizeVariants[i]} hero-card aspect-square bg-muted group`}
            >
              <Image
                src={item.imgUrl}
                alt={item.alt}
                className="hero-card-img w-full h-full group-hover:blur-none duration-300 object-cover"
                width={720}
                height={720}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
