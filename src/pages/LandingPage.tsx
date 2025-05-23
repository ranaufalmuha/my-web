import { useEffect, useRef } from "react";
import { MobileUI } from "./MobileUI";
import { useCursor } from "../contexts/CursorContext";
import Lenis from "@studio-freight/lenis";
import DinoGame from "../components/DinoGame";
import { Resume } from "../components/Resume";
import Projects from "../components/Projects";

export const LandingPage = () => {
  const { handleMouseEnter, handleMouseLeave } = useCursor();
  let experiences = new Date().getFullYear() - 2021;

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* section 1 ----------------------  */}
      <section className="w-full flex max-w-[1500px]">
        {/* left  */}
        <div className="w-[45%]">
          <hr className="border-gradient-to-t absolute top-0 h-full" />
          <div className="h-[50dvh] max-h-[700px]">
            <img
              src="https://marchantweb.com/torn-paper-corner.png"
              className="w-full h-[80%]"
              alt=""
            />
          </div>
          <hr className="border-gradient-to-l" />
          {/* Bio  */}
          <div className="p-10 flex flex-col gap-44 bg-second-background">
            <p
              className="text-6xl font-light w-[480px] leading-[70px]"
              onMouseEnter={() => handleMouseEnter(3)}
              onMouseLeave={handleMouseLeave}
            >
              Hello! I'm Ranaufal Muha
            </p>
            <p
              className="mt-8 text-2xl"
              onMouseEnter={() => handleMouseEnter(1.5)}
              onMouseLeave={handleMouseLeave}
            >
              {experiences}+ years of crafting innovative projects 🔥
            </p>
          </div>
          <hr className="border-gradient-to-r" />
          <div className="h-[50dvh] max-h-[350px]"></div>
          {/* Profile  */}
          <hr className="absolute left-0 w-full border-gradient-to-r" />
          <div
            className="flex bg-background"
            onMouseEnter={() => handleMouseEnter(3)}
            onMouseLeave={handleMouseLeave}
          >
            <img src="./me/1.png" alt="" />
          </div>
        </div>

        {/* right  */}
        <div className="w-[55%] ">
          <div className="w-full flex h-[80dvh] max-h-[1200px]">
            <MobileUI />
            <hr className="border-gradient-to-b h-[80%]" />
          </div>
          <div className="h-[80dvh] max-h-[900px] w-full bg-radial-[at_90%_0%] from-[#244E9D] via-[#34386E] to-[#922A2A]"></div>
          <hr className="absolute right-0 w-full border-gradient-to-l" />
        </div>
      </section>

      {/* section 2 Game ----------------------  */}
      <section className="w-full flex justify-center relative">
        <hr className="border-gradient-to-r absolute bottom-0 w-full" />
        <div className="w-full max-w-[1500px] bg-second-background ">
          <div className="p-20">
            <DinoGame />
          </div>
        </div>
      </section>

      {/* section 3 ----------------------  */}
      <section className="w-full relative">
        <hr className="border-gradient-to-r absolute top-0 w-full" />
        <hr className="border-gradient-to-l absolute bottom-0 w-full" />

        {/* Companies  */}
        <div className="bg-second-background py-12 pl-14 overflow-x-auto flex justify-center">
          <div className="flex gap-16 w-max snap-x invert">
            <div className="snap-start ">
              <img
                src="https://internetcomputer.org/img/IC_logo_horizontal.svg"
                className="h-6 grayscale"
              />
            </div>
            <div className="snap-start ">
              <img
                src="https://indonesiaonchain.com/wp-content/uploads/2024/03/Disruptives-_-blck-letter-2-1024x181.png"
                className="h-6 grayscale"
              />
            </div>
            <div className="snap-start ">
              <img src="./company/peridot.png" className="h-6 grayscale" />
            </div>
            <div className="snap-start ">
              <img
                src="https://indonesiaonchain.com/wp-content/uploads/2024/02/Indonesia-On-Chain-for-wihte-BG-1-1024x700.png"
                className="h-6 grayscale px-2 scale-200"
              />
            </div>
            <div className="snap-start ">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg/1200px-Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg.png"
                className="h-6 grayscale px-2 scale-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* section 4 Projects ----------------------  */}
      <Projects />

      {/* section 5 Resume ----------------------  */}
      <section className="w-full flex relative justify-center">
        <hr className="border-gradient-to-l absolute bottom-0 left-0 z-10 w-full" />
        <div className="bg-second-background absolute w-1/2 left-0 h-full"></div>
        <div className="w-full max-w-[1500px] relative">
          <Resume />
        </div>
      </section>
    </div>
  );
};
