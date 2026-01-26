"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smoothWheel: true,
      // smoothTouch: isTouch,
      syncTouch: true,
    });

    // 🔑 CONNECT LENIS → SCROLLTRIGGER
    ScrollTrigger.scrollerProxy(wrapperRef.current, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value!, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: wrapperRef.current.style.transform ? "transform" : "fixed",
    });

    lenis.on("scroll", ScrollTrigger.update);
    ScrollTrigger.defaults({ scroller: wrapperRef.current });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    ScrollTrigger.refresh();

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-lenis-wrapper
      className="h-dvh overflow-y-auto overscroll-contain"
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
