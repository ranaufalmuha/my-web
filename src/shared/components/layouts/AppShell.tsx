"use client";

import { Navbar } from "@/app/_components/Navbar";
import { Footer } from "@/app/_components/Footer";
import { useCursorLayer } from "@/shared/hooks/useCursorLayer";
import { CursorLayer } from "../CursorLayer";
import { BackgroundRippleEffect } from "../ui/BackgroundRippleEffect";

interface Props {
  children: React.ReactNode;
}

export function AppShell({ children }: Props) {
  const { cursorRef, handleMouseMove } = useCursorLayer();

  return (
    <main className="cursor-crosshair" onMouseMove={handleMouseMove}>
      <Navbar />
      <div className="flex flex-col justify-between min-h-dvh relative z-2">
        {children}
        <Footer />
      </div>

      <BackgroundRippleEffect />
      <CursorLayer cursorRef={cursorRef} />
    </main>
  );
}
