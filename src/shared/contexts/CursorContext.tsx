"use client";

import React, { createContext, useContext, useState } from "react";

interface CursorContextType {
  scale: number;
  handleMouseEnter: (val: number) => void;
  handleMouseLeave: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scale, setScale] = useState(1);

  const handleMouseEnter = (val: number) => {
    setScale(val);
  };

  const handleMouseLeave = () => {
    setScale(1);
  };

  return (
    <CursorContext.Provider
      value={{
        scale,
        handleMouseEnter,
        handleMouseLeave,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
};
