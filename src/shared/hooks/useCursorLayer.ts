"use client";

import { useEffect, useRef } from "react";

export function useCursorLayer() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<number | null>(null);
    const positionRef = useRef({ x: 150, y: 150 });

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        positionRef.current = { x: e.clientX, y: e.clientY };

        if (frameRef.current !== null) return;

        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = null;
            if (!cursorRef.current) return;

            cursorRef.current.style.setProperty(
                "--cursor-x",
                `${positionRef.current.x}px`,
            );
            cursorRef.current.style.setProperty(
                "--cursor-y",
                `${positionRef.current.y}px`,
            );
        });
    };

    useEffect(() => {
        return () => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    return {
        cursorRef,
        handleMouseMove,
    };
}
