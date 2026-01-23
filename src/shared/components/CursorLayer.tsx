"use client";

import { useCursor } from "@/shared/contexts/CursorContext";

interface Props {
  cursorRef: React.RefObject<HTMLDivElement | null>;
}

export function CursorLayer({ cursorRef }: Props) {
  const { scale } = useCursor();

  return (
    <div
      className="fixed pointer-events-none top-0 left-0 w-full h-full z-20"
      style={{ mixBlendMode: "difference" }}
    >
      <div
        ref={cursorRef}
        className="absolute w-[50px] h-[50px] rounded-full bg-white transition-transform duration-100"
        style={{
          transform: `
            translate3d(var(--cursor-x, 150px), var(--cursor-y, 150px), 0)
            translate(-50%, -50%)
            scale(${scale})
          `,
        }}
      />
    </div>
  );
}
