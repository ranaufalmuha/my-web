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
        "xl:text-8xl lg:text-7xl md:text-6xl sm:text-5xl text-4xl " + className
      }
    >
      {children}
    </p>
  );
};
