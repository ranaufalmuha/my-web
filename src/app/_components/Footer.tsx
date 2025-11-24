"use client";

import Link from "next/link";
import { LinkedinIcon, GithubIcon } from "@/shared/assets/Icons";
import { useCursor } from "@/shared/contexts/CursorContext";

interface Highlight {
  img_url: string | null;
  title: string;
  description: string;
  link: string;
}

const HIGHLIGHT_POSTS: Highlight[] = [
  {
    img_url: null,
    title: "Blockchain is Like a Magic Book from Harry Potter 🔮 ( But Real! )",
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
];

const SOCIAL_LINKS = [
  {
    href: "https://wintr.app/ranaufal",
    icon: "/wintr_logo.svg",
    alt: "Wintr profile",
  },
  {
    href: "https://linkedin.com/in/ranaufalmuha",
    icon: "linkedin",
    alt: "LinkedIn",
  },
  { href: "https://github.com/ranaufalmuha", icon: "github", alt: "GitHub" },
] as const;

export const Footer = () => {
  const { handleMouseEnter, handleMouseLeave } = useCursor();

  return (
    <footer className="flex flex-col">
      <h2 className="sr-only">Footer</h2>
      <div className="flex w-full">
        {/* Left Section */}
        <section className="p-20 w-3/6 bg-second-background relative flex flex-col gap-20 justify-between">
          <div className="flex flex-col gap-20" id="contact">
            <img
              src="/logo-white.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />

            <p
              className="text-4xl max-w-[400px]"
              onMouseEnter={() => handleMouseEnter(2)}
              onMouseLeave={handleMouseLeave}
            >
              Follow my social media to stay in touch with me 🤝
            </p>

            <Link
              href="https://mail.google.com/mail/?view=cm&fs=1&to=ifal.muha@gmail.com&su=Hi,%20Im%20here%20from%20your%20Website"
              className="focus:scale-105 duration-300 hover:scale-110 border-gray-400 max-w-[400px] border-b py-7 flex items-center justify-between"
              onMouseEnter={() => handleMouseEnter(1.5)}
              onMouseLeave={handleMouseLeave}
            >
              <span className="text-2xl">ifal.muha@gmail.com</span>
              <span className="text-2xl">→</span>
            </Link>

            {/* Social Media Links */}
            <div className="pb-10 text-white flex gap-8">
              {SOCIAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mix-blend-difference"
                  onMouseEnter={() => handleMouseEnter(1.5)}
                  onMouseLeave={handleMouseLeave}
                  aria-label={link.alt}
                >
                  {link.icon === "linkedin" ? (
                    <LinkedinIcon />
                  ) : link.icon === "github" ? (
                    <GithubIcon />
                  ) : (
                    <img
                      src={link.icon}
                      alt={link.alt}
                      className="w-6 h-6"
                      draggable={false}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <p className="text-sm text-disabled">
            &copy; Copyright 2025 Ranaufal Muha
          </p>
        </section>

        <div className="w-1/6" />

        {/* Right Section - Highlights */}
        <section className="w-2/6 relative justify-between flex flex-col gap-20">
          {HIGHLIGHT_POSTS.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => handleMouseEnter(1.5)}
              onMouseLeave={handleMouseLeave}
              className="p-20 bg-second-background aspect-square border border-white/10 hover:bg-white hover:text-black hover:rotate-6 duration-300 flex flex-col justify-between gap-10 relative"
            >
              {item.img_url && (
                <img
                  src={item.img_url}
                  alt={item.title}
                  className="object-contain"
                />
              )}
              <h3 className="text-3xl z-10">{item.title}</h3>
              <p className="text-disabled text-sm z-10">{item.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </footer>
  );
};
