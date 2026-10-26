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
    const inFrame = useRef(false);

    useEffect(() => {
        const el = cursorRef.current;
        if (!el) return;

        // 👉 mouse move (selalu update posisi dulu, baru tampil → tanpa lompatan)
        const move = (e: MouseEvent) => {
            position.current.x = e.clientX;
            position.current.y = e.clientY;

            if (!inFrame.current) {
                visible.current = true;
                el.style.opacity = "1";
            }
        };

        // 👉 masuk ke iframe (event mouse tidak menembus iframe cross-origin)
        const over = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (target?.closest?.("iframe")) {
                inFrame.current = true;
                visible.current = false;
                el.style.opacity = "0";
            }
        };

        const out = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            const related = e.relatedTarget as HTMLElement | null;
            if (!related) {
                // pointer keluar window → sembunyi, jangan stuck di posisi terakhir
                inFrame.current = false;
                visible.current = false;
                el.style.opacity = "0";
                return;
            }
            if (target?.closest?.("iframe") && !related.closest?.("iframe")) {
                // keluar iframe → tetap sembunyi sampai mousemove berikutnya
                inFrame.current = false;
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
        document.addEventListener("mouseover", over);
        document.addEventListener("mouseout", out);

        requestAnimationFrame(loop);

        return () => {
            window.removeEventListener("mousemove", move);
            document.removeEventListener("mouseover", over);
            document.removeEventListener("mouseout", out);
        };
    }, [scale]);

    return { cursorRef };
}
