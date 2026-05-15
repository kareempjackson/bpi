"use client";

import { useState } from "react";
import ArrowCircle from "./ArrowCircle";
import CtaLink from "./CtaLink";
import InitiativesShape from "./shapes/InitiativesShape";

type Initiative = {
  title: string;
  description: string;
  /** When omitted, the row renders as a non-clickable display-only card. */
  href?: string;
  featured?: boolean;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
};

type Props = {
  eyebrow?: string;
  heading?: string;
  viewAllHref?: string;
  initiatives?: Initiative[];
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
};

export default function InitiativesSection({
  eyebrow = "WHAT WE'RE BUILDING",
  heading = "Initiatives",
  viewAllHref = "/initiatives",
  initiatives = [],
  imageSrc,
  videoSrc,
  imageAlt = "",
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Default to the FIRST initiative's media when nothing is hovered, so
  // the panel is never empty and a one-item list naturally shows that
  // item's image/video. The section-level imageSrc/videoSrc/imageAlt
  // props are a deeper fallback for when there are no initiatives at all.
  const activeInitiative =
    activeIndex !== null ? initiatives[activeIndex] : initiatives[0];
  const displayedImageSrc = activeInitiative?.imageSrc ?? imageSrc;
  const displayedVideoSrc = activeInitiative?.videoSrc ?? videoSrc;
  const displayedImageAlt = activeInitiative?.imageAlt ?? imageAlt;

  return (
    <section
      data-nav-theme="light"
      className="bg-error-25 px-5 md:px-20 lg:px-32 py-8 md:py-14 lg:py-20"
    >
      <div
        className="mx-auto max-w-page rounded-[27.22px] px-6 md:px-10 lg:px-14 py-7 md:py-10 lg:py-14"
        style={{ backgroundColor: "#CAF1FF" }}
      >
        <div
          data-reveal-stagger
          className="flex items-start justify-between gap-3 mb-5 md:mb-7 lg:mb-8"
        >
          <div>
            <div className="font-display text-sm md:text-base lg:text-[18.71px] font-normal leading-none tracking-normal text-primary-500 uppercase">
              {eyebrow}
            </div>
            <h2 className="mt-2 md:mt-3 font-display text-2xl md:text-3xl lg:text-[30px] font-semibold leading-[1.1] tracking-normal text-primary-500">
              {heading}
            </h2>
          </div>
          <CtaLink
            href={viewAllHref}
            className="group/viewall flex items-center gap-3 text-primary-500 transition-opacity duration-300 ease-[var(--ease-premium)] hover:opacity-80 focus-visible:outline-none focus-visible:opacity-100"
          >
            <span className="hidden md:inline font-display text-base lg:text-[18.71px] font-normal leading-none tracking-normal transition-transform duration-300 ease-[var(--ease-premium)] group-hover/viewall:-translate-x-0.5 motion-reduce:transform-none">
              View all
            </span>
            <ArrowCircle
              size={36}
              className="text-primary-500 transition-transform duration-300 ease-[var(--ease-premium)] group-hover/viewall:translate-x-1 group-hover/viewall:rotate-[8deg] motion-reduce:transform-none"
            />
          </CtaLink>
        </div>

        <div
          data-reveal-stagger
          className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8 items-stretch"
          onMouseLeave={() => setActiveIndex(null)}
        >
          {/* Original layout: 2/5 image column at natural 414:551
              aspect, 3/5 list column with its rows packed at the top
              using just `gap-3 lg:gap-4`. Restored after experimenting
              with `justify-between`, max-width caps, and `items-start`
              variants — the original design intent is this one. */}
          <div
            data-reveal="scale"
            className="md:col-span-2 flex items-end"
          >
            <InitiativesShape
              key={displayedVideoSrc ?? displayedImageSrc}
              size={500}
              imageSrc={displayedImageSrc}
              videoSrc={displayedVideoSrc}
              imageAlt={displayedImageAlt}
              cinematic
              className="w-full h-auto"
            />
          </div>

          <div
            data-reveal-stagger
            className="md:col-span-3 flex flex-col gap-3 lg:gap-4"
          >
            {initiatives.map((initiative, idx) => (
              <InitiativeRow
                key={initiative.href ?? `${initiative.title}-${idx}`}
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
  const clickable = !!initiative.href;
  const numberClassName = `shrink-0 w-14 md:w-20 lg:w-24 font-display text-5xl md:text-7xl lg:text-[102.07px] font-thin leading-none tracking-normal uppercase transition-colors duration-300 ease-[var(--ease-premium)] ${
    isActive ? "text-primary-500/60" : "text-gray-300 group-hover:text-primary-500/60"
  }`;
  const rowClassName = `group flex items-center gap-3 md:gap-4 lg:gap-6 rounded-lg pl-4 md:pl-6 lg:pl-8 pr-3 md:pr-4 lg:pr-6 py-4 md:py-5 lg:py-6 transition-all duration-300 ease-[var(--ease-premium)] ${
    clickable
      ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 cursor-pointer"
      : "cursor-default"
  } ${
    isActive
      ? "bg-gray-50 shadow-[0_6px_22px_-14px_rgba(0,0,54,0.25)]"
      : "bg-white hover:bg-gray-50 hover:shadow-[0_6px_22px_-14px_rgba(0,0,54,0.25)]"
  }`;

  const inner = (
    <>
      <div className={numberClassName}>{index}</div>

      <div className="flex-1 min-w-0">
        {initiative.featured ? (
          <div className="text-xs font-bold tracking-[0.12em] text-primary-500 uppercase mb-1">
            Featured
          </div>
        ) : null}
        <h3 className="text-base lg:text-[22px] font-light text-primary-500 leading-[1.2] tracking-normal line-clamp-1 transition-transform duration-300 ease-[var(--ease-premium)] group-hover:translate-x-0.5 motion-reduce:transform-none">
          {initiative.title}
        </h3>
      </div>

      <p className="hidden lg:block w-[34%] shrink-0 text-sm text-primary-500/70 leading-[1.4]">
        {initiative.description}
      </p>

      {clickable ? (
        <ArrowCircle
          size={36}
          className={`shrink-0 text-primary-500 transition-transform duration-300 ease-[var(--ease-premium)] motion-reduce:transform-none ${
            isActive
              ? "translate-x-1 rotate-[8deg]"
              : "group-hover:translate-x-1 group-hover:rotate-[8deg]"
          }`}
        />
      ) : null}
    </>
  );

  // Display-only initiatives (no href) render as a div — still hover-
  // reactive (the media panel reads the active index) but not clickable
  // and not focusable. Skips the arrow chevron too so the row reads as
  // a card rather than a CTA.
  if (!clickable) {
    return (
      <div
        onMouseEnter={onHover}
        className={rowClassName}
      >
        {inner}
      </div>
    );
  }

  return (
    <CtaLink
      href={initiative.href!}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={rowClassName}
    >
      {inner}
    </CtaLink>
  );
}
