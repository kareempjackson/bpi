"use client";

import { useState } from "react";
import ArrowCircle from "./ArrowCircle";
import InitiativesShape from "./shapes/InitiativesShape";

type Initiative = {
  title: string;
  description: string;
  href: string;
  featured?: boolean;
  imageSrc?: string;
  imageAlt?: string;
};

type Props = {
  eyebrow?: string;
  heading?: string;
  viewAllHref?: string;
  initiatives?: Initiative[];
  imageSrc?: string;
  imageAlt?: string;
};

const DEFAULT_INITIATIVES: Initiative[] = [
  {
    title: "AMA IV Fluids Manufacturing — Grantley Adams Industrial Estate",
    description:
      "The first Africa–Caribbean pharmaceutical trade corridor. 12 million units annually. A corridor, not a pilot.",
    href: "/initiatives/ama-iv-fluids",
    featured: true,
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "AMA IV Fluids manufacturing facility",
  },
  {
    title: "PAHO Regional Supply Hub",
    description:
      "Serving 40+ countries across the Caribbean and Latin America.",
    href: "/initiatives/paho-supply-hub",
    imageSrc: "/images/top.png",
    imageAlt: "PAHO Regional Supply Hub",
  },
  {
    title: "EU PharmaNext",
    description: "€3M transatlantic pharmaceutical investment bridge.",
    href: "/initiatives/eu-pharmanext",
    imageSrc: "/images/top2.png",
    imageAlt: "EU PharmaNext partnership",
  },
  {
    title: "BMPRA Regulatory Development",
    description: "Barbados's own standard-holder, built with WHO and PAHO.",
    href: "/initiatives/bmpra",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "BMPRA regulatory development",
  },
];

export default function InitiativesSection({
  eyebrow = "WHAT WE'RE BUILDING",
  heading = "Initiatives",
  viewAllHref = "/initiatives",
  initiatives = DEFAULT_INITIATIVES,
  imageSrc = "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
  imageAlt = "Pharmaceutical research at BPI",
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeInitiative =
    activeIndex !== null ? initiatives[activeIndex] : null;
  const displayedImageSrc = activeInitiative?.imageSrc ?? imageSrc;
  const displayedImageAlt = activeInitiative?.imageAlt ?? imageAlt;

  return (
    <section
      data-nav-theme="light"
      className="bg-error-25 px-5 md:px-20 lg:px-32 py-8 md:py-14 lg:py-20"
    >
      <div
        className="mx-auto max-w-page rounded-lg px-4 md:px-10 lg:px-12 py-6 md:py-10 lg:py-12"
        style={{ backgroundColor: "#CAF1FF" }}
      >
        <div
          data-reveal-stagger
          className="flex items-start justify-between gap-3 mb-6 md:mb-10"
        >
          <div>
            <div className="text-[11px] md:text-lg lg:text-xl font-normal tracking-[0.08em] text-primary-500 uppercase">
              {eyebrow}
            </div>
            <h2 className="mt-2 md:mt-3 font-display text-display-sm md:text-display-lg lg:text-display-xl font-bold text-primary-500 leading-[1.05] tracking-[-0.02em]">
              {heading}
            </h2>
          </div>
          <a
            href={viewAllHref}
            className="group/viewall flex items-center gap-3 text-primary-500 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-80 focus-visible:outline-none focus-visible:opacity-100"
          >
            <span className="hidden md:inline text-base lg:text-lg font-normal transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/viewall:-translate-x-0.5 motion-reduce:transform-none">
              View all
            </span>
            <ArrowCircle
              size={48}
              className="text-primary-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/viewall:translate-x-1 group-hover/viewall:rotate-[8deg] motion-reduce:transform-none"
            />
          </a>
        </div>

        <div
          data-reveal-stagger
          className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8 items-stretch"
          onMouseLeave={() => setActiveIndex(null)}
        >
          <div data-reveal="scale" className="md:col-span-2">
            <InitiativesShape
              key={displayedImageSrc}
              size={500}
              imageSrc={displayedImageSrc}
              imageAlt={displayedImageAlt}
              className="w-full h-auto"
            />
          </div>

          <div
            data-reveal-stagger
            className="md:col-span-3 flex flex-col gap-3 lg:gap-4"
          >
            {initiatives.map((initiative, idx) => (
              <InitiativeRow
                key={initiative.href}
                index={idx + 1}
                initiative={initiative}
                isActive={activeIndex === idx}
                onHover={() => setActiveIndex(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InitiativeRow({
  index,
  initiative,
  isActive,
  onHover,
}: {
  index: number;
  initiative: Initiative;
  isActive: boolean;
  onHover: () => void;
}) {
  return (
    <a
      href={initiative.href}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={`group flex flex-1 items-center gap-3 md:gap-4 lg:gap-6 rounded-lg pl-4 md:pl-6 lg:pl-8 pr-3 md:pr-4 lg:pr-6 py-4 md:py-5 lg:py-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 ${
        isActive
          ? "bg-gray-50 shadow-[0_6px_22px_-14px_rgba(0,0,54,0.25)]"
          : "bg-white hover:bg-gray-50 hover:shadow-[0_6px_22px_-14px_rgba(0,0,54,0.25)]"
      }`}
    >
      <div
        className={`shrink-0 w-9 md:w-12 lg:w-16 text-display-md md:text-display-lg lg:text-display-xl font-light leading-none transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isActive ? "text-primary-500/60" : "text-gray-300 group-hover:text-primary-500/60"
        }`}
      >
        {index}
      </div>

      <div className="flex-1 min-w-0">
        {initiative.featured ? (
          <div className="text-xs font-bold tracking-[0.12em] text-primary-500 uppercase mb-1">
            Featured
          </div>
        ) : null}
        <h3 className="text-sm lg:text-base font-medium text-primary-500 leading-[1.3] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 motion-reduce:transform-none">
          {initiative.title}
        </h3>
      </div>

      <p className="hidden lg:block w-[34%] shrink-0 text-sm text-primary-500/70 leading-[1.4]">
        {initiative.description}
      </p>

      <ArrowCircle
        size={48}
        className={`shrink-0 text-primary-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transform-none ${
          isActive
            ? "translate-x-1 rotate-[8deg]"
            : "group-hover:translate-x-1 group-hover:rotate-[8deg]"
        }`}
      />
    </a>
  );
}
