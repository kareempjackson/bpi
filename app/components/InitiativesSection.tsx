"use client";

import { useState } from "react";
import ArrowRight from "./ArrowRight";
import Button from "./Button";
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
      className="bg-error-25 px-8 md:px-16 lg:px-28 py-10 md:py-14 lg:py-20"
    >
      <div className="mx-auto max-w-page rounded-lg bg-warning-50 px-4 md:px-6 lg:px-8 py-5 md:py-6 lg:py-8">
        <div
          data-reveal-stagger
          className="flex items-start justify-between gap-4 mb-5 md:mb-7"
        >
          <div>
            <div className="text-[10px] md:text-xs font-bold tracking-[0.12em] text-primary-500 uppercase">
              {eyebrow}
            </div>
            <h2 className="mt-1 font-display text-xl md:text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1]">
              {heading}
            </h2>
          </div>
          <a
            href={viewAllHref}
            className="flex items-center gap-2 text-primary-500 hover:opacity-70 transition-opacity"
          >
            <span className="text-xs font-semibold">View all</span>
            <Button
              variant="tertiary"
              iconOnly="sm"
              aria-label="View all initiatives"
              tabIndex={-1}
            >
              <ArrowRight />
            </Button>
          </a>
        </div>

        <div
          data-reveal-stagger
          className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-5 items-stretch"
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
            className="md:col-span-3 flex flex-col gap-2 lg:gap-3"
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
      className={`group flex flex-1 items-center gap-3 lg:gap-5 rounded-lg pl-4 lg:pl-5 pr-3 lg:pr-4 py-3 lg:py-4 transition-colors ${
        isActive ? "bg-gray-50" : "bg-white hover:bg-gray-50"
      }`}
    >
      <div className="shrink-0 w-10 lg:w-14 text-display-md lg:text-display-lg font-light text-gray-300 leading-none">
        {index}
      </div>

      <div className="flex-1 min-w-0">
        {initiative.featured ? (
          <div className="text-[10px] font-bold tracking-[0.12em] text-primary-500 uppercase mb-1">
            Featured
          </div>
        ) : null}
        <h3 className="text-xs lg:text-sm font-medium text-primary-500 leading-[1.3]">
          {initiative.title}
        </h3>
      </div>

      <p className="hidden lg:block w-[34%] shrink-0 text-xs text-primary-500/70 leading-[1.4]">
        {initiative.description}
      </p>

      <div className="shrink-0">
        <Button
          variant="tertiary-light"
          iconOnly="sm"
          aria-label={`Read about ${initiative.title}`}
          tabIndex={-1}
        >
          <ArrowRight />
        </Button>
      </div>
    </a>
  );
}
