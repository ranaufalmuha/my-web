"use client";

import { Navbar } from "@/shared/components/layouts/Navbar";
import { Footer } from "@/shared/components/layouts/Footer";
import { useCursorLayer } from "@/shared/components/cursor/useCursorLayer";
import { CursorLayer } from "@/shared/components/cursor/CursorLayer";

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
