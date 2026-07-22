"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import CtaLink from "./CtaLink";
import { SPRING } from "./motion";

export type PriorityIndexItem = {
  label: string;
  href?: string;
  subtitle?: string | null;
};

/**
 * The strategic-priorities index. Each row is a numbered bar separated by hair
 * dividers; resting on one springs it open — like pulling a drawer out — to
 * reveal the priority's subtitle and a "Learn more" cue. Mirrors the drawer
 * behaviour of `sectors/SectorsStack.tsx`: an `AnimatePresence` height spring
 * with the inner copy fading + rising in just after. Reduced motion cuts
 * straight to the open/closed state.
 */
export default function PrioritiesIndex({
  items,
}: {
  items: PriorityIndexItem[];
}) {
  // The first priority is open by default and is the resting state the index
  // returns to when the pointer leaves.
  const [active, setActive] = useState<number | null>(0);
  const reduce = useReducedMotion();

  // Softer spring opens the height; the copy settles a hair later so the
  // reveal reads as layered (same tuning vocabulary as SectorsStack).
  const heightTransition = reduce ? { duration: 0 } : SPRING.soft;
  const contentTransition = reduce
    ? { duration: 0 }
    : { ...SPRING.content, delay: 0.02 };

  return (
    <ul className="flex flex-col" onMouseLeave={() => setActive(0)}>
      {items.map((item, i) => {
        const num = String(i + 1).padStart(2, "0");
        const open = i === active && !!item.subtitle;

        const header = (
          <div className="flex items-center justify-between gap-6 py-5 lg:py-6">
            <span className="text-base md:text-lg font-semibold text-primary-500 transition-transform duration-300 ease-(--ease-premium) group-hover:translate-x-0.5 motion-reduce:transform-none">
              {item.label}
            </span>
            <span className="text-sm text-primary-500/60 tabular-nums">
              {num}
            </span>
          </div>
        );

        // The drawer body: subtitle + a "Learn more" cue. The whole row is the
        // link, so this stays plain text (no nested anchor).
        const drawer = item.subtitle ? (
          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                key="body"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={heightTransition}
                className="overflow-hidden"
              >
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: 6 }}
                  transition={contentTransition}
                  className="pb-5 lg:pb-6 -mt-1"
                >
                  <p className="max-w-xl text-sm text-primary-500/60 leading-relaxed">
                    {item.subtitle}
                  </p>
                  {item.href ? (
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-500">
                      Learn more
                      <span
                        aria-hidden
                        className="transition-transform duration-300 ease-(--ease-premium) group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                  ) : null}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        ) : null;

        return (
          <li key={`${i}-${item.label}`} className="border-t border-primary-500/15">
            {item.href ? (
              <CtaLink
                href={item.href}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive((cur) => (cur === i ? null : cur))}
                className="group block focus-visible:outline-none"
              >
                {header}
                {drawer}
              </CtaLink>
            ) : (
              <div
                className="group block"
                onMouseEnter={() => setActive(i)}
              >
                {header}
                {drawer}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
