"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ArrowCircle from "./ArrowCircle";
import CtaLink from "./CtaLink";
import InitiativesShape from "./shapes/InitiativesShape";
import { Stagger, StaggerItem } from "./motion";

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
  // A row becomes active only on a *deliberate* hover — the pointer must
  // come to rest over it. Scroll-induced mouseenter events (the page
  // moving under a stationary cursor) are ignored so the media panel
  // doesn't flick between initiatives while the user is scrolling past.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const scrollingRef = useRef(false);
  const candidateRef = useRef<number | null>(null);
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDwell = useCallback(() => {
    if (dwellTimer.current) {
      clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    }
  }, []);

  // Activate `idx` only after the pointer has rested on it briefly and
  // the page isn't mid-scroll.
  const scheduleOpen = useCallback(
    (idx: number) => {
      clearDwell();
      dwellTimer.current = setTimeout(() => {
        if (!scrollingRef.current && candidateRef.current === idx) {
          setActiveIndex(idx);
        }
      }, 90);
    },
    [clearDwell],
  );

  const handleEnter = useCallback(
    (idx: number) => {
      candidateRef.current = idx;
      if (scrollingRef.current) return; // ignore enters caused by scrolling
      scheduleOpen(idx);
    },
    [scheduleOpen],
  );

  const handleLeave = useCallback(
    (idx: number) => {
      if (candidateRef.current === idx) candidateRef.current = null;
      clearDwell();
    },
    [clearDwell],
  );

  const handleListLeave = useCallback(() => {
    candidateRef.current = null;
    clearDwell();
    setActiveIndex(null);
  }, [clearDwell]);

  // Keyboard focus activates immediately — unaffected by pointer / scroll.
  const handleFocus = useCallback((idx: number) => {
    candidateRef.current = idx;
    setActiveIndex(idx);
  }, []);

  // While the page is scrolling, suppress hover activation. Once
  // scrolling settles, activate whichever row the cursor rests on.
  useEffect(() => {
    const markScrolling = () => {
      scrollingRef.current = true;
      clearDwell();
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => {
        scrollingRef.current = false;
        if (candidateRef.current != null) scheduleOpen(candidateRef.current);
      }, 160);
    };
    window.addEventListener("scroll", markScrolling, { passive: true });
    window.addEventListener("wheel", markScrolling, { passive: true });
    window.addEventListener("touchmove", markScrolling, { passive: true });
    return () => {
      window.removeEventListener("scroll", markScrolling);
      window.removeEventListener("wheel", markScrolling);
      window.removeEventListener("touchmove", markScrolling);
      clearDwell();
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [clearDwell, scheduleOpen]);

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
      className="bg-[#EAFBF1] px-6 md:px-10 lg:px-14 py-20 md:py-32 lg:py-40"
    >
      {/* Header */}
      <Stagger className="flex items-end justify-between gap-3 mb-6 md:mb-8">
        <StaggerItem>
          <div className="text-xs md:text-sm font-semibold tracking-[0.18em] text-primary-500/70 uppercase">
            {eyebrow}
          </div>
          <h2 className="mt-2 md:mt-3 font-display text-display-xs md:text-display-sm lg:text-display-md font-bold leading-[1.05] tracking-[-0.02em] text-primary-500">
            {heading}
          </h2>
        </StaggerItem>
        <StaggerItem>
          <CtaLink
            href={viewAllHref}
            className="group/viewall flex items-center gap-3 text-primary-500 transition-opacity duration-300 ease-[var(--ease-premium)] hover:opacity-80 focus-visible:outline-none focus-visible:opacity-100"
          >
            <span className="hidden sm:inline text-sm md:text-base font-medium transition-transform duration-300 ease-[var(--ease-premium)] group-hover/viewall:-translate-x-0.5 motion-reduce:transform-none">
              View all
            </span>
            <ArrowCircle
              size={40}
              dashed={false}
              className="text-primary-500 transition-transform duration-300 ease-[var(--ease-premium)] group-hover/viewall:translate-x-1 motion-reduce:transform-none"
            />
          </CtaLink>
        </StaggerItem>
      </Stagger>

      <Stagger
        className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 items-stretch"
        onMouseLeave={handleListLeave}
      >
        {/* Image column — notched shape, top-aligned with the list. */}
        <StaggerItem preset="scale" className="md:col-span-1 flex items-start">
          <InitiativesShape
            key={displayedVideoSrc ?? displayedImageSrc}
            size={500}
            imageSrc={displayedImageSrc}
            videoSrc={displayedVideoSrc}
            imageAlt={displayedImageAlt}
            cinematic
            className="w-full h-auto"
          />
        </StaggerItem>

        <Stagger
          className="md:col-span-2 flex flex-col gap-3 lg:gap-4 h-full"
        >
          {initiatives.map((initiative, idx) => (
            <StaggerItem
              key={initiative.href ?? `${initiative.title}-${idx}`}
              className="flex flex-1 min-h-0"
            >
              <InitiativeRow
                index={idx + 1}
                initiative={initiative}
                isActive={activeIndex === idx}
                onEnter={() => handleEnter(idx)}
                onLeave={() => handleLeave(idx)}
                onFocus={() => handleFocus(idx)}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </Stagger>
    </section>
  );
}

function InitiativeRow({
  index,
  initiative,
  isActive,
  onEnter,
  onLeave,
  onFocus,
}: {
  index: number;
  initiative: Initiative;
  isActive: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onFocus: () => void;
}) {
  const clickable = !!initiative.href;
  const numberClassName = `shrink-0 w-10 md:w-14 lg:w-20 font-display text-4xl md:text-6xl lg:text-7xl font-thin leading-none tracking-normal uppercase transition-colors duration-300 ease-[var(--ease-premium)] ${
    isActive ? "text-primary-500/60" : "text-gray-300 group-hover:text-primary-500/60"
  }`;
  const rowClassName = `group flex flex-1 min-h-0 items-center gap-4 md:gap-5 lg:gap-8 rounded-2xl md:rounded-3xl pl-4 md:pl-7 lg:pl-9 pr-4 md:pr-5 lg:pr-7 py-4 md:py-5 lg:py-6 bg-white transition-colors duration-300 ease-[var(--ease-premium)] ${
    clickable
      ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 cursor-pointer"
      : "cursor-default"
  }`;

  const inner = (
    <>
      <div className={numberClassName}>{index}</div>

      <div className="flex-1 min-w-0">
        {initiative.featured ? (
          <div className="text-[11px] md:text-xs font-bold tracking-[0.14em] text-primary-500 uppercase mb-1">
            Featured
          </div>
        ) : null}
        <h3 className="text-base lg:text-xl font-normal text-primary-500 leading-tight tracking-normal transition-transform duration-300 ease-[var(--ease-premium)] group-hover:translate-x-0.5 motion-reduce:transform-none">
          {initiative.title}
        </h3>
      </div>

      <p className="hidden lg:block w-[32%] shrink-0 text-sm text-primary-500/70 leading-[1.45]">
        {initiative.description}
      </p>

      <ArrowCircle
        size={40}
        dashed={false}
        className={`shrink-0 text-primary-500 transition-transform duration-300 ease-[var(--ease-premium)] motion-reduce:transform-none ${
          isActive
            ? "translate-x-1"
            : "group-hover:translate-x-1"
        }`}
      />
    </>
  );

  // Display-only initiatives (no href) render as a div — still hover-
  // reactive (the media panel reads the active index) but not clickable
  // and not focusable. Skips the arrow chevron too so the row reads as
  // a card rather than a CTA.
  if (!clickable) {
    return (
      <div
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className={rowClassName}
      >
        {inner}
      </div>
    );
  }

  return (
    <CtaLink
      href={initiative.href!}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onFocus}
      className={rowClassName}
    >
      {inner}
    </CtaLink>
  );
}
