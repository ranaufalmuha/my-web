import type { Metadata } from "next";
import "@/shared/style/globals.css";

import { CursorProvider } from "@/shared/components/cursor/CursorContext";
import { SmoothScrollProvider } from "@/shared/components/providers/SmoothScroll";
import { AppShell } from "@/shared/components/layouts/AppShell";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  metadataBase: new URL("https://ranaufalmuha.com"),
  title: {
    default: "Ranaufal Muha — Software Engineer",
    template: "%s",
  },
  description:
    "Software Engineer building interactive experiences, smart contracts, and Web3 products.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Ranaufal Muha",
  },
};

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
