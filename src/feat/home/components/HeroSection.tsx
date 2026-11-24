"use client";

import Image from "next/image";
import photoList from "@/shared/assets/gallery.json";
import ConcaveCarousel from "@/shared/components/react-bits/concave-carousel";
import { useTilt } from "@/shared/hooks/useTilt";

const reelItems = photoList.map((item) => ({
  src: item.imgUrl,
  alt: item.alt,
}));

export default function HeroSection() {
  // character paling depan → ikut reaksi kursor, lebih halus dari dinding
  const meTiltRef = useTilt({
    max: 10,
    reverse: false,
    scale: 1,
    speed: 900,
    "full-page-listening": true,
  });

  return (
    <div id="hero" className="relative md:h-screen">
      <section
        id="hero-screen"
        className="h-dvh md:h-screen relative overflow-hidden flex items-center justify-center bg-background border-b border-foreground/20"
      >
        <h1 className="sr-only">
          Ranaufal — Software Engineer, Frontend Builder, Web3 Explorer
        </h1>

        {/* ========================================================
          CAROUSEL — di belakang character. Rotasi kursor terjadi
          di dalam scene 3D (camera orbit), bukan CSS transform.
          Teks di dinding drum-nya, jadi lekuknya persis sama.
        ======================================================== */}
        <ConcaveCarousel
          items={reelItems}
          autoplay="drift"
          speed={0.16}
          size={0.32}
          radius={0}
          reflection={0}
          grayscale={1}
          gap={28}
          pointerTilt={14}
          wheel={false}
          pauseOnHover={false}
          captions={false}
          controls={false}
          backgroundColor="transparent"
          ariaLabel="Gallery of Ranaufal's work"
          className="absolute inset-0 z-0"
          wallText={{
            texts: [
              "Software Engineer",
              "Product Engineer",
              "Blockchain Enthusiast",
              "Artificial Intelligence",
            ],
            interval: 2.4,
            size: 0.62,
            accentFont: '"Fraunces-Italic"',
          }}
        />

        <div
          ref={meTiltRef}
          className="pointer-events-none absolute inset-0 z-20"
        >
          <Image
            src="/images/me/me.png"
            alt="Portrait of Ranaufal"
            width={1086}
            height={1448}
            priority
            className="absolute left-1/2 top-[28.5vh] -translate-x-1/2 w-auto max-h-[62vh] md:top-[21vh] md:max-h-[78vh] animate-portrait-in"
          />
        </div>
      </section>
    </div>
  );
}
