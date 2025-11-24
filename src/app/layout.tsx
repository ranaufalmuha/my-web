"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "@/shared/style/globals.css";
import { CursorProvider, useCursor } from "@/shared/contexts/CursorContext";
import { Navbar } from "./_components/Navbar";
import { MobileUI } from "@/shared/components/MobileUI";
import { Footer } from "./_components/Footer";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CursorProvider>
          <MainLayoutContent>{children}</MainLayoutContent>
        </CursorProvider>
      </body>
    </html>
  );
}

const MainLayoutContent: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
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
          {children}
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
          <div className="absolute w-full h-[120dvh] bg-linear-to-b from-second-background top-0 -z-50"></div>
        </div>
      )}

      {/* Cursor layer */}
      <div
        className="fixed pointer-events-none top-0 left-0 w-full h-full z-20"
        style={{ mixBlendMode: "difference" }}
      >
        <div
          className="absolute w-[50px] h-[50px] rounded-full bg-white transition-transform duration-100"
          style={{
            top: `${clientY}px`,
            left: `${clientX}px`,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        ></div>
      </div>
    </main>
  );
};
