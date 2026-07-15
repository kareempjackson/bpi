/**
 * Motion primitives — the site's declarative animation vocabulary, built on
 * the `motion` package (`motion/react`). These replace the bespoke controllers
 * (RevealController, ParallaxController) and the `data-*` CSS attribute
 * contract. Reduced-motion is handled inside each primitive.
 */
export { Reveal, revealVariants, REVEAL_VIEWPORT, MOTION_TAGS } from "./Reveal";
export type { RevealPreset, MotionTag } from "./Reveal";
export { Stagger, StaggerItem } from "./Stagger";
export { Parallax } from "./Parallax";
export { EASE, DUR, SPRING, REVEAL_RISE } from "./tokens";
