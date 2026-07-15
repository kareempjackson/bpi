import type { Transition } from "motion/react";

/**
 * Motion tokens — the JS counterpart to the CSS custom properties in
 * `globals.css` (`:root`, lines ~138–146 and the reveal block ~457–461).
 * Keeping these in sync means Framer-Motion-driven animation matches the
 * site's established feel exactly.
 */

/** Easing curves, as cubic-bezier control-point arrays for `transition.ease`. */
export const EASE = {
  /** --ease-premium — the house curve, used for reveals and most entrances. */
  premium: [0.22, 1, 0.36, 1],
  /** --ease-emphasized */
  emphasized: [0.32, 0.72, 0, 1],
  /** --ease-decelerated */
  decelerated: [0.05, 0.7, 0.1, 1],
  /** --ease-standard */
  standard: [0.4, 0, 0.2, 1],
} as const;

/** Durations, in seconds (CSS tokens are ms). */
export const DUR = {
  fast: 0.2, // --dur-fast 200ms
  base: 0.32, // --dur-base 320ms
  slow: 0.7, // --dur-slow 700ms
  reveal: 0.95, // --reveal-duration 0.95s
  revealSlow: 1.0, // --dur-reveal 1000ms (the "slow" reveal variant)
} as const;

/** The reveal rise distance, in px (--reveal-rise). */
export const REVEAL_RISE = 14;

/**
 * Spring presets for the "upgraded feel". Tuned to match the drawer springs
 * already shipping in `sectors/SectorsStack.tsx` so the whole site shares one
 * spring vocabulary.
 */
export const SPRING = {
  /** Weighty, slightly under-damped — a mechanical "click into place". */
  drawer: { type: "spring", stiffness: 300, damping: 19, mass: 0.8 },
  /** Softer open — for heights, panels, larger travel. */
  soft: { type: "spring", stiffness: 220, damping: 30, mass: 0.8 },
  /** Snappy content settle — for text/inner content fading in. */
  content: { type: "spring", stiffness: 360, damping: 34, mass: 0.7 },
  /** Smoothing spring for scroll-linked progress (Hero, care-map). */
  scroll: { stiffness: 120, damping: 30, mass: 0.5 },
} as const satisfies Record<string, Transition>;
