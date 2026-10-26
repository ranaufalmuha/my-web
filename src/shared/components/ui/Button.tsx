import { useCursor } from "@/features/cursor/CursorContext";
import { DEFAULT_SCALE, HOVER_SCALE_DEFAULT } from "@/shared/constants/scale";
import clsx from "clsx";
import Link from "next/link";

type Props = {
  href: string;
  text: string;
  variant?: "color" | "transparent" | "light";
  className?: string;
};

export default function Button({ href, text, variant = "color", className }: Props) {
  const { setScale } = useCursor();

  return (
    <Link
      href={href}
      onMouseEnter={() => setScale(HOVER_SCALE_DEFAULT)}
      onMouseLeave={() => setScale(DEFAULT_SCALE)}
      className={clsx(
        "md:px-8 px-4 md:py-3 py-2 overflow-hidden group relative transition-all ease-out duration-300 pointer-events-auto",
        variant === "color" && "bg-primary",
        variant === "light" && "bg-foreground text-black",
        className,
      )}
    >
      <span className={`absolute top-0 h-full w-10 left-full group-hover:left-[-5rem] -skew-x-12 transition-all duration-1000 ease ${variant === "light" ? "bg-black opacity-15" : "bg-white opacity-10"}`}></span>
      <span className="relative max-md:text-sm">{text}</span>
    </Link>
  );
}
