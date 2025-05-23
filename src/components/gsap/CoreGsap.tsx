import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function MyScrollTrigger(container: HTMLElement | null) {
  gsap.registerPlugin(ScrollTrigger);

  if (!container) return;

  const sections = gsap.utils.toArray<HTMLElement>(".myPanel");

  if (sections.length === 0) return;

  // Calculate the total width properly
  const totalWidth = (sections.length - 1) * 100;

  gsap.to(sections, {
    xPercent: -totalWidth,
    // ease: "none",
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1,
      snap: 1 / (sections.length - 1),
      start: "top top",
      end: () => `+=${container.scrollWidth}`,
      markers: true, // Remove in production, helps for debugging
    },
  });
}
