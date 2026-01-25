import { Container } from "@/shared/components/providers/Container";
import { ContainerCard } from "@/shared/components/providers/ContainerCard";
import { TypoH2 } from "@/shared/components/ui/TypoH2";

export default function AboutMeSection() {
  return (
    <div className="border-y">
      <Container className="-z-1 relative">
        <section className="grid md:grid-cols-2 gap-12">
          <ContainerCard className="flex border-r bg-surface">
            <div className="w-full flex flex-col gap-12 my-auto">
              <TypoH2>
                About <span className="font-fraunces">Me</span>
              </TypoH2>
              <div className="text-xl flex flex-col gap-4 text-paragraph">
                <p>
                  I{"'"}m a <b>Creative Frontend & Web3 Engineer</b>. I enjoy
                  building things where design, code, and decentralized systems
                  meet. Most of my work revolves around interactive frontend
                  experiences, smart contracts, and turning Web3 ideas into
                  real, usable products.
                </p>
                <p>
                  Lately, I{"'"}ve been spending a lot of time exploring
                  blockchain architecture, and on-chain systems.
                </p>
              </div>
            </div>
          </ContainerCard>
          <div className="w-full md:aspect-3/5 aspect-6/7 border-t md:border-l">
            <img
              src="/images/me/3.webp"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      </Container>
    </div>
  );
}
