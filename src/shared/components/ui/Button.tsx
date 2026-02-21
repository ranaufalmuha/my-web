import clsx from "clsx";
import Link from "next/link";

type Props = {
  href: string;
  text: string;
  variant?: "color" | "transparent";
};

export default function Button({ href, text, variant = "color" }: Props) {
  return (
    <Link
      href={href}
      className={clsx(
        "md:px-8 px-4 md:py-3 py-2 overflow-hidden group relative transition-all ease-out duration-300 cursor-pointer pointer-events-auto",
        variant == "color" ? "bg-primary" : "",
      )}
    >
      <span className="absolute right-0 w-10 h-full top-0 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 -skew-x-12 group-hover:-translate-x-36 ease"></span>
      <span className="relative max-md:text-sm">{text}</span>
    </Link>
  );
}
