"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Stagger, StaggerItem } from "@/app/components/motion";

export type Initiative = {
  title: string;
  subtitle?: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  /** Destination for the row. When omitted, the row is display-only. */
  href?: string;
};

type Props = {
  initiatives: Initiative[];
};

export default function InitiativesPanel({ initiatives }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [imageTop, setImageTop] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<Array<HTMLLIElement | null>>([]);
  const active = activeIndex !== null ? initiatives[activeIndex] : null;

  // Suppress hover while the page is scrolling — otherwise rows sliding under a
  // stationary cursor fire onMouseEnter and flicker active. We track the row the
  // cursor is over (`candidateRef`) and only activate it once scrolling settles.
  const scrollingRef = useRef(false);
  const candidateRef = useRef<number | null>(null);
  const pointerInsideRef = useRef(false);

  useEffect(() => {
    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      scrollingRef.current = true;
      // Hide any active hover the moment scrolling begins (no-op when already
      // null, so it won't re-render on every scroll tick).
      setActiveIndex((cur) => (cur === null ? cur : null));
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        scrollingRef.current = false;
        // Scrolling stopped — light up whatever row the cursor is resting on.
        if (pointerInsideRef.current && candidateRef.current !== null) {
          setActiveIndex(candidateRef.current);
        }
      }, 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });
    return () => {
      if (settleTimer) clearTimeout(settleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
    };
  }, []);

  // Whether the floating image should animate its vertical position. Only true
  // when moving between rows — on first appear it jumps to place (no slide).
  const [animateTop, setAnimateTop] = useState(false);
  const prevActiveRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (activeIndex === null) {
      prevActiveRef.current = null;
      return;
    }
    const row = rowRefs.current[activeIndex];
    const list = listRef.current;
    if (!row || !list) return;
    const rowRect = row.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    setImageTop(rowRect.top - listRect.top + rowRect.height / 2);
    // Animate the slide only when the image was already visible on another row;
    // when it first appears, jump to position and just fade in (no glide from
    // the top of the list).
    setAnimateTop(prevActiveRef.current !== null);
    prevActiveRef.current = activeIndex;
  }, [activeIndex]);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        pointerInsideRef.current = true;
      }}
      onMouseLeave={() => {
        pointerInsideRef.current = false;
        candidateRef.current = null;
        setActiveIndex(null);
      }}
    >
      <Stagger as="ul" ref={listRef} className="flex flex-col">
        {initiatives.map((item, idx) => {
          const isActive = idx === activeIndex;
          const showTopBorder =
            idx > 0 && activeIndex !== idx && activeIndex !== idx - 1;
          return (
            <StaggerItem
              as="li"
              key={item.title}
              ref={(el) => {
                rowRefs.current[idx] = el;
              }}
              onMouseEnter={() => {
                // Remember the row under the cursor; only activate it now if
                // we're not mid-scroll (otherwise the settle handler will).
                candidateRef.current = idx;
                if (!scrollingRef.current) setActiveIndex(idx);
              }}
              className={`relative grid grid-cols-12 gap-4 lg:gap-6 items-start px-4 lg:px-6 py-8 lg:py-9 outline-none transition-colors ${
                item.href ? "cursor-pointer" : ""
              } ${
                isActive
                  ? "rounded-md bg-error-25"
                  : showTopBorder
                    ? "border-t border-white/10"
                    : ""
              }`}
            >
              {/* Stretched link — the whole row is the click target. */}
              {item.href ? (
                <Link
                  href={item.href}
                  aria-label={item.title}
                  onFocus={() => setActiveIndex(idx)}
                  onBlur={() => setActiveIndex(null)}
                  className="absolute inset-0 z-10 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                />
              ) : null}
              <div
                className={`col-span-12 md:col-span-5 text-base lg:text-[22px] font-light leading-[1.2] tracking-normal transition-colors ${
                  isActive ? "text-primary-500" : "text-white"
                }`}
              >
                {item.title}
              </div>
              <p
                className={`col-span-12 md:col-span-7 text-sm lg:text-base font-light leading-normal tracking-normal transition-colors ${
                  isActive ? "text-primary-500/80" : "text-white/60"
                }`}
              >
                {item.description}
              </p>
            </StaggerItem>
          );
        })}
      </Stagger>

      <div
        aria-hidden={!active}
        className={`hidden md:block absolute right-0 lg:right-4 w-52 lg:w-64 aspect-4/5 rounded-lg overflow-hidden shadow-xl pointer-events-none ${
          active ? "opacity-100" : "opacity-0"
        }`}
        style={{
          top: imageTop,
          transform: "translateY(-50%)",
          transition: `opacity 500ms cubic-bezier(0.22,1,0.36,1)${
            animateTop ? ", top 500ms cubic-bezier(0.22,1,0.36,1)" : ""
          }`,
        }}
      >
        {active ? (
          <Image
            key={active.imageSrc}
            src={active.imageSrc}
            alt={active.imageAlt}
            fill
            sizes="(min-width: 1024px) 16rem, 13rem"
            className="object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}
