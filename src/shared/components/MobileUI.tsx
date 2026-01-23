/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { GithubIcon, LinkedinIcon } from "../assets/Icons";
import { useCursor } from "../contexts/CursorContext";

export const MobileUI = () => {
  const { handleMouseEnter, handleMouseLeave } = useCursor();

  return (
    <div className="relative h-full w-full">
      <div className="flex-col flex h-full w-full justify-between relative z-10">
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
            <h1
              className="text-4xl mix-blend-difference"
              onMouseEnter={() => handleMouseEnter(3)}
              onMouseLeave={handleMouseLeave}
            >
              Creative Frontend Engineer & Web3 Developer
            </h1>
          </section>
          {/* links  */}
          <hr className="border-gradient-to-r" />
          <section className="flex items-end gap-10 ">
            {/* img  */}
            <div className="max-w-[300px] max-h-[300px] min-w-[150px] min-h-[150px] w-1/2 aspect-square flex justify-end">
              <img
                src="https://avatars.githubusercontent.com/u/153919071?v=4"
                className="w-full h-full object-cover"
                alt="Ranaufal Muha avatar"
                draggable={false}
                onMouseEnter={() => handleMouseEnter(3)}
                onMouseLeave={handleMouseLeave}
              />
              <hr className="border-gradient-to-t h-[80%] absolute bottom-0 opacity-80" />
            </div>
            {/* social  */}
            <div className="pb-10 text-white flex gap-8 ">
              <Link
                href={"https://wintr.app/ranaufal"}
                target="_blank"
                onClick={() => {}}
                className="mix-blend-difference"
                onMouseEnter={() => handleMouseEnter(1.5)}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src="./wintr_logo.svg"
                  alt="Wintr profile"
                  className="w-[24px] h-[24px]"
                  draggable={false}
                />
              </Link>
              <Link
                href={"https://linkedin.com/in/ranaufalmuha"}
                target="_blank"
                onClick={() => {}}
                className="mix-blend-difference"
                onMouseEnter={() => handleMouseEnter(1.5)}
                onMouseLeave={handleMouseLeave}
              >
                <LinkedinIcon />
              </Link>
              <Link
                href={"https://github.com/ranaufalmuha"}
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
      </div>

      {/* background  */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Layer 1 */}
        <div className="absolute inset-0 bg-gradient-1 animate-gradient-slow" />

        {/* Layer 2 */}
        <div className="absolute inset-0 bg-gradient-2 animate-gradient-fast mix-blend-overlay opacity-70" />
      </div>
    </div>
  );
};
