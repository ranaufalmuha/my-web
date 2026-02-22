"use client";

import { Navbar } from "@/app/_components/Navbar";
import { Footer } from "@/app/_components/Footer";
import { useCursorLayer } from "@/features/cursor/useCursorLayer";
import { CursorLayer } from "@/features/cursor/CursorLayer";
// import { BackgroundRippleEffect } from "../ui/BackgroundRippleEffect";

interface Props {
  children: React.ReactNode;
}

export function AppShell({ children }: Props) {
  const { cursorRef } = useCursorLayer();

  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <div className="flex flex-col justify-between min-h-dvh relative z-2">
        {children}
        <Footer />
      </div>

      {/* <BackgroundRippleEffect /> */}
      <CursorLayer cursorRef={cursorRef} />
    </main>
  );
}
