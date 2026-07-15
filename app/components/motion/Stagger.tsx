"use client";

import { useReducedMotion } from "motion/react";
import { createElement, type ComponentProps, type ReactNode } from "react";

import {
  MOTION_TAGS,
  REVEAL_VIEWPORT,
  revealVariants,
  type MotionTag,
  type RevealPreset,
} from "./Reveal";

/**
 * Staggered reveal. Replaces `[data-reveal-stagger]`: the parent orchestrates
 * its children, each of which must be a `<StaggerItem>`. The parent itself
 * does not animate — it only drives `staggerChildren`.
 *
 * The old CSS used per-nth-child delays (~45ms for the first items, loosening
 * to ~50ms). `staggerChildren: 0.045` reproduces that cadence declaratively.
 */
type StaggerProps<T extends MotionTag = "div"> = {
  as?: T;
  /** Seconds between each child's start (default 0.045, matches old cadence). */
  gap?: number;
  /** Delay before the first child begins. */
  delayChildren?: number;
  once?: boolean;
  amount?: number;
} & Omit<ComponentProps<(typeof MOTION_TAGS)[T]>, "as">;

export function Stagger<T extends MotionTag = "div">({
  as,
  gap = 0.045,
  delayChildren = 0,
  once = REVEAL_VIEWPORT.once,
  amount = REVEAL_VIEWPORT.amount,
  children,
  ...rest
}: StaggerProps<T>) {
  const reduce = useReducedMotion();
  const tag = (as ?? "div") as MotionTag;

  if (reduce) {
    return createElement(tag, rest, children as ReactNode);
  }

  const MotionEl = MOTION_TAGS[tag];
  return (
    // @ts-expect-error — polymorphic motion element props are sound at each call site.
    <MotionEl
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: REVEAL_VIEWPORT.margin }}
      variants={{
        visible: { transition: { staggerChildren: gap, delayChildren } },
      }}
      {...rest}
    >
      {children}
    </MotionEl>
  );
}

/**
 * A child of `<Stagger>`. Carries the reveal variants but no own `whileInView`
 * trigger — the parent's `staggerChildren` propagates the `visible` state to it
 * on a delay. Under reduced motion it renders plain and static.
 */
type StaggerItemProps<T extends MotionTag = "div"> = {
  as?: T;
  preset?: RevealPreset;
} & Omit<ComponentProps<(typeof MOTION_TAGS)[T]>, "as">;

export function StaggerItem<T extends MotionTag = "div">({
  as,
  preset = "rise",
  children,
  ...rest
}: StaggerItemProps<T>) {
  const reduce = useReducedMotion();
  const tag = (as ?? "div") as MotionTag;

  if (reduce) {
    return createElement(tag, rest, children as ReactNode);
  }

  const MotionEl = MOTION_TAGS[tag];
  return (
    // @ts-expect-error — polymorphic motion element props are sound at each call site.
    <MotionEl variants={revealVariants(preset)} {...rest}>
      {children}
    </MotionEl>
  );
}
