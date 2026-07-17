"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";

import { StaggerItem } from "@/app/components/motion";
import { DUR, EASE, REVEAL_RISE } from "@/app/components/motion/tokens";

/** One masonry card: its pre-rendered node plus the layout variant that
 *  decides how it sits in the multicol flow. */
type OtherWorkCardItem = {
  key: string;
  variant: "compact" | "feature";
  node: ReactNode;
};

/** Masonry placement classes. `column-span:all` and `break-inside-avoid` must
 *  sit on the direct child of the multicol container — i.e. this wrapper. */
function wrapperClass(variant: OtherWorkCardItem["variant"]): string {
  return variant === "feature"
    ? "[column-span:all] mb-5 lg:mb-6"
    : "break-inside-avoid mb-5 lg:mb-6";
}

/**
 * The Other Works masonry and its "View More" control.
 *
 * The cards arrive already rendered on the server, so this component only
 * decides how many of them reach the DOM — no Sanity data or image resolution
 * crosses into the client bundle. "View More" reveals the next batch and
 * disappears once nothing is left hidden, which is why it is a `<button>`
 * rather than a link: there is no "all initiatives" page to send anyone to;
 * the rest of them live right here.
 *
 * Newly revealed cards animate in with the house rise-and-fade, staggered
 * across the batch so they cascade rather than pop all at once.
 *
 * `children` is the featured tile slot — it sits between the masonry and the
 * button, so it has to be passed through rather than rendered alongside.
 */
export default function OtherWorksCards({
  cards,
  initialCount,
  step,
  children,
}: {
  cards: OtherWorkCardItem[];
  /** How many cards are visible before any interaction. */
  initialCount: number;
  /** How many more each click reveals. */
  step: number;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  // `count` is how many cards show; `revealedFrom` is the index the last reveal
  // began at, so only the freshly revealed batch carries an entrance stagger.
  // It starts at 0 so the initial batch cascades in on scroll, too.
  const [{ count, revealedFrom }, setReveal] = useState({
    count: initialCount,
    revealedFrom: 0,
  });

  const hiddenCount = cards.length - count;
  const visible = cards.slice(0, count);

  const revealMore = () =>
    setReveal((prev) => ({
      count: Math.min(prev.count + step, cards.length),
      revealedFrom: prev.count,
    }));

  return (
    <>
      {visible.length > 0 ? (
        <div className="columns-1 md:columns-2 gap-5 lg:gap-6">
          {visible.map((card, i) => {
            const isNew = i >= revealedFrom;
            // Cascade only the freshly revealed batch; settled cards render at
            // rest (they never re-mount, so their reveal ran once already).
            const delay = isNew ? (i - revealedFrom) * 0.07 : 0;
            return (
              <RevealCard
                key={card.key}
                className={wrapperClass(card.variant)}
                delay={delay}
                reduce={!!reduce}
              >
                {card.node}
              </RevealCard>
            );
          })}
        </div>
      ) : null}

      {children}

      {hiddenCount > 0 ? (
        <StaggerItem className="flex justify-end">
          <motion.button
            type="button"
            onClick={revealMore}
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            transition={{ duration: DUR.fast, ease: EASE.premium }}
            className="inline-flex w-fit cursor-pointer items-center rounded-round border border-white/50 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-(--ease-premium) hover:border-white/80 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            View More
          </motion.button>
        </StaggerItem>
      ) : null}
    </>
  );
}

/**
 * A single masonry cell. Rises + fades in when it enters the viewport (once),
 * which for click-revealed cards fires immediately since the section is already
 * on screen. Under reduced motion it renders static.
 */
function RevealCard({
  children,
  className,
  delay,
  reduce,
}: {
  children: ReactNode;
  className: string;
  delay: number;
  reduce: boolean;
}) {
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: REVEAL_RISE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
      transition={{ duration: DUR.reveal, ease: EASE.premium, delay }}
    >
      {children}
    </motion.div>
  );
}
