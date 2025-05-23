import React, { createContext, useContext, useState } from "react";

interface CursorContextType {
  clientX: number;
  clientY: number;
  scale: number;
  handleMouseEnter: (val: number) => void;
  handleMouseLeave: () => void;
  setClientX: (x: number) => void;
  setClientY: (y: number) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [clientX, setClientX] = useState(150);
  const [clientY, setClientY] = useState(150);
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
        clientX,
        clientY,
        scale,
        handleMouseEnter,
        handleMouseLeave,
        setClientX,
        setClientY,
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
