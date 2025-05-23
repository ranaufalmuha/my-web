"use client";

import { useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const projectList = [
    {
      title: "Peridot",
      url: "",
      description:
        "A Blockchain Gaming Platform that allows you to Buy, Download and Play your favorite Games.",
      className: "",
    },
    {
      title: "Project 2 And Project",
      url: "",
      description: "",
      className: "",
    },
    {
      title: "Project 3 And Project",
      url: "",
      description: "",
      className: "",
    },
    {
      title: "Project 4 And Project",
      url: "",
      description: "",
      className: "",
    },
    {
      title: "Project 5 And Project",
      url: "",
      description: "",
      className: "",
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

      const panels = gsap.utils.toArray<HTMLElement>(".myPanel");

      // Hitung scroll distance dengan lebih akurat
      const getScrollDistance = () => {
        let totalWidth = 0;
        panels.forEach((panel) => {
          totalWidth += panel.offsetWidth;
        });
        return totalWidth - window.innerWidth;
      };

      const scrollDistance = getScrollDistance();

      console.log("Creating ScrollTrigger with distance:", scrollDistance);
      console.log("Window width:", window.innerWidth);
      console.log("Container width:", container.scrollWidth);

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
            snap: {
              snapTo: 1 / (projectList.length - 1), // 1 panel per snap
              duration: { min: 0.2, max: 0.5 }, // Durasi animasi snap
              ease: "power1.inOut",
            },
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
        const panels = gsap.utils.toArray<HTMLElement>(".myPanel");
        const getScrollDistance = () => {
          let totalWidth = 0;
          panels.forEach((panel) => {
            totalWidth += panel.offsetWidth;
          });
          return totalWidth - window.innerWidth;
        };

        const scrollDistance = getScrollDistance();

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
      }, 300); // Delay lebih lama untuk resize
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
      className="relative w-full overflow-hidden"
    >
      <div
        ref={containerRef}
        className="flex h-screen will-change-transform bg-second-background"
        style={{ width: `${projectList.length * 100}vw` }}
      >
        {projectList.map((item, index) => (
          <div
            key={index}
            className={`myPanel w-screen h-screen flex items-center justify-center gap-12 text-white flex-shrink-0 p-8 ${item.className}`}
          >
            {/* Title  */}
            <div className="flex flex-col justify-between h-1/2 min-h-[500px] aspect-[4/5] py-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-4xl font-semibold">Work</h2>
                <p className="text-xl">
                  A selection of our crafted work, built from scratch by our
                  talented in-house team.
                </p>
              </div>
              <div className="hover:scale-105 duration-300">
                <Link to={""} className="border-b text-2xl py-4 ">
                  <span>Got to Project → </span>
                </Link>
              </div>
            </div>

            {/* Image  */}
            <div className="bg-accent min-h-[500px] h-1/2 aspect-square hover:bg-white hover:text-black hover:rotate-6 duration-300 transition-all"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
