"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { EASE } from "@/app/components/motion";
import type { PortableTextBlock, ResolvedMedia } from "@/sanity/lib/types";

export type TrajectoryShowcaseBlock = {
  heading?: string | null;
  body?: PortableTextBlock[] | string | null;
  highlight?: boolean | null;
  media: ResolvedMedia | null;
};

type Props = {
  blocks: TrajectoryShowcaseBlock[];
  /** Dwell time on each beat before auto-advancing, in ms. */
  interval?: number;
};

const RING_R = 9;
const RING_C = 2 * Math.PI * RING_R;

/**
 * "From dependency to gateway" — narrative beats on the left, a fixed 600×720
 * media frame on the right. The section auto-cycles through the beats (a small
 * ring on the active beat tracks the dwell) and selecting a beat swaps the
 * media. Media accepts an image or a video.
 */
export default function TrajectoryShowcase({
  blocks,
  interval = 6000,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const count = blocks.length;
  const autoplay = !reduceMotion && count > 1;

  const select = useCallback((i: number) => setActive(i), []);

  // Auto-advance. Re-arming on every `active` change means a manual selection
  // restarts the dwell rather than cutting it short.
  useEffect(() => {
    if (!autoplay) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % count), interval);
    return () => clearTimeout(id);
  }, [active, autoplay, count, interval]);

  const activeMedia =
    blocks[active]?.media ?? blocks.find((b) => b.media)?.media ?? null;

  return (
    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_600px] lg:gap-12">
      {/* Left — narrative beats. Cards align flush-left with the nav logo; the
          active beat carries the highlight fill. */}
      <div className="flex max-w-4xl flex-col gap-2">
        {blocks.map((block, i) => {
          const isActive = i === active;
          return (
            <button
              key={`${i}-${block.heading ?? ""}`}
              type="button"
              onClick={() => select(i)}
              aria-current={isActive ? "true" : undefined}
              className={`relative w-full rounded-2xl px-6 py-6 text-left transition-colors duration-500 md:px-7 md:py-7 ${
                isActive ? "bg-error-50" : "bg-transparent hover:bg-error-50/40"
              }`}
            >
              {block.heading ? (
                <h3 className="pr-9 font-display text-lg font-bold leading-tight text-primary-500 md:text-xl">
                  {block.heading}
                </h3>
              ) : null}

              {/* Dwell ring — top-right of the active beat. */}
              {isActive && autoplay ? (
                <span className="absolute right-6 top-6 md:right-7 md:top-7">
                  <svg viewBox="0 0 24 24" className="size-5 -rotate-90">
                    <circle
                      cx="12"
                      cy="12"
                      r={RING_R}
                      fill="none"
                      strokeWidth="2"
                      className="stroke-primary-500/15"
                    />
                    <motion.circle
                      key={active}
                      cx="12"
                      cy="12"
                      r={RING_R}
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="stroke-error-500"
                      strokeDasharray={RING_C}
                      initial={{ strokeDashoffset: RING_C }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: interval / 1000, ease: "linear" }}
                    />
                  </svg>
                </span>
              ) : null}

              {block.body ? (
                <PortableTextBody
                  value={block.body}
                  className="mt-4"
                  paragraphClassName="text-base text-primary-500/75 leading-relaxed md:text-lg"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Right — 600×720 media frame that swaps with the active beat. Pinned
          to the section's right edge so it lines up with the nav menu. */}
      <div className="w-full lg:sticky lg:top-24">
        <div className="relative ml-auto aspect-5/6 w-full max-w-150 overflow-hidden rounded-xl bg-primary-500/5">
          <AnimatePresence initial={false}>
            <motion.div
              key={active}
              initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.6, ease: EASE.premium }}
              className="absolute inset-0"
            >
              {activeMedia ? (
                <MediaImage
                  media={activeMedia}
                  sizes="(min-width: 1024px) 600px, 100vw"
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
