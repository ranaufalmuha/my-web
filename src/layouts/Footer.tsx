import { Link } from "react-router-dom";
import { LinkedinIcon, GithubIcon } from "../assets/Icons";
import { useCursor } from "../contexts/CursorContext";
import { useState } from "react";
import { Highlight } from "../interface/Highlight";

export const Footer = () => {
  const { handleMouseEnter, handleMouseLeave } = useCursor();
  const [highlightPosts] = useState<Highlight[]>([
    {
      img_url: null,
      title:
        "Blockchain is Like a Magic Book from Harry Potter 🔮 ( But Real! )",
      description:
        "Imagine if the Marauder's Map from Harry Potter didn't just track people… but also every transaction, contract, or promise ever made — with no way to lie, cheat, or vanish the evidence. That's blockchain.",
      link: "https://medium.com/@ranaufalmuha/blockchain-is-like-a-magic-book-from-harry-potter-but-real-632d386d9833",
    },
    {
      img_url:
        "https://pbs.twimg.com/media/GqbIgYJbMAQY2wz?format=jpg&name=small",
      title: "Heading to UZH Summer School at the University of Zurich 🇨🇭",
      description:
        "He's been selected to attend the prestigious @UZH_en Summer School in Zurich (30 June – 18 July 2025), supported by the ICP ecosystem 🙌",
      link: "https://x.com/ranaufalmuha/status/1920770080545051069",
    },
  ]);

  return (
    <footer className="flex flex-col">
      <h1 className="hidden">Footer</h1>
      {/* content  */}
      <div className="flex w-full">
        <section className="p-20 w-3/6 bg-second-background relative flex flex-col gap-20 justify-between">
          <div className="flex flex-col gap-20" id="contact">
            <img src="./logo-white.png" alt="" className="w-10" />
            <p
              className="text-4xl max-w-[400px]"
              onMouseEnter={() => handleMouseEnter(2)}
              onMouseLeave={handleMouseLeave}
            >
              Follow my social media to stay in touch with me 🤝
            </p>
            <Link
              to="https://mail.google.com/mail/?view=cm&fs=1&to=ifal.muha@gmail.com&su=Hi,%20Im%20here%20from%20your%20Website"
              className="focus:scale-105 duration-300 hover:scale-110 border-gray-400 max-w-[400px] border-b py-7"
              onMouseEnter={() => handleMouseEnter(1.5)}
              onMouseLeave={handleMouseLeave}
            >
              <input
                type="email"
                placeholder="E-mail address"
                value={"ifal.muha@gmail.com"}
                className=" text-2xl  focus:outline-0 "
              />
              <span className="text-2xl">→</span>
            </Link>
            {/* social media  */}
            <div className="pb-10 text-white flex gap-8 ">
              <Link
                to={"https://wintr.app/ranaufal"}
                target="_blank"
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
                className="mix-blend-difference"
                onMouseEnter={() => handleMouseEnter(1.5)}
                onMouseLeave={handleMouseLeave}
              >
                <LinkedinIcon />
              </Link>
              <Link
                to={"https://github.com/ranaufalmuha"}
                target="_blank"
                className="mix-blend-difference"
                onMouseEnter={() => handleMouseEnter(1.5)}
                onMouseLeave={handleMouseLeave}
              >
                <GithubIcon />
              </Link>
            </div>
          </div>

          {/* copyright  */}
          <p className="text-sm text-disabled ">
            &copy;Copyright 2025 Ranaufal Muha
          </p>
        </section>
        <div className="w-1/6"></div>
        <section className="w-2/6 relative justify-between flex flex-col gap-20">
          {highlightPosts.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              target="_blank"
              onMouseEnter={() => handleMouseEnter(1.5)}
              onMouseLeave={handleMouseLeave}
              className="p-20 bg-second-background aspect-square border border-white/10 hover:bg-white hover:text-black hover:rotate-6 duration-300 flex flex-col justify-between gap-10 relative"
            >
              {item.img_url && (
                <img
                  src={item.img_url}
                  className="object-contain"
                  alt={item.title}
                />
              )}
              <h4 className="text-3xl z-10">{item.title}</h4>
              <p className="text-disabled text-sm z-10">{item.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </footer>
  );
};
