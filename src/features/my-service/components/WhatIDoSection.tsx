"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/shared/lib/gsap";

export const WhatIDoSection = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scroller = document.querySelector(
        "[data-lenis-wrapper]",
      ) as HTMLElement | null;

      if (
        !sectionRef.current ||
        !titleRef.current ||
        !contentRef.current ||
        !scroller
      )
        return;

      // TITLE — TIDAK DIUBAH SAMA SEKALI
      animateTitle({
        section: sectionRef.current,
        title: titleRef.current,
        scroller,
      });

      // CONTENT — TIDAK NUNGGU TITLE
      animateContent({
        section: sectionRef.current,
        content: contentRef.current,
        scroller,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="-z-1">
      <section ref={sectionRef} className="relative">
        <div className="sticky top-0 h-dvh">
          {/* TITLE */}
          <div
            ref={titleRef}
            className="absolute inset-x-0 top-0 h-1/2 flex justify-center pointer-events-none z-0"
          >
            <h2 className="lg:text-7xl md:text-6xl text-5xl text-white">
              What I <span className="font-fraunces">do?</span>
            </h2>
          </div>

          {/* CONTENT */}
          <div
            ref={contentRef}
            className="absolute inset-0 flex flex-col gap-12 items-center justify-center"
          >
            <Card
              title="Frontend Development"
              text="Design is more than looks — it’s about clarity and connection."
            />
            <Card
              title="Search Engine Optimation"
              text="Design is more than looks — it’s about clarity and connection."
            />
            <Card
              title="Smart Contract Development"
              text="Design is more than looks — it’s about clarity and connection."
            />
          </div>
        </div>
      </section>
    </div>
  );

  /* ===========================
     ANIMATIONS
  =========================== */

  function animateTitle({
    section,
    title,
    scroller,
  }: {
    section: HTMLElement;
    title: HTMLElement;
    scroller: HTMLElement;
  }) {
    return gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          scroller,
          start: "top 95%",
          end: "center top",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      })
      .fromTo(title, { yPercent: -20 }, { yPercent: -80, ease: "none" });
  }

  function animateContent({
    section,
    content,
    scroller,
  }: {
    section: HTMLElement;
    content: HTMLElement;
    scroller: HTMLElement;
  }) {
    return gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          scroller,
          start: "-30% 70%", // ⬅️ mulai SAAT TITLE MASIH JALAN
          end: "top top", // ⬅️ selesai SEBELUM TITLE HABIS
          scrub: true,
        },
      })
      .fromTo(
        content,
        { yPercent: 40, opacity: 0 },
        { yPercent: -20, opacity: 1, ease: "none" },
      );
  }

  function Card({ title, text }: { title: string; text: string }) {
    return (
      <section className="max-w-150 w-full p-8 bg-black">
        <h3 className="text-2xl">{title}</h3>
        <p>{text}</p>
      </section>
    );
  }
};
