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

    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    // Smooth-scroll semua anchor satu halaman via lenis (ganti lompatan instan bawaan browser)
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href*="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;
      const id = href.slice(hashIndex + 1);
      if (!id) return;
      try {
        if (new URL(anchor.href).pathname !== window.location.pathname) return;
      } catch {
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    };
    document.addEventListener("click", onAnchorClick, true);

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
      document.removeEventListener("click", onAnchorClick, true);
      (window as unknown as { lenis?: Lenis }).lenis = undefined;
      lenis.destroy();
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-lenis-wrapper
      className="h-dvh overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
