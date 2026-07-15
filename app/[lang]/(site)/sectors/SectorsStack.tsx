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
  imageAlt?: string;
};

// Background colours cycle down the stack, matching the reference:
// white → mint → yellow → white → blue → mint.
const PALETTE = [
  "#FFFFFF",
  "#C6F0CE",
  "#E7EC86",
  "#FFFFFF",
  "#CFE9FB",
  "#C6F0CE",
];

// Layered shadow so each card casts onto the one below — the depth cue that
// makes the collapsed deck read as physically stacked / raised, without any
// transform that would distort the cards' width or height.
const SHADOW_REST =
  "0 -1px 1px rgba(255,255,255,0.35) inset, 0 14px 22px -12px rgba(0,0,54,0.4)";
const SHADOW_OPEN = "0 30px 60px -28px rgba(0,0,54,0.55)";

// Deck geometry. Every collapsed card is an identical fixed-height bar; each one
// overlaps the card above by exactly DECK_OVERLAP so the whole stack staggers by
// a single uniform amount (one thin colour band per card).
const DECK_OVERLAP = "2.25rem";

/**
 * The six sectors as a fanned stack of cards. The active card (the first by
 * default) lifts out of the deck and opens to reveal its image, description and
 * link; every other card tucks under the one above so only a slim colour band
 * shows. Hovering, focusing, or tapping a card slides the open state onto it.
 * Spring-driven via framer-motion; reduced motion flattens to a cut.
 */
export default function SectorsStack({ slides }: { slides: SectorSlide[] }) {
  // The first drawer is open by default; hovering, focusing, or tapping another
  // slides the open state onto it. One drawer stays open at all times, so the
  // panel never fully collapses when the pointer leaves the stack.
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  // The "pull the drawer out" motion — a weighty, controlled spring on the 3D
  // transform + shadow. Height opens on a softer spring; the inner content
  // fades + rises in just after, so the reveal reads as layered.
  // Slightly under-damped so the drawer overshoots a hair and settles — a
  // faint mechanical "click into place" as it locks open.
  const drawerTransition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 19, mass: 0.8 };
  const heightTransition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 220, damping: 30, mass: 0.8 };
  const contentTransition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 360, damping: 34, mass: 0.7, delay: 0.02 };

  return (
    <div className="relative flex flex-col">
      {slides.map((s, i) => {
        const open = i === active;
        // Uniform stagger: the top card, the open card, and the card directly
        // below the open one sit flush; every other card overlaps the one above
        // by exactly DECK_OVERLAP — so each collapsed card reveals an identical
        // colour band, evenly spaced.
        // Every card below the top one tucks under the card above by exactly
        // DECK_OVERLAP, so each reveals an identical, evenly-spaced band.
        const marginTop = i === 0 ? 0 : `-${DECK_OVERLAP}`;
        // Each card away from the open one is inset a little more, centered, so
        // the deck tapers as it recedes — a stack seen in perspective. Height
        // and vertical stagger stay identical; only the width steps in.
        const scaleX =
          open || reduce ? 1 : Math.max(0.8, 1 - Math.abs(i - active) * 0.035);
        return (
          <motion.div
            key={s.nodeId}
            onMouseEnter={() => setActive(i)}
            initial={false}
            animate={{
              scaleX,
              boxShadow: reduce ? "none" : open ? SHADOW_OPEN : SHADOW_REST,
            }}
            transition={drawerTransition}
            style={{
              backgroundColor: PALETTE[i % PALETTE.length],
              // Cards nearest the open one sit in FRONT; the stack recedes behind
              // as it goes down, so the top card reads first (not the last one).
              zIndex: open
                ? slides.length + 1
                : slides.length - Math.abs(i - active),
              marginTop,
            }}
            className="relative rounded-2xl px-6 md:px-8"
          >
            <button
              type="button"
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-expanded={open}
              className={`flex w-full items-center text-left focus-visible:outline-none ${
                open ? "pt-9 pb-6" : "h-20 md:h-24"
              }`}
            >
              <span
                className={`font-display text-sm md:text-base font-bold uppercase tracking-wider text-primary-500 ${
                  open ? "" : "sr-only"
                }`}
              >
                {s.title}
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
                    className="flex flex-col gap-5 pt-2 pb-10 sm:flex-row sm:items-center sm:gap-8"
                  >
                    {/* Compact still — a small contained thumbnail, not a banner. */}
                    {s.imageSrc ? (
                      <div className="relative aspect-3/2 w-full shrink-0 overflow-hidden rounded-lg bg-primary-500/5 sm:w-52 lg:w-60">
                        <Image
                          src={s.imageSrc}
                          alt={s.imageAlt ?? ""}
                          fill
                          sizes="(min-width: 640px) 15rem, 100vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    {/* Description + link. */}
                    <div className="flex min-w-0 flex-col gap-4">
                      {s.description ? (
                        <p className="max-w-xl text-sm leading-relaxed text-primary-500/65">
                          {s.description}
                        </p>
                      ) : null}
                      <CtaLink
                        href={s.href}
                        className="inline-flex w-fit items-center rounded-round border border-primary-500 px-4 py-1.5 text-xs font-semibold text-primary-500 transition-colors hover:bg-primary-500/5"
                      >
                        Learn More
                      </CtaLink>
                    </div>
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
