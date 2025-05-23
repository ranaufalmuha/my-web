import { GithubIcon, LinkedinIcon } from "../assets/Icons";
import { Link } from "react-router-dom";
import { useCursor } from "../contexts/CursorContext";

export const MobileUI = () => {
  const { handleMouseEnter, handleMouseLeave } = useCursor();

  return (
    <div className="relative h-full w-full">
      <main className="flex-col flex h-full w-full justify-between relative z-10">
        {/* Header  */}
        <section className="">
          <div className="flex justify-end">
            <div className="flex justify-start">
              <a
                href="#contact"
                className="flex gap-6 bg-background px-8 h-24 items-end pb-8"
                onMouseEnter={() => handleMouseEnter(3)}
                onMouseLeave={handleMouseLeave}
              >
                <p className="">Contact Me</p>
                <p>{"->"}</p>
              </a>
              <hr className="border-gradient-to-b h-full absolute top-0 opacity-80" />
            </div>
          </div>
          <hr className="border-gradient-to-l " />
        </section>

        {/* Content  */}
        <div className="flex-col flex">
          {/* links  */}
          <section className="p-10 max-w-[500px]">
            <p
              className="text-4xl mix-blend-difference"
              onMouseEnter={() => handleMouseEnter(3)}
              onMouseLeave={handleMouseLeave}
            >
              Web3 & Smart Contract Developer
            </p>
          </section>
          {/* links  */}
          <hr className="border-gradient-to-r" />
          <section className="flex items-end gap-10 ">
            {/* img  */}
            <div className="max-w-[200px] max-h-[200px] min-w-[150px] min-h-[150px] w-1/2 aspect-square flex justify-end">
              <img
                src="https://avatars.githubusercontent.com/u/153919071?v=4"
                className="w-full h-full object-cover"
                alt=""
                draggable={false}
                onMouseEnter={() => handleMouseEnter(3)}
                onMouseLeave={handleMouseLeave}
              />
              <hr className="border-gradient-to-t h-[80%] absolute bottom-0 opacity-80" />
            </div>
            {/* social  */}
            <div className="pb-10 text-white flex gap-8 ">
              <Link
                to={"https://wintr.app/ranaufal"}
                target="_blank"
                onClick={() => {}}
                className="mix-blend-difference"
                onMouseEnter={() => handleMouseEnter(1.5)}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src="./wintr_logo.svg"
                  className="w-[24px] h-[24px]"
                  draggable={false}
                />
              </Link>
              <Link
                to={"https://linkedin.com/in/ranaufalmuha"}
                target="_blank"
                onClick={() => {}}
                className="mix-blend-difference"
                onMouseEnter={() => handleMouseEnter(1.5)}
                onMouseLeave={handleMouseLeave}
              >
                <LinkedinIcon />
              </Link>
              <Link
                to={"https://github.com/ranaufalmuha"}
                target="_blank"
                onClick={() => {}}
                className="mix-blend-difference"
                onMouseEnter={() => handleMouseEnter(1.5)}
                onMouseLeave={handleMouseLeave}
              >
                <GithubIcon />
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* background  */}
      <video
        autoPlay
        muted
        loop
        className="absolute top-0 left-0 w-full h-full object-cover "
      >
        <source src="https://cdn.prod.website-files.com/6425f546844727ce5fb9e5ab/6568a1c859ceca16cf4653d6_Var6-transcode.mp4" />
      </video>
    </div>
  );
};
