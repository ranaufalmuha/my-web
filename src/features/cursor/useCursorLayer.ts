"use client";

import { useEffect, useRef } from "react";
import { useCursor } from "@/features/cursor/CursorContext";
import { DEFAULT_SCALE } from "@/shared/constants/scale";

export function useCursorLayer() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const { scale } = useCursor();

    const position = useRef({ x: 0, y: 0 });
    const currentScale = useRef(1);
    const visible = useRef(false);

    useEffect(() => {
        const el = cursorRef.current;
        if (!el) return;

        // 👉 mouse move
        const move = (e: MouseEvent) => {
            position.current.x = e.clientX;
            position.current.y = e.clientY;

            visible.current = true;
            el.style.opacity = "1";
        };

        // 👉 keluar window
        const leave = () => {
            visible.current = false;
            el.style.opacity = "0";
        };

        // 👉 masuk lagi
        const enter = () => {
            visible.current = true;
            el.style.opacity = "1";
        };

        // 👉 sembunyi di atas iframe (event mouse tidak menembus iframe cross-origin)
        const overFrame = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (target?.closest?.("iframe")) {
                visible.current = false;
                el.style.opacity = "0";
            }
        };
        const outFrame = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            const related = e.relatedTarget as HTMLElement | null;
            if (target?.closest?.("iframe") && !related?.closest?.("iframe")) {
                visible.current = true;
                el.style.opacity = "1";
            }
        };

        const loop = () => {
            currentScale.current += (scale - currentScale.current) * DEFAULT_SCALE;

            if (visible.current) {
                const { x, y } = position.current;

                el.style.transform = `
          translate3d(${x}px, ${y}px, 0)
          translate(-50%, -50%)
          scale(${currentScale.current})
        `;
            }

            requestAnimationFrame(loop);
        };

        window.addEventListener("mousemove", move, { passive: true });
        window.addEventListener("mouseleave", leave);
        window.addEventListener("mouseenter", enter);
        window.addEventListener("mouseover", overFrame);
        window.addEventListener("mouseout", outFrame);

        requestAnimationFrame(loop);

        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseleave", leave);
            window.removeEventListener("mouseenter", enter);
            window.removeEventListener("mouseover", overFrame);
            window.removeEventListener("mouseout", outFrame);
        };
    }, [scale]);

    return { cursorRef };
}
