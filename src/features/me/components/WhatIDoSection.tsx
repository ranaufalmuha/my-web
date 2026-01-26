"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/shared/lib/gsap";
import { Container } from "@/shared/components/providers/Container";
import { ContainerCard } from "@/shared/components/providers/ContainerCard";
import { TypoBigText } from "@/shared/components/ui/TypoBigText";

export const WhatIDoSection = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scroller = document.querySelector(
        '[data-lenis-active="true"]',
      ) as HTMLElement | null;

      if (!sectionRef.current || !titleRef.current || !contentRef.current)
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
    <Container className="-z-1 relative">
      <section ref={sectionRef} className="h-full w-full ">
        <div className="top-0 min-h-dvh  ">
          {/* TITLE */}
          <div
            ref={titleRef}
            className="absolute inset-x-0 top-0 flex items-center justify-center pointer-events-none z-0 h-1/3"
          >
            <h2 className="lg:text-8xl md:text-7xl sm:text-6xl text-5xl text-white">
              What I <span className="font-fraunces">do?</span>
            </h2>
          </div>

          {/* CONTENT */}
          <div
            ref={contentRef}
            className="w-full flex flex-col items-center justify-center border-b "
          >
            <ContainerCard className="border-y bg-surface">
              <TypoBigText className="py-24 text-center text-paragraph">
                Building
                <span className="text-foreground"> Interactive </span>
                and <br />
                <span className="text-primary"> Engaging </span>
                Interfaces
              </TypoBigText>
            </ContainerCard>
            <div className="w-full">
              <Card
                index={1}
                title="Frontend Development"
                text="I build clean, interactive, and production-ready web interfaces using modern frontend technologies. I focus on writing maintainable code, structuring components properly, and turning designs into reliable, real-world applications. My goal is to create interfaces that feel smooth, intuitive, and easy to scale."
                list={[
                  "React / Next.js, Tailwind CSS, GSAP",
                  "State management & UI logic",
                  "HTML, CSS, JavaScript (ES6+), TypeScript",
                  "API integration & async data handling",
                ]}
              />

              <Card
                index={2}
                title="Performance & UX Optimization"
                text="I care deeply about performance, usability, and how users experience a product. I optimize interfaces to load faster, feel responsive, and work well across different devices and screen sizes. Small details, consistency, and smooth interactions are key parts of my approach."
                list={[
                  "Responsive & mobile-first UX",
                  "SEO fundamentals (semantic HTML, metadata)",
                  "UI consistency & usability",
                  "Smooth interactions & micro-animations",
                ]}
              />

              <Card
                index={3}
                title="Blockchain (Applied & Experimental)"
                text="I explore blockchain concepts through practical frontend and system-level experiments. This includes building user interfaces that interact with smart contracts and understanding how on-chain and off-chain data work together. I treat blockchain as a space for research, prototyping, and long-term product ideas."
                list={[
                  "Web3 UI & wallet integration",
                  "Smart contract interaction",
                  "On-chain & off-chain data flow",
                  "Research & prototyping",
                ]}
              />
            </div>
          </div>
        </div>
      </section>
    </Container>
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
    scroller: HTMLElement | null;
  }) {
    return gsap
      .timeline({
        scrollTrigger: {
          ...(scroller ? { scroller } : {}),
          trigger: section,
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      })
      .fromTo(title, { yPercent: -70 }, { yPercent: -120, ease: "none" });
  }

  function animateContent({
    section,
    content,
    scroller,
  }: {
    section: HTMLElement;
    content: HTMLElement;
    scroller: HTMLElement | null;
  }) {
    return gsap
      .timeline({
        scrollTrigger: {
          ...(scroller ? { scroller } : {}),
          trigger: section,
          start: "-=18% center",
          end: "bottom center",
          scrub: true,
        },
      })
      .fromTo(
        content,
        { opacity: 0, yPercent: 120 },
        { opacity: 1, duration: 0.01 },
      )
      .fromTo(content, { yPercent: 0 }, { yPercent: -30 })
      .fromTo(content, { yPercent: -30 }, { yPercent: 0 });
  }

  function Card({
    index,
    title,
    text,
    list,
  }: {
    title: string;
    text: string;
    list: string[];
    index: number;
  }) {
    return (
      <section>
        <ContainerCard className="border-t grid md:grid-cols-2 gap-8 justify-between aspect-2/1">
          <h3 className="lg:text-5xl sm:text-4xl text-3xl">
            <span className="text-paragraph font-fraunces">
              0{index}. &nbsp;
            </span>
            {title}
          </h3>

          <div className="flex flex-col justify-between w-full md:text-xl  gap-8">
            <p className="md:text-xl text-paragraph">{text}</p>
            <ul className="flex flex-col ">
              {list.map((item, index) => (
                <li key={index} className="py-4 border-t">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </ContainerCard>
      </section>
    );
  }
};
