"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "@/shared/style/globals.css";

import { CursorProvider } from "@/shared/contexts/CursorContext";
import { SmoothScrollProvider } from "@/shared/components/providers/SmoothScroll";
import { AppShell } from "@/shared/components/layouts/AppShell";

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CursorProvider>
          <SmoothScrollProvider>
            <AppShell>{children}</AppShell>
          </SmoothScrollProvider>
        </CursorProvider>
      </body>
    </html>
  );
}
