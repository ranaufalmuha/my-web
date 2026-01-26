"use client";

import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
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
  const [isTouchDevice, setIsTouchDevice] = useState<boolean | null>(null);

  useEffect(() => {
    const isTouch =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouchDevice(isTouch);
  }, []);

  useEffect(() => {
    if (isTouchDevice === null) return;
    if (!wrapperRef.current || !contentRef.current) return;

    if (isTouchDevice) {
      return;
    }

    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smoothWheel: true,
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
  }, [isTouchDevice]);

  return (
    <div
      ref={wrapperRef}
      data-lenis-wrapper={!isTouchDevice ? "true" : undefined}
      data-lenis-active={!isTouchDevice ? "true" : undefined}
      className={
        isTouchDevice
          ? "min-h-dvh overflow-visible"
          : "h-dvh overflow-hidden"
      }
    >
      <div ref={contentRef} data-lenis-content>
        {children}
      </div>
    </div>
  );
}
