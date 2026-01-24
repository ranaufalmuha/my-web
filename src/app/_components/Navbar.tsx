"use client";

/* eslint-disable @next/next/no-img-element */

import { useCursor } from "../../shared/contexts/CursorContext";

export const Navbar = () => {
  const { handleMouseEnter, handleMouseLeave } = useCursor();
  return (
    <nav className="flex justify-center fixed w-full bg-surface z-20 pointer-events-none h-16 items-center border-b">
      <div className="max-w-7xl w-full relative">
        <div className="flex items-center gap-2">
          <img
            src="./logo-white.png"
            alt=""
            draggable={false}
            className="w-8 h-8 object-contain pointer-events-auto"
            onMouseEnter={() => handleMouseEnter(2)}
            onMouseLeave={handleMouseLeave}
          />
          <span className="font-bold">Ranaufal Muha</span>
        </div>
      </div>
    </nav>
  );
};
