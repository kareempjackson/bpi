"use client";

import { useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ComponentProps } from "react";

import { MOTION_TAGS, type MotionTag } from "./Reveal";

/**
 * Declarative scroll parallax. Replaces `ParallaxController` + `[data-parallax]`
 * with `useScroll` + `useTransform`. Coexists with Lenis: Lenis drives native
 * scroll, `useScroll` reads it.
 *
 * `speed` matches the old `data-parallax` attribute — positive drifts the
 * element up as it scrolls through the viewport, clamped to [-0.35, 0.35] like
 * the controller did. Authoring pattern is unchanged: wrap in an
 * `overflow-hidden` clip container and oversize the parallax element ~10% so its
 * edges stay covered while it drifts.
 */
type ParallaxProps<T extends MotionTag = "div"> = {
  as?: T;
  /** Parallax speed, default 0.12 (as in the old controller). */
  speed?: number;
} & Omit<ComponentProps<(typeof MOTION_TAGS)[T]>, "as">;

export function Parallax<T extends MotionTag = "div">({
  as,
  speed = 0.12,
  children,
  style,
  ...rest
}: ParallaxProps<T>) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const clamped = Math.max(-0.35, Math.min(0.35, speed));
  // Reproduce the old ParallaxController: it wrote
  //   transformY = (viewportCenter − elementCenter) × speed,
  // so as the element travels bottom→top through the viewport the drift runs
  // negative→positive. `scrollYProgress` (offset start-end→end-start) is 0 when
  // the element enters at the bottom and 1 when it exits at the top, matching
  // that same bottom→top pass. ~200px per unit of speed approximates the
  // controller's peak displacement (≈ speed × half a viewport) for typical
  // viewport heights, staying within the ~12% oversize authors add to the clip.
  const range = clamped * 200;
  const y = useTransform(scrollYProgress, [0, 1], [-range, range]);

  const tag = (as ?? "div") as MotionTag;

  if (reduce) {
    const MotionEl = MOTION_TAGS[tag];
    // Still attach the ref target so layout matches, but no transform.
    return (
      // @ts-expect-error — polymorphic motion element props are sound at each call site.
      <MotionEl ref={ref} style={style} {...rest}>
        {children}
      </MotionEl>
    );
  }

  const MotionEl = MOTION_TAGS[tag];
  return (
    // @ts-expect-error — polymorphic motion element props are sound at each call site.
    <MotionEl ref={ref} style={{ ...style, y }} {...rest}>
      {children}
    </MotionEl>
  );
}
