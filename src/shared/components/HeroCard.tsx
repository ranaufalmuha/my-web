"use client";

import Image from "next/image";
import { useTilt } from "@/shared/hooks/useTilt";

interface Props {
  imgUrl: string;
  alt: string;
  className?: string;
}

export function HeroCard({ imgUrl, alt, className }: Props) {
  const tiltRef = useTilt({
    max: 10,
    reverse: true,
    scale: 1.05,
  });

  return (
    <div ref={tiltRef} className={`${className}  aspect-square bg-muted group`}>
      <Image
        src={imgUrl}
        alt={alt}
        className="hero-card-img w-full h-full object-cover duration-300 group-hover:blur-none"
        width={720}
        height={720}
      />
    </div>
  );
}
