"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import LazyVideo from "./LazyVideo";
import CtaLink from "./CtaLink";
import PortableTextBody from "./PortableTextBody";
import type { PortableTextBlock } from "@/sanity/lib/types";
import { Reveal, Stagger, StaggerItem } from "./motion";

type Item = {
  title: string;
  description: PortableTextBlock[] | string | null;
  href: string;
  imageSrc: string;
  videoSrc?: string;
  imageAlt?: string;
  /** Hex color used as the card fill. */
  color: string;
};

/** Wide media anchoring the bottom of the section (video preferred, image
 *  fallback), authored in Sanity and served from Cloudflare R2. */
type FeatureMedia = {
  videoSrc?: string;
  imageSrc?: string;
  imageAlt?: string;
};

type Props = {
  heading?: string;
  description?: PortableTextBlock[] | string | null;
  items?: Item[];
  feature?: FeatureMedia;
};

export default function ArchitectureOfCareSection({
  heading = "How We Work",
  description = "BPI is focused on four strategic priorities. Each one a deliberate step toward a Caribbean that manufactures, distributes, and regulates its own medicines.",
  items = [],
  feature,
}: Props) {
  // First row open by default. After that a row opens only on a *deliberate*
  // hover — the pointer must come to rest over it. Scroll-induced mouseenter
  // events (the page moving under a stationary cursor) are ignored so the
  // dropdowns don't flicker open while the user is scrolling past.
  const [active, setActive] = useState<number | null>(0);

  const scrollingRef = useRef(false);
  const candidateRef = useRef<number | null>(null);
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The default-open first row must survive mount. The reveal animation
  // translates the list under the cursor, which can fire spurious
  // mouseenter/mouseleave events; until the user *deliberately* moves the
  // pointer over the list, we ignore hover opens/closes so row 0 stays open.
  const interactedRef = useRef(false);
  const markInteracted = useCallback(() => {
    interactedRef.current = true;
  }, []);

  const clearDwell = useCallback(() => {
    if (dwellTimer.current) {
      clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    }
  }, []);

  // Open `idx` only after the pointer has rested on it briefly and the
  // page isn't mid-scroll.
  const scheduleOpen = useCallback(
    (idx: number) => {
      clearDwell();
      dwellTimer.current = setTimeout(() => {
        if (
          interactedRef.current &&
          !scrollingRef.current &&
          candidateRef.current === idx
        ) {
          setActive(idx);
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
    // Don't let a spurious mount-time mouseleave close the default-open row.
    if (interactedRef.current) setActive(null);
  }, [clearDwell]);

  // Keyboard focus opens immediately — unaffected by pointer / scroll.
  const handleFocus = useCallback((idx: number) => {
    interactedRef.current = true;
    candidateRef.current = idx;
    setActive(idx);
  }, []);

  // While the page is scrolling, suppress hover opens. Once scrolling
  // settles, open whichever row the cursor has come to rest on.
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

  return (
    <section
      data-nav-theme="light"
      className="bg-error-25 px-6 md:px-10 lg:px-14 pt-10 md:pt-20 lg:pt-28 pb-8 md:pb-16 lg:pb-24"
    >
      <div className="mx-auto max-w-page">
        <Stagger className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-start">
          <StaggerItem className="max-w-xl lg:sticky lg:top-28">
            <h2 className="font-display text-display-xs md:text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.05] tracking-[-0.02em]">
              {heading}
            </h2>
            {description ? (
              <PortableTextBody
                value={description}
                className="mt-4 md:mt-5 max-w-md"
                paragraphClassName="text-sm md:text-base text-primary-500/70 leading-relaxed"
              />
            ) : null}
          </StaggerItem>

          <StaggerItem
            as="ul"
            className="flex flex-col border-b border-primary-500/15"
            onMouseMove={markInteracted}
            onMouseLeave={handleListLeave}
          >
            {items.map((item, idx) => (
              <PriorityRow
                key={`${item.href}-${idx}`}
                item={item}
                index={idx}
                active={idx === active}
                onEnter={handleEnter}
                onLeave={handleLeave}
                onFocus={handleFocus}
              />
            ))}
          </StaggerItem>
        </Stagger>

        {/* Wide feature media anchoring the bottom of the section */}
        {feature?.videoSrc || feature?.imageSrc ? (
          <Reveal
            preset="scale"
            className="relative mt-10 md:mt-16 lg:mt-20 w-full aspect-video sm:aspect-2/1 lg:aspect-1976/640 rounded-2xl lg:rounded-3xl overflow-hidden bg-primary-500"
          >
            {feature.videoSrc ? (
              <LazyVideo
                src={feature.videoSrc}
                poster={feature.imageSrc}
                ariaLabel={feature.imageAlt || undefined}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                src={feature.imageSrc!}
                alt={feature.imageAlt ?? ""}
                fill
                sizes="100vw"
                className="object-cover"
              />
            )}
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

function PriorityRow({
  item,
  index,
  active,
  onEnter,
  onLeave,
  onFocus,
}: {
  item: Item;
  index: number;
  active: boolean;
  onEnter: (idx: number) => void;
  onLeave: (idx: number) => void;
  onFocus: (idx: number) => void;
}) {
  const hasMedia = Boolean(item.imageSrc || item.videoSrc);
  const num = String(index + 1).padStart(2, "0");

  return (
    <li
      className="border-t border-primary-500/15"
      onMouseEnter={() => onEnter(index)}
      onMouseLeave={() => onLeave(index)}
    >
      <CtaLink
        href={item.href}
        onFocus={() => onFocus(index)}
        aria-expanded={active}
        className="group block py-5 md:py-6 focus-visible:outline-none"
      >
        {/* Title row — number stays pinned to the right. */}
        <div className="flex items-center justify-between gap-6 text-primary-500">
          <span className="font-display text-xl md:text-2xl leading-tight tracking-[-0.01em] transition-opacity duration-300 group-hover:opacity-80">
            {item.title}
          </span>
          <span className="font-display text-sm md:text-base text-primary-500/50 tabular-nums">
            {num}
          </span>
        </div>

        {/* Expandable panel — animates open via grid-template-rows so the
            content height is measured automatically. */}
        <div
          className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-premium)] motion-reduce:transition-none ${
            active ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="pt-4 md:pt-5">
              {item.description ? (
                <PortableTextBody
                  value={item.description}
                  paragraphClassName="text-sm md:text-base text-primary-500/90 leading-relaxed max-w-lg"
                />
              ) : null}

              {hasMedia ? (
                <div className="relative mt-5 w-full max-w-md aspect-4/3 rounded-xl overflow-hidden bg-primary-500">
                  {item.videoSrc ? (
                    <LazyVideo
                      src={item.videoSrc}
                      poster={item.imageSrc}
                      ariaLabel={item.imageAlt || undefined}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt ?? ""}
                      fill
                      sizes="(min-width: 1024px) 28vw, 90vw"
                      className="object-cover"
                    />
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CtaLink>
    </li>
  );
}
