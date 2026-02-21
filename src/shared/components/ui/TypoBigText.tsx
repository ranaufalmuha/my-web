import React from "react";

type TypoBigTextProps = React.HTMLAttributes<HTMLHeadingElement>;

export const TypoBigText = ({
  children,
  className,
  ...props
}: TypoBigTextProps) => {
  return (
    <p
      {...props}
      className={
        "xl:text-7xl lg:text-6xl md:text-5xl sm:text-4xl text-3xl " + className
      }
    >
      {children}
    </p>
  );
};
