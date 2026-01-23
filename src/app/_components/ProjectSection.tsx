"use client";

import { memo, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ProjectSection = ({ onMouseEnter, onMouseLeave }: Props) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // ✅ GSAP CONTEXT — kosong & aman
    const ctx = gsap.context(() => {
      // ⬇️ NANTI kamu bebas isi animasi di sini
      // contoh:
      // gsap.from(canvasRef.current, { opacity: 0 });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative w-full min-h-dvh"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* =====================================================
          KANVAS KOSONG — BEBAS KAMU DESAIN
      ===================================================== */}
      <div
        ref={canvasRef}
        className="
          relative
          w-full
          h-dvh
          flex
          items-center
          justify-center
          overflow-hidden
          bg-transparent
        "
      >
        {/* 
          🔥 KOSONG
          Bangun UI di sini:
          - horizontal scroll
          - cards
          - canvas
          - three.js
          - apa pun
        */}
      </div>
    </section>
  );
};

export default memo(ProjectSection);
