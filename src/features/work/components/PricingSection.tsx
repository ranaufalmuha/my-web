"use client";

import { useState } from "react";
import Button from "@/shared/components/ui/Button";
import { FiCheck, FiCode, FiZap } from "react-icons/fi";
import { FaAnchor, FaHammer } from "react-icons/fa";
import {
  SiBun,
  SiDocker,
  SiEthereum,
  SiGo,
  SiInternetcomputer,
  SiMongodb,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiRedis,
  SiRust,
  SiShadcnui,
  SiSolana,
  SiSolidity,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
} from "react-icons/si";
import { IconType } from "react-icons/lib";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Container } from "@/shared/components/providers/Container";
import { ContainerCard } from "@/shared/components/providers/ContainerCard";
import { useCursor } from "@/features/cursor/CursorContext";
import { DEFAULT_SCALE, HOVER_SCALE_DEFAULT } from "@/shared/constants/scale";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface PlanStat {
  label: string;
  value: string;
}

interface Plan {
  name: string;
  tagline: string;
  price: number;
  suffix: string;
  cta: string;
  lead: string;
  stack: string[];
  stats: PlanStat[];
  features: string[];
}

const LAUNCH_SITE = "Launch Site";
const BUILD_CREW = "Build Crew";
const MINT_PASS = "Mint Pass";

const landingStack = ["Next.js", "GSAP", "Three.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Zustand"];
const partnershipStack = [
  `${LAUNCH_SITE} included`,
  "Node.js",
  "Bun",
  "PostgreSQL",
  "Redis",
  "Nginx",
  "Docker",
  "MongoDB",
  "Java",
  "Python",
  "Go",
  "C#",
];
const blockchainStack = [
  `${BUILD_CREW} included`,
  "Solidity",
  "Ethereum",
  "Solana",
  "Foundry",
  "Anchor",
  "Pinocchio",
  "Rust",
  "Motoko",
  "ICP",
  "EVM",
];

const STACK_ICONS: Record<string, IconType> = {
  "Next.js": SiNextdotjs,
  GSAP: FiZap,
  "Three.js": SiThreedotjs,
  TypeScript: SiTypescript,
  "Tailwind CSS": SiTailwindcss,
  "shadcn/ui": SiShadcnui,
  "Node.js": SiNodedotjs,
  Bun: SiBun,
  PostgreSQL: SiPostgresql,
  Redis: SiRedis,
  Nginx: SiNginx,
  Docker: SiDocker,
  MongoDB: SiMongodb,
  Python: SiPython,
  Go: SiGo,
  Solidity: SiSolidity,
  Ethereum: SiEthereum,
  Solana: SiSolana,
  Foundry: FaHammer,
  Anchor: FaAnchor,
  Pinocchio: FiCode,
  Rust: SiRust,
  ICP: SiInternetcomputer,
};

const plans: Plan[] = [
  {
    name: LAUNCH_SITE,
    tagline: "Fixed-scope website, max 3 pages",
    price: 299,
    suffix: "/project",
    cta: "Book a Call",
    lead: "Everything you need to launch:",
    stack: landingStack,
    stats: [
      { label: "Scope", value: "Max 3 pages" },
      { label: "Delivery", value: "~2 weeks" },
      { label: "Support", value: "Email" },
    ],
    features: [
      "Responsive design",
      "Basic SEO setup",
      "Contact form integration",
      "2 revision rounds",
      "Deployment included",
    ],
  },
  {
    name: BUILD_CREW,
    tagline: "Your regular software engineer, monthly",
    price: 1500,
    suffix: "/month",
    cta: "Book a Call",
    lead: "A dev team member without hiring:",
    stack: partnershipStack,
    stats: [
      { label: "Scope", value: "Ongoing dev" },
      { label: "Delivery", value: "Weekly reports" },
      { label: "Support", value: "Direct chat" },
    ],
    features: [
      "Dedicated development",
      "Frontend, backend & DevOps",
      "Weekly progress reports",
      "Direct chat access",
      "Pause or cancel monthly",
    ],
  },
  {
    name: MINT_PASS,
    tagline: "Partnership plus Web3 integration",
    price: 2500,
    suffix: "/month",
    cta: "Book a Call",
    lead: "Everything in Partnership, plus:",
    stack: blockchainStack,
    stats: [
      { label: "Scope", value: "Ongoing + Web3" },
      { label: "Delivery", value: "Weekly reports" },
      { label: "Support", value: "1-on-1 access" },
    ],
    features: [
      "Smart contract development",
      "Wallet integration",
      "On-chain data flow",
      "Testnet to mainnet flow",
      "30-day bug fixes after launch",
    ],
  },
];

