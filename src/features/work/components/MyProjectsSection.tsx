"use client";

import { useState } from "react";
import { ContainerCard } from "@/shared/components/providers/ContainerCard";
import { TypoH2 } from "@/shared/components/ui/TypoH2";
import {
  PrismCarousel,
  type PrismCarouselItem,
} from "@/shared/components/ui/PrismCarousel";

const PROJECTS: PrismCarouselItem[] = [
  {
    src: "/projects/arctis.png",
    alt: "Arctis project",
    title: "Arctis",
    subtitle: "arctis.ranaufalmuha.com",
    href: "https://arctis.ranaufalmuha.com",
  },
  {
    src: "/projects/peridotvault.png",
    alt: "PeridotVault project",
    title: "PeridotVault",
    subtitle: "peridotvault.com",
    href: "https://peridotvault.com",
  },
  {
    src: "/projects/procura.png",
    alt: "Procura Project",
    title: "Procura",
    subtitle: "Procurement on ICP",
    href: "https://eregx-kyaaa-aaaap-an3aa-cai.icp0.io",
  },
  {
    src: "/projects/warungagent.png",
    alt: "Warung Agent project",
    title: "Warung Agent",
    subtitle: "warungagent.fun",
    href: "https://warungagent.fun",
  },
  {
    src: "/projects/wiatour.png",
    alt: "Wiatour project",
    title: "Wiatour",
    subtitle: "wiatour.com",
    href: "https://wiatour.com",
  },
];

const PROJECT_COUNT = PROJECTS.length;
const formatCount = (value: number) => String(value).padStart(2, "0");

export const MyProjectsSection = () => {
  const [active, setActive] = useState(0);

  return (
    <section
      id="my-projects"
      className="relative bg-surface flex w-full flex-col overflow-hidden border-y"
    >
      <div className="pointer-events-none relative z-3">
        <ContainerCard className="flex justify-center mt-8">
          <TypoH2 className="py-8">
            My
            <span className="font-fraunces-italic"> Projects</span>
          </TypoH2>
        </ContainerCard>
      </div>
      <div className="h-[560px] min-h-[420px] w-full md:h-[600px]">
        <PrismCarousel
          items={PROJECTS}
          aspect={16 / 9}
          size={0.62}
          gap={14}
          radius={18}
          autoplay
          interval={4.5}
          loop
          captions
          controls={false}
          draggable
          wheel={false}
          pauseOnHover
          backgroundColor="transparent"
          onIndexChange={setActive}
        />
      </div>
      <div className="pointer-events-none relative z-3 flex justify-center pb-6">
        <span className="font-ibm-plex-mono text-sm tracking-widest text-paragraph">
          {formatCount(active + 1)} / {formatCount(PROJECT_COUNT)}
        </span>
      </div>
    </section>
  );
};
