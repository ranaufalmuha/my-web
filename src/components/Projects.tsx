"use client";

import { useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function Projects({ onMouseEnter, onMouseLeave }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const projectList = [
    {
      title: "Peridot",
      url: "https://peridot.icu",
      img_url: "./projects/peridot.webp",
      role: [
        { position: "Chief Executive Officer" },
        { position: "DApp Developer" },
        { position: "Smart Contract Developer" },
      ],
    },
    {
      title: "Wintr",
      url: "https://wintr.app",
      img_url: "./projects/wintr.webp",
      role: [
        { position: "Chief Executive Officer" },
        { position: "DApp Developer" },
        { position: "Smart Contract Developer" },
      ],
    },
    {
      title: "Lost Club Toys Wallet",
      url: "",
      img_url: "./projects/lost-club-toys.webp",
      role: [{ position: "Full Stack Web3 Developer" }],
    },
    {
      title: "AIAI",
      url: "",
      img_url: "./projects/aiai.webp",
      role: [
        { position: "Smart Contract Developer" },
        { position: "Web3 Integration" },
      ],
    },
    {
      title: "The Runner",
      url: "",
      img_url: "./projects/the-runner.png",
      role: [{ position: "Game Developer" }, { position: "Solo Project" }],
    },
  ];

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;

    if (!section || !container) return;

    let ctx: gsap.Context;
    let lenis: any;

    const createScrollTrigger = () => {
      // Clear previous context
      if (ctx) ctx.revert();

      // Integrasi dengan Lenis
      // @ts-ignore
      lenis = window.lenis;
      if (lenis) {
        lenis.on("scroll", ScrollTrigger.update);
      }

      // Hitung total width container
      const containerWidth = container.scrollWidth;
      const scrollDistance = containerWidth - window.innerWidth;

      console.log("Creating ScrollTrigger with distance:", scrollDistance);
      console.log("Window width:", window.innerWidth);
      console.log("Container width:", containerWidth);

      // Set height section berdasarkan scroll distance
      gsap.set(section, {
        height: `${scrollDistance + window.innerHeight}px`,
      });

      ctx = gsap.context(() => {
        gsap.to(container, {
          x: -scrollDistance,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `bottom bottom`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              console.log(
                `Progress: ${self.progress.toFixed(2)}, X: ${(
                  -scrollDistance * self.progress
                ).toFixed(0)}`
              );
            },
            onRefresh: () => {
              console.log("ScrollTrigger refreshed");
            },
          },
        });
      }, section);
    };

    // Initial setup dengan delay
    const timer = setTimeout(createScrollTrigger, 100);

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
      if (lenis) {
        lenis.off("scroll", ScrollTrigger.update);
      }
    };
  }, []);

  // Handle resize dengan recreate ScrollTrigger
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        console.log("Window resized, recreating ScrollTrigger...");

        const section = sectionRef.current;
        const container = containerRef.current;

        if (!section || !container) return;

        // Kill semua ScrollTrigger di section ini
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === section) {
            trigger.kill();
          }
        });

        // Recalculate dan recreate
        const containerWidth = container.scrollWidth;
        const scrollDistance = containerWidth - window.innerWidth;

        console.log("New scroll distance:", scrollDistance);

        // Update section height
        gsap.set(section, {
          height: `${scrollDistance + window.innerHeight}px`,
        });

        // Recreate ScrollTrigger
        gsap.to(container, {
          x: -scrollDistance,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `bottom bottom`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              console.log(
                `Progress: ${self.progress.toFixed(2)}, X: ${(
                  -scrollDistance * self.progress
                ).toFixed(0)}`
              );
            },
          },
        });

        // Refresh setelah recreate
        ScrollTrigger.refresh();
      }, 300);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative w-full overflow-hidden "
    >
      <div
        ref={containerRef}
        className="flex h-screen will-change-transform items-center gap-12 px-24"
      >
        {/* Section Work */}
        <div className="flex-shrink-0 text-white h-1/2 aspect-3/5 mr-8 py-8">
          <div className="flex flex-col justify-between h-full gap-8">
            {/* Title  */}
            <div className="flex flex-col gap-6">
              <h2 className="text-5xl font-normal">Projects</h2>
              <p className="text-2xl font-light">
                A selection of my crafted project, built from scratch by me
                in-house.
              </p>
            </div>
            {/* Hire Hook  */}
            <a
              href="/#resume"
              className="hover:scale-105 duration-300"
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              <span className="text-2xl border-b py-4">Hire Me →</span>
            </a>
          </div>
        </div>

        {/* Semua Projects dengan jarak sama */}
        {projectList.map((item, index) => (
          <Link
            key={index}
            to={item.url}
            target="_blank"
            className="flex-shrink-0 h-1/2 aspect-4/5"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div className="relative bg-black text-white p-12 w-full h-full transition-all flex flex-col justify-end gap-4 hover:bg-white hover:text-black hover:rotate-6 duration-300 group">
              <h3 className="text-4xl font-normal z-10">{item.title}</h3>
              <div className="flex flex-wrap gap-4 z-10">
                {item.role?.map((item, i) => (
                  <p
                    key={i}
                    className="text-sm border border-disabled/50 text-disabled p-2"
                  >
                    {item.position}
                  </p>
                ))}
              </div>

              <div className="">
                <img
                  src={item.img_url}
                  alt=""
                  className="absolute top-0 left-0 h-full w-full"
                />
                <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-t from-black via-black/50 group-hover:from-white group-hover:via-white/50 duration-300"></div>
              </div>
            </div>
          </Link>
        ))}
        <div className="mr-12 opacity-0">.</div>
      </div>
    </section>
  );
}
