"use client";

import { Container } from "@/shared/components/providers/Container";
/* eslint-disable @next/next/no-img-element */

import { useCursor } from "../../shared/contexts/CursorContext";
import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  const { handleMouseEnter, handleMouseLeave } = useCursor();
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
            onMouseEnter={() => handleMouseEnter(2)}
            onMouseLeave={handleMouseLeave}
          />
        </Link>
      </Container>
    </nav>
  );
};
