"use client";

export function BackgroundLayer() {
  return (
    <>
      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none -z-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "15px 15px",
        }}
      />
      <div className="absolute w-full h-full bg-linear-to-b from-second-background top-0 -z-50" />
    </>
  );
}