export const PricingSection = () => {
  const [active, setActive] = useState(1);
  const reduceMotion = useReducedMotion();
  const { setScale } = useCursor();
  const plan = plans[active];
  const shift = reduceMotion ? 0 : 18;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: shift },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };

  return (
    <section id="pricing">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={container}
          className="w-full"
        >
          <ContainerCard className="border-b">
            <motion.div variants={item} className="max-w-2xl">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-foreground">
                Pick the plan that matches how you want to work.
              </p>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-paragraph">
                Select a plan to see exactly what&apos;s included: scope,
                delivery, and support.
              </p>
            </motion.div>
          </ContainerCard>

            <div className="border-b border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr]">
                <div className="flex flex-col border-b border-white/10 lg:border-b-0 lg:border-r">
                <div role="group" aria-label="Select a plan">
                  {plans.map((option, index) => {
                    const selected = active === index;
                    return (
                      <motion.button
                        key={option.name}
                        variants={item}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setActive(index)}
                        onMouseEnter={() => setScale(HOVER_SCALE_DEFAULT)}
                        onMouseLeave={() => setScale(DEFAULT_SCALE)}
                        className={`relative w-full cursor-pointer border-b border-white/10 last:border-b-0 p-6 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          selected ? "" : "hover:bg-foreground/5"
                        }`}
                      >
                        {selected && (
                          <motion.span
                            layoutId="pricing-selected"
                            transition={{
                              duration: reduceMotion ? 0 : 0.35,
                              ease: EASE,
                            }}
                            className="absolute -inset-px bg-foreground/5 ring-2 ring-inset ring-foreground"
                          />
                        )}
                        <span className="relative z-10 flex items-start gap-4">
                          <span
                            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border-2 transition-colors duration-200 ${
                              selected ? "border-foreground" : "border-white/20"
                            }`}
                          >
                            <motion.span
                              initial={false}
                              animate={{ scale: selected ? 1 : 0 }}
                              transition={{
                                duration: reduceMotion ? 0 : 0.2,
                                ease: EASE,
                              }}
                              className="h-2.5 w-2.5 bg-primary"
                            />
                          </span>
                          <span className="flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-semibold text-foreground">
                                {option.name}
                              </span>
                            </span>
                            <span className="mt-1 block text-sm leading-relaxed text-paragraph">
                              {option.tagline}
                            </span>
                          </span>
                          <span className="text-right">
                            <span className="text-2xl font-semibold font-ibm-plex-mono tracking-tight tabular-nums text-foreground">
                              ${option.price}
                            </span>
                            <span className="block text-xs text-paragraph">
                              {option.suffix}
                            </span>
                          </span>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
                <motion.p
                  variants={item}
                  className="border-t border-white/10 p-6 text-sm leading-relaxed text-paragraph"
                >
                  Every plan includes source code ownership, documentation, and
                  post-launch support.
                </motion.p>
              </div>
              <motion.div
                variants={item}
                className="bg-surface p-6 sm:p-8 lg:p-10"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                    transition={{ duration: reduceMotion ? 0 : 0.25, ease: EASE }}
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                        {plan.name}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-paragraph">
                      {plan.tagline}
                    </p>

                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-xl font-medium text-paragraph">
                        $
                      </span>
                      <span className="text-5xl sm:text-6xl font-semibold font-ibm-plex-mono tracking-tight tabular-nums text-foreground">
                        {plan.price}
                      </span>
                      <span className="ml-1 text-sm text-paragraph">
                        {plan.suffix === "/project"
                          ? "one-time per project"
                          : "per month"}
                      </span>
                    </div>

                    <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-white/10 py-5">
                      {plan.stats.map(({ label, value }) => (
                        <div key={label}>
                          <dt className="text-xs text-paragraph">{label}</dt>
                          <dd className="mt-1 text-sm font-medium text-foreground">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <p className="mt-8 text-sm font-medium text-foreground">
                      {plan.lead}
                    </p>
                    <ul className="mt-4 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm leading-relaxed text-foreground/80"
                        >
                          <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {plan.stack.map((tech) => {
                        const TechIcon = STACK_ICONS[tech];
                        return (
                          <span
                            key={tech}
                            className={`py-1 px-2 border text-xs font-ibm-plex-mono bg-foreground/5 uppercase flex items-center gap-1.5 ${tech.endsWith(" included") ? "border-primary" : ""}`}
                          >
                            {TechIcon ? <TechIcon className="h-3.5 w-3.5" /> : null}
                            {tech}
                          </span>
                        );
                      })}
                    </div>

                    <Button
                      href="/#booking"
                      text={plan.cta}
                      variant="light"
                      className="mt-8 block w-full text-center"
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
              </div>
            </div>
          </motion.div>
      </Container>
    </section>
  );
};
