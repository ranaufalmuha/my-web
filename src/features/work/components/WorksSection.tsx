import Link from "next/link";
import { Container } from "@/shared/components/providers/Container";
import { ContainerCard } from "@/shared/components/providers/ContainerCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightLong } from "@fortawesome/free-solid-svg-icons";
import { TypoH2 } from "@/shared/components/ui/TypoH2";

interface Props {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const WorksSection = ({ onMouseEnter, onMouseLeave }: Props) => {
  const listWorks = [
    {
      name: (
        <span>
          <span className="font-bold">Peridot</span>
          Vault
        </span>
      ),
      url: "https://peridotvault.com",
      yearFrom: 2024,
      yearTo: undefined,
    },
    {
      name: <span>Arctis</span>,
      url: "https://arctis-web.vercel.app/",
      yearFrom: 2025,
      yearTo: undefined,
    },
    {
      name: <span>Merai Tech</span>,
      url: "https://merai.tech/",
      yearFrom: 2025,
      yearTo: undefined,
    },
  ];
  return (
    <section id="works">
      <Container>
        <ContainerCard className="border-b bg-surface">
          <TypoH2 className="py-14">
            My
            <span className="font-fraunces"> Works</span>
          </TypoH2>
        </ContainerCard>
        {listWorks.map((item, index) => (
          <Link
            key={index}
            href={item.url}
            target="_blank"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <WorkCard yearFrom={item.yearFrom} yearTo={item.yearTo}>
              {item.name}
            </WorkCard>
          </Link>
        ))}
      </Container>
    </section>
  );

  function WorkCard({
    yearFrom,
    yearTo,
    children,
  }: {
    yearFrom: number;
    yearTo?: number;
    children: React.ReactNode;
  }) {
    return (
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 border-b">
        <ContainerCard className="flex border-r">
          <h3 className="text-3xl">{children}</h3>
        </ContainerCard>
        <div className="border-x md:hidden lg:block"></div>
        <ContainerCard className="flex border-l justify-center items-center gap-4 text-xl">
          <span className="font-fraunces">{yearFrom}</span>
          <FontAwesomeIcon icon={faArrowRightLong} />
          <span>{yearTo ? yearTo : "Present"}</span>
        </ContainerCard>
      </div>
    );
  }
};
