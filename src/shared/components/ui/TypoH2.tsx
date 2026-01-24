import React from "react";

type TypoH2Props = React.HTMLAttributes<HTMLHeadingElement>;

export const TypoH2 = ({ children, className, ...props }: TypoH2Props) => {
  return (
    <h2
      {...props}
      className={
        "lg:text-6xl md:text-5xl sm:text-4xl text-3xl text-white " + className
      }
    >
      {children}
    </h2>
  );
};
