import clsx from "clsx";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const ContainerCard = ({ children, className }: Props) => {
  return (
    <div
      className={clsx(
        "w-full",
        "lg:p-10 md:p-8 p-6",
        "duration-300",
        className,
      )}
    >
      {children}
    </div>
  );
};
