import clsx from "clsx";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const Container = ({ children, className }: Props) => {
  return (
    <div className="flex justify-center">
      <div
        className={clsx(
          "max-w-7xl w-full",
          "lg:mx-10 md:mx-8 mx-6",
          "border-x",
          "duration-300",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};
