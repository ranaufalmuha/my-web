"use client";

import { RefObject } from "react";

interface Props {
  cursorRef: RefObject<HTMLDivElement | null>;
}

export function CursorLayer({ cursorRef }: Props) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-9999"
      style={{
        mixBlendMode: "difference",
        isolation: "isolate",
      }}
    >
      <div
        ref={cursorRef}
        className="
          absolute
          w-4 h-4
          duration-20
          rounded
          bg-white
          will-change-transform
        "
        style={{
          opacity: 0, // start hidden
        }}
      />
    </div>
  );
}
