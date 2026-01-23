"use client";

/* eslint-disable @next/next/no-img-element */

import { useCursor } from "../../shared/contexts/CursorContext";

export const Navbar = () => {
  const { handleMouseEnter, handleMouseLeave } = useCursor();
  return (
    <nav className="flex justify-center fixed w-full bg-surface z-20 pointer-events-none h-16">
      <div className="max-w-7xl w-full relative">
        <img
          src="./logo-white.png"
          alt=""
          draggable={false}
          className="w-10 h-10 object-contain pointer-events-auto"
          onMouseEnter={() => handleMouseEnter(2)}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </nav>
  );
};
