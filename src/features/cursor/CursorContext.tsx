"use client";

import { DEFAULT_SCALE } from "@/shared/constants/scale";
import React, { createContext, useContext, useState } from "react";

interface CursorContextType {
  scale: number;
  setScale: (value: number) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState<number>(DEFAULT_SCALE);

  return (
    <CursorContext.Provider value={{ scale, setScale }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) {
    throw new Error("useCursor must be used within CursorProvider");
  }
  return ctx;
}
