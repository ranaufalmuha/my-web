"use client";

import { Container } from "@/shared/components/providers/Container";
import { useCursor } from "../../features/cursor/CursorContext";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_SCALE, HOVER_SCALE_DEFAULT } from "@/shared/constants/scale";

export const Navbar = () => {
  const { setScale } = useCursor();
  return (
    <nav className="fixed w-full bg-surface z-20 border-b">
      <Container className="p-4 flex justify-center items-center">
        <Link href={"/#hero"} className="flex items-center gap-2 p-4 relative">
          <Image
            src="/logo-white.png"
            alt="Logo Ranaufal Muha"
            draggable={false}
            fill
            className="w-8 h-8 object-contain pointer-events-auto"
            onMouseEnter={() => setScale(HOVER_SCALE_DEFAULT)}
            onMouseLeave={() => setScale(DEFAULT_SCALE)}
          />
        </Link>
      </Container>
    </nav>
  );
};
