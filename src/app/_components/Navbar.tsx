"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Container } from "@/shared/components/providers/Container";
import { useCursor } from "../../features/cursor/CursorContext";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_SCALE, HOVER_SCALE_DEFAULT } from "@/shared/constants/scale";
import Button from "@/shared/components/ui/Button";
import { LinkedinIcon } from "@/shared/assets/Icons";
import { FaXTwitter } from "react-icons/fa6";
import { PiGithubLogoFill } from "react-icons/pi";

const SOCIALS = [
  {
    href: "https://github.com/ranaufalmuha",
    label: "GitHub",
    Icon: PiGithubLogoFill,
  },
  {
    href: "https://linkedin.com/in/ranaufalmuha",
    label: "LinkedIn",
    Icon: LinkedinIcon,
  },
  {
    href: "https://x.com/ranaufalmuha",
    label: "X",
    Icon: FaXTwitter,
  },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const AnimatedBookCell = () => {
  const [pastHero, setPastHero] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const hero = document.getElementById("hero-screen");
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const watch = new IntersectionObserver(([entry]) => {
      setPastHero(!entry.isIntersecting);
    });
    watch.observe(hero);
    return () => watch.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {pastHero && (
        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE }}
          className="flex items-center self-stretch border-l border-white/10 overflow-hidden"
        >
          <span className="flex flex-none items-center whitespace-nowrap">
            <Button href="/#booking" text="Book a Call" variant="color" />
          </span>
        </motion.span>
      )}
    </AnimatePresence>
  );
};

export const Navbar = () => {
  const { setScale } = useCursor();
  return (
      <nav className="fixed w-full bg-surface z-20 border-b">
      <Container className="flex justify-between items-center h-12">
        <Link href={"/#hero"} className="flex items-center justify-center aspect-square self-stretch border-r border-white/10">
          <span className="relative block h-5 w-5">
            <Image
              src="/logo-white.png"
              alt="Logo Ranaufal Muha"
              draggable={false}
              fill
              className="object-contain pointer-events-auto"
              onMouseEnter={() => setScale(HOVER_SCALE_DEFAULT)}
              onMouseLeave={() => setScale(DEFAULT_SCALE)}
            />
          </span>
        </Link>
        <div className="flex items-stretch self-stretch">
          {SOCIALS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              onMouseEnter={() => setScale(HOVER_SCALE_DEFAULT)}
              onMouseLeave={() => setScale(DEFAULT_SCALE)}
              className="flex items-center justify-center aspect-square border-l border-white/10 hover:bg-foreground/5"
            >
              <Icon size={20} />
            </Link>
          ))}
          <AnimatedBookCell />
        </div>
      </Container>
      </nav>
  );
};
