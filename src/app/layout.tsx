"use client";

import "@/shared/style/globals.css";

import { CursorProvider } from "@/features/cursor/CursorContext";
import { SmoothScrollProvider } from "@/shared/components/providers/SmoothScroll";
import { AppShell } from "@/shared/components/layouts/AppShell";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <CursorProvider>
          <SmoothScrollProvider>
            <AppShell>{children}</AppShell>
          </SmoothScrollProvider>
        </CursorProvider>
        <GoogleAnalytics gaId="G-JL2R2KG3W1" />
      </body>
    </html>
  );
}
