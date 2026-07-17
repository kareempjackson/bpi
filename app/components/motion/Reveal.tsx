"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { createElement, type ComponentProps, type ReactNode } from "react";

import { DUR, EASE, REVEAL_RISE } from "./tokens";

/**
 * Declarative scroll-reveal. Replaces the `data-reveal` attribute contract
 * (RevealController + the CSS block in globals.css) with a `whileInView`
 * component. Reduced-motion is centralized here: when the user prefers reduced
 * motion the content renders immediately, visible and static.
 *
 * Presets mirror the old CSS variants exactly:
 *   rise  → default (opacity + 14px rise)     [data-reveal]
 *   fade  → opacity only                       [data-reveal="fade"]
 *   scale → opacity + 1.04→1 scale             [data-reveal="scale"]
 *   left  → opacity + 18px slide from left     [data-reveal="left"]
 *   slow  → rise, but 1s duration              [data-reveal="slow"]
 */
export type RevealPreset = "rise" | "fade" | "scale" | "left" | "slow";

/**
 * Tags a reveal wrapper can render as. Stable module-level motion components
 * (never created per-render, which would remount children). Extend as needed.
 */
export const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  footer: motion.footer,
  nav: motion.nav,
  aside: motion.aside,
  figure: motion.figure,
  figcaption: motion.figcaption,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  dl: motion.dl,
  dt: motion.dt,
  dd: motion.dd,
  span: motion.span,
  p: motion.p,
  a: motion.a,
  blockquote: motion.blockquote,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  svg: motion.svg,
} as const;

export type MotionTag = keyof typeof MOTION_TAGS;

/** Shared viewport config — mirrors RevealController's IntersectionObserver
 * (threshold 0.15, rootMargin "0px 0px -10% 0px"), one-shot. */
export const REVEAL_VIEWPORT = {
  once: true,
  amount: 0.15,
  margin: "0px 0px -10% 0px",
} as const;

/** Builds the hidden/visible variant pair for a preset. Exported so `Stagger`
 * children can reuse the identical motion vocabulary. */
export function revealVariants(preset: RevealPreset): Variants {
  const hidden: Record<RevealPreset, Variants["hidden"]> = {
    rise: { opacity: 0, y: REVEAL_RISE },
    fade: { opacity: 0 },
    scale: { opacity: 0, scale: 1.04 },
    left: { opacity: 0, x: -18 },
    slow: { opacity: 0, y: REVEAL_RISE },
  };
  return {
    hidden: hidden[preset],
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: preset === "slow" ? DUR.revealSlow : DUR.reveal,
        ease: EASE.premium,
      },
    },
  };
}

type RevealProps<T extends MotionTag = "div"> = {
  as?: T;
  preset?: RevealPreset;
  /** Override the one-shot behavior (default true). */
  once?: boolean;
  /** Fraction of the element that must be visible to trigger (default 0.15). */
  amount?: number;
  /**
   * Animate on mount instead of on scroll-into-view. Use for above-the-fold
   * content (e.g. a hero) that is already visible on load — `whileInView`
   * with the shared `-10%` bottom viewport cut can leave lower hero content
   * hidden until the user scrolls.
   */
  immediate?: boolean;
} & Omit<ComponentProps<(typeof MOTION_TAGS)[T]>, "as">;

export function Reveal<T extends MotionTag = "div">({
  as,
  preset = "rise",
  once = REVEAL_VIEWPORT.once,
  amount = REVEAL_VIEWPORT.amount,
  immediate = false,
  children,
  ...rest
}: RevealProps<T>) {
  const reduce = useReducedMotion();
  const tag = (as ?? "div") as MotionTag;

  // Reduced motion: render the plain element, visible and static.
  if (reduce) {
    return createElement(tag, rest, children as ReactNode);
  }

  const trigger = immediate
    ? { animate: "visible" as const }
    : {
        whileInView: "visible" as const,
        viewport: { once, amount, margin: REVEAL_VIEWPORT.margin },
      };

  const MotionEl = MOTION_TAGS[tag];
  return (
    // @ts-expect-error — polymorphic motion element props are sound at each call site.
    <MotionEl
      variants={revealVariants(preset)}
      initial="hidden"
      {...trigger}
      {...rest}
    >
      {children}
    </MotionEl>
  );
}
