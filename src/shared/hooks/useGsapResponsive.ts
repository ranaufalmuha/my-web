"use client";

import { useLayoutEffect } from "react";
import { gsap } from "@/shared/lib/gsap";

type GsapResponsiveConfig = {
    desktop: () => (() => void) | void;
    mobile?: () => (() => void) | void;
    breakpoint?: number;
};

export function useGsapResponsive(config: GsapResponsiveConfig) {
    const { desktop, mobile, breakpoint = 768 } = config;

    useLayoutEffect(() => {
        const mm = gsap.matchMedia();

        // ✅ DESKTOP
        mm.add(`(min-width: ${breakpoint}px)`, () => {
            return desktop();
        });

        // ✅ MOBILE
        if (mobile) {
            mm.add(`(max-width: ${breakpoint - 1}px)`, () => {
                return mobile();
            });
        }

        return () => mm.revert();
    }, [breakpoint, desktop, mobile]);
}
