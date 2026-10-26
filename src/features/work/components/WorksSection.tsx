import Link from "next/link";
import { Container } from "@/shared/components/providers/Container";
import { ContainerCard } from "@/shared/components/providers/ContainerCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightLong } from "@fortawesome/free-solid-svg-icons";
import { TypoH2 } from "@/shared/components/ui/TypoH2";
import { useCursor } from "@/features/cursor/CursorContext";
import { DEFAULT_SCALE, HOVER_SCALE_DEFAULT } from "@/shared/constants/scale";

export const WorksSection = () => {
  const { setScale } = useCursor();

  const listWorks = [
    {
      name: (
        <span>Antigane</span>
      ),
      url: "https://antigane.com",
      yearFrom: 2025,
      yearTo: undefined,
      role: "Founder",
      employment: "Full Time",
    },
    {
      name: <span>Orphic</span>,
      url: "https://orphicgavel.com",
      yearFrom: 2026,
      yearTo: undefined,
      role: "Software Engineer",
      employment: "Full Time",
    },
    {
      name: <span>ICP Hub Indonesia</span>,
      url: "https://www.linkedin.com/company/disruptives/posts/",
      yearFrom: 2024,
      yearTo: 2025,
      role: "Web3 Developer",
      employment: "Full Time",
    },
    {
      name: <span>Kemdiktisaintek</span>,
      url: "https://kemdiktisaintek.go.id/en",
      yearFrom: 2024,
      yearTo: 2024,
      role: "Blockchain / Web3 Developer",
      employment: "Internship",
    },
  ];
  return (
    <section id="works">
      <Container>
        <ContainerCard className="border-b bg-surface">
          <TypoH2 className="py-14">
            My
            <span className="font-fraunces-italic"> Experiences</span>
          </TypoH2>
        </ContainerCard>
        {listWorks.map((item, index) => (
          <Link
            key={index}
            href={item.url}
            target="_blank"
            onMouseEnter={() => setScale(HOVER_SCALE_DEFAULT)}
            onMouseLeave={() => setScale(DEFAULT_SCALE)}
          >
            <WorkCard yearFrom={item.yearFrom} yearTo={item.yearTo} role={item.role} employment={item.employment}>
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
    role,
    employment,
    children,
  }: {
    yearFrom: number;
    yearTo?: number;
    role?: string;
    employment?: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 border-b">
        <ContainerCard className="flex flex-col gap-2 border-r">
          <h3 className="text-3xl">{children}</h3>
          {role || employment ? (
            <p className="text-sm text-paragraph">
              {role}
              {role && employment ? " · " : null}
              {employment}
            </p>
          ) : null}
        </ContainerCard>
        <div className="border-x md:hidden lg:block"></div>
        <ContainerCard className="flex border-l justify-center items-center gap-4 text-xl">
          <span className="font-fraunces-italic">{yearFrom}</span>
          <FontAwesomeIcon icon={faArrowRightLong} />
          <span>{yearTo ? yearTo : "Present"}</span>
        </ContainerCard>
      </div>
    );
  }
};
