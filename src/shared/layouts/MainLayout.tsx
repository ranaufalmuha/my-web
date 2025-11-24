import React from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { useMediaQuery } from "react-responsive";
import { MobileUI } from "./../pages/MobileUI";
import { CursorProvider, useCursor } from "../contexts/CursorContext";

export const MainLayout = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 1000px)" });

  return (
    <CursorProvider>
      <MainLayoutContent isMobile={isMobile} />
    </CursorProvider>
  );
};

const MainLayoutContent: React.FC<
  React.PropsWithChildren<{ isMobile: boolean }>
> = ({ isMobile }) => {
  const { clientX, clientY, scale, setClientX, setClientY } = useCursor();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setClientX(e.clientX);
    setClientY(e.clientY);
  };

  return (
    <main
      className="overflow-hidden cursor-crosshair scroll-smooth"
      onMouseMove={handleMouseMove}
    >
      {isMobile ? (
        <div className="h-dvh w-dvw">
          <Navbar />
          <MobileUI />
        </div>
      ) : (
        <div className="flex flex-col justify-between min-h-dvh">
          <Navbar />
          <Outlet />
          <Footer />

          {/* Background layer */}
          <div
            className="fixed top-0 left-0 w-full h-full pointer-events-none -z-50"
            style={{
              backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
              backgroundSize: "15px 15px",
            }}
          ></div>
          <div className="absolute w-full h-[120dvh] bg-gradient-to-b from-[#1c1c1c] top-0 -z-50"></div>
        </div>
      )}

      {/* Cursor layer */}
      <div
        className="fixed pointer-events-none top-0 left-0 w-full h-full z-20"
        style={{ mixBlendMode: "difference" }}
      >
        <div
          className="absolute w-[50px] h-[50px] rounded-full bg-white transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100"
          style={{
            top: `${clientY}px`,
            left: `${clientX}px`,
            transform: `translate(0%, 0%) scale(${scale})`,
          }}
        ></div>
      </div>
    </main>
  );
};
