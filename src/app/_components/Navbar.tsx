"use client";

import { Container } from "@/shared/components/providers/Container";
/* eslint-disable @next/next/no-img-element */

import { useCursor } from "../../shared/contexts/CursorContext";

export const Navbar = () => {
  const { handleMouseEnter, handleMouseLeave } = useCursor();
  return (
    <nav className="fixed w-full bg-surface z-20 border-b">
      <Container className="p-4 flex justify-center items-center">
        <div className="flex items-center gap-2">
          <img
            src="./logo-white.png"
            alt=""
            draggable={false}
            className="w-8 h-8 object-contain pointer-events-auto"
            onMouseEnter={() => handleMouseEnter(2)}
            onMouseLeave={handleMouseLeave}
          />
        </div>
      </Container>
    </nav>
  );
};
