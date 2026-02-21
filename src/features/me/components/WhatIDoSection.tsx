"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/shared/lib/gsap";
import { Container } from "@/shared/components/providers/Container";
import { ContainerCard } from "@/shared/components/providers/ContainerCard";
import { TypoBigText } from "@/shared/components/ui/TypoBigText";
import { TbAppsFilled, TbSpeedboat } from "react-icons/tb";
import { GiBreakingChain } from "react-icons/gi";
import clsx from "clsx";
import { IconType } from "react-icons/lib";

export const WhatIDoSection = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scroller = document.querySelector(
        "[data-lenis-wrapper]",
      ) as HTMLElement | null;

      if (!sectionRef.current || !titleRef.current || !scroller) return;

      // TITLE — TIDAK DIUBAH SAMA SEKALI
      animateTitle({
        section: sectionRef.current,
        title: titleRef.current,
        scroller,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Container className="-z-1 relative">
      <section ref={sectionRef} className="h-full w-full ">
        <div className="top-0 min-h-dvh">
          {/* TITLE */}
          <div
            ref={titleRef}
            className={clsx(
              "md:absolute md:min-h-1/4 md:inset-x-0",
              "flex items-center justify-center pointer-events-none -z-1",
              "max-md:py-20",
            )}
          >
            <h2 className="lg:text-8xl md:text-7xl sm:text-6xl text-5xl text-white">
              What I <span className="font-fraunces-italic">do?</span>
            </h2>
          </div>
          <div className="md:h-screen" />

          {/* CONTENT */}
          <div className="w-full flex flex-col items-center justify-center border-b bg-background">
            <ContainerCard className="border-y bg-surface">
              <TypoBigText className="md:py-24 py-14 text-center text-paragraph">
                Building
                <span className="text-foreground"> Interactive </span>
                and <br />
                <span className="text-primary"> Engaging </span>
                Interfaces
              </TypoBigText>
            </ContainerCard>
            <div className="w-full">
              <Card
                title="Frontend Development"
                text="I build interactive interfaces that feel smooth and intuitive to use. I focus on creating experiences that are reliable, scalable, and enjoyable in real-world products."
                list={[
                  "Architecture",
                  "Components",
                  "Scalability",
                  "Maintainability",
                ]}
                Icon={TbAppsFilled}
              />

              <Card
                title="Performance & UX"
                text="I care about how a product feels when people use it every day. I work on making interfaces faster, clearer, and more comfortable across different devices."
                list={[
                  "Performance",
                  "Responsiveness",
                  "Consistency",
                  "Usability",
                ]}
                Icon={TbSpeedboat}
              />

              <Card
                title="Blockchain Exploration"
                text="I explore how blockchain can be used in real products beyond just theory. I focus on building practical experiences that connect on-chain systems with real users."
                list={["Web3 UX", "On-chain", "Data Flow", "Prototyping"]}
                Icon={GiBreakingChain}
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
    scroller: HTMLElement;
  }) {
    return gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          scroller,
          start: "top 90%",
          end: "bottom 90%",
          scrub: true,
          // pin: true,
          anticipatePin: 1,
          // markers: true,
        },
      })
      .fromTo(title, { yPercent: -60 }, { yPercent: 200, ease: "none" });
  }

  function Card({
    title,
    text,
    list,
    Icon,
  }: {
    title: string;
    text: string;
    list: string[];
    Icon: IconType;
  }) {
    return (
      <section>
        <div className="border-t grid lg:grid-cols-6 sm:grid-cols-4 grid-cols-2 sm:gap-8 ">
          <div className="sm:border-r sm:py-8 max-sm:col-span-2">
            <div className="w-full bg-linear-to-b from-primary to-primary-foreground aspect-4/5 flex items-center justify-center">
              <Icon className="w-1/2 h-1/2" />
            </div>
          </div>
          {/* <div className="max-lg:hidden"></div> */}

          <div className="lg:col-span-3 col-span-2 flex justify-center max-sm:border-b max-sm:py-8">
            <div className="flex flex-col justify-center gap-4">
              <h3 className="lg:text-5xl md:text-4xl text-3xl max-sm:text-4xl">
                {title}
              </h3>
              <p className="max-md:text-sm max-sm:text-base text-paragraph">
                {text}
              </p>
            </div>
          </div>

          <div className="max-lg:hidden"></div>
          <div className="flex flex-col justify-center w-full gap-4 sm:border-l max-sm:border-r max-sm:py-8">
            <span>Stacks:</span>
            <ul className="flex flex-col items-start gap-2">
              {list.map((item, index) => (
                <li
                  key={index}
                  className="py-1 px-2 border text-xs font-ibm-plex-mono bg-foreground/5 uppercase"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }
};

// React, next, tailwind,css gsap, state management, HTML, CSS, JavaScript (ES6+), TypeScript, viem,
