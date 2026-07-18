"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import CtaLink from "@/app/components/CtaLink";

export type SectorSlide = {
  nodeId: string;
  title: string;
  description?: string;
  href?: string;
  imageSrc?: string;
  /** When set, the drawer plays this video (muted, looping) in place of the
   *  still. `imageSrc` is used as its poster. */
  videoSrc?: string;
  imageAlt?: string;
};

// Each drawer takes a distinct on-brand colour, cycling the brand's blue
// (`warning`), navy (`primary`) and mint (`error`) families. `accent` tints the
// title + number badge (+ the open card's link); `ink` is the open card's body
// copy. Every pairing keeps AA contrast on its background.
type CardTheme = { bg: string; accent: string; ink: string };
const CARD_THEMES: CardTheme[] = [
  { bg: "#CAF1FF", accent: "#000036", ink: "#000036" }, // pale blue
  { bg: "#000036", accent: "#06fe83", ink: "#CAF1FF" }, // navy · mint accent
  { bg: "#83ffc1", accent: "#000036", ink: "#000036" }, // pale mint
  { bg: "#0870ad", accent: "#CAF1FF", ink: "#FFFFFF" }, // blue
  { bg: "#9bffcd", accent: "#000036", ink: "#000036" }, // mint
  { bg: "#529bc6", accent: "#00122a", ink: "#00122a" }, // mid blue
];

// Soft drop only — each card is a clean, fully-rounded panel; a small gap
// separates them so nothing overlaps.
const SHADOW_REST = "0 10px 26px -20px rgba(0,0,54,0.4)";
const SHADOW_OPEN = "0 26px 55px -30px rgba(0,0,54,0.5)";

/**
 * The sectors as a stack of expandable drawers. Every card shows its title and
 * number badge at all times; clicking a card opens it to reveal its body copy
 * beside a large still, and clicking the open card again collapses it. The
 * collapsed cards nest neatly at the top (and bottom) of the stack. Spring-driven
 * via framer-motion; reduced motion flattens to a cut.
 */
export default function SectorsStack({ slides }: { slides: SectorSlide[] }) {
  // The first drawer is open initially; clicking toggles a drawer open/closed.
  // `null` means every drawer is collapsed.
  const [active, setActive] = useState<number | null>(0);
  const reduce = useReducedMotion();

  const drawerTransition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 22, mass: 0.8 };
  const heightTransition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 220, damping: 30, mass: 0.8 };
  const contentTransition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 360, damping: 34, mass: 0.7, delay: 0.02 };

  return (
    <div className="relative flex flex-col gap-2 md:gap-2.5">
      {slides.map((s, i) => {
        const open = i === active;
        // Each card takes its own on-brand colour.
        const { bg, accent, ink } = CARD_THEMES[i % CARD_THEMES.length];
        const number = String(i + 1).padStart(2, "0");
        return (
          <motion.div
            key={s.nodeId}
            initial={false}
            animate={{
              boxShadow: reduce ? "none" : open ? SHADOW_OPEN : SHADOW_REST,
            }}
            transition={drawerTransition}
            style={{ backgroundColor: bg }}
            className="relative rounded-3xl px-6 md:px-10 lg:px-14"
          >
            <button
              type="button"
              onClick={() => setActive(open ? null : i)}
              aria-expanded={open}
              className={`flex w-full items-center justify-between gap-6 text-left focus-visible:outline-none ${
                open ? "pt-8 md:pt-10" : "h-20 md:h-24"
              }`}
            >
              <span
                className="font-display text-xl md:text-2xl lg:text-3xl font-bold tracking-[-0.01em]"
                style={{ color: accent }}
              >
                {s.title}
              </span>
              <span
                aria-hidden
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border font-display text-sm font-semibold md:h-12 md:w-12"
                style={{ borderColor: accent, color: accent }}
              >
                {number}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  key="content"
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={heightTransition}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: 6 }}
                    transition={contentTransition}
                    className="flex flex-col gap-8 pt-4 pb-10 lg:flex-row lg:items-start lg:gap-14"
                  >
                    {/* Body copy + link on the left. */}
                    <div className="flex flex-1 flex-col gap-6 lg:pt-2">
                      {s.description ? (
                        <p
                          className="max-w-xl text-base leading-relaxed md:text-lg"
                          style={{ color: ink }}
                        >
                          {s.description}
                        </p>
                      ) : null}
                      {s.href ? (
                        <CtaLink
                          href={s.href}
                          className="inline-flex w-fit items-center rounded-round border px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
                          style={{ borderColor: accent, color: accent }}
                        >
                          Learn More
                        </CtaLink>
                      ) : null}
                    </div>
                    {/* Large media on the right — the sector's video (muted,
                        looping) when one is set, otherwise its still image. */}
                    {s.videoSrc ? (
                      <div className="relative aspect-2/1 w-full shrink-0 overflow-hidden rounded-2xl bg-primary-500/5 lg:w-[46%]">
                        <video
                          src={s.videoSrc}
                          poster={s.imageSrc}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          aria-label={s.imageAlt || s.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    ) : s.imageSrc ? (
                      <div className="relative aspect-2/1 w-full shrink-0 overflow-hidden rounded-2xl bg-primary-500/5 lg:w-[46%]">
                        <Image
                          src={s.imageSrc}
                          alt={s.imageAlt ?? ""}
                          fill
                          sizes="(min-width: 1024px) 46vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
