"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRouter } from "next/navigation";
import CtaLink from "./CtaLink";
import { useViewTransitionNav } from "./ViewTransitionProvider";
import LogoShape, { LOGO_SHAPE_PATH_D } from "./shapes/LogoShape";

type Node = {
  id: string;
  num: string;
  title: string;
  description: string;
  /** SVG circle position + radius — matches LogoShape's 1190 × 702 viewBox. */
  cx: number;
  cy: number;
  r: number;
  imageSrc: string;
  imageAlt: string;
  /** When set, a looping video plays inside the porthole instead of the still image. */
  videoSrc?: string;
  /** Where the label block sits — as a % of the diagram wrapper. */
  labelLeftPct: number;
  labelTopPct: number;
  /**
   * Optional destination route for clicking into the node's full
   * sector page. Defaults to `/sectors/{id}` if omitted.
   */
  href?: string;
};

type Props = {
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  nodes?: Node[];
};

const VIEWBOX_W = 1190;
const VIEWBOX_H = 702;

// `easeOutExpo` — matches var(--ease-premium): fast take-off, long settle.
const sceneEaseOutExpo = (t: number): number =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

// Inertial smoothing for the scroll-coupled reveal — the motion-spring
// replacement for the old hand-rolled 0.14/frame LERP ("premium float": quick
// enough to feel responsive, soft enough that fast scrolls settle rather than
// slam). Tuned to approximate the old feel; a candidate for live QA tuning.
const REVEAL_SPRING = { stiffness: 120, damping: 26, mass: 0.4 } as const;

// Scroll-coupled phase progress for one node's sub-window inside its
// activation step. Shared by the rAF (which writes the live reveal) and the
// initial-render defaults so both stay in exact lockstep.
const phaseAt = (
  act: number,
  nodeIdx: number,
  subStart: number,
  subEnd: number,
  stepFraction: number,
): number => {
  const stepStart = (nodeIdx + 1) * stepFraction;
  const stepEnd = (nodeIdx + 2) * stepFraction;
  const inStep = (act - stepStart) / (stepEnd - stepStart);
  const raw = Math.max(
    0,
    Math.min(1, (inStep - subStart) / (subEnd - subStart)),
  );
  return sceneEaseOutExpo(raw);
};

export default function SectorsSection({
  heading = "Shifting Trade Prowess in Favour of the Global South",
  body = "BPI is building across six sectors, each one a structural component of the Caribbean's pharmaceutical future.",
  ctaLabel = "Explore sectors",
  ctaHref = "/sectors",
  nodes = [],
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const stickyRangeRef = useRef<HTMLDivElement>(null);
  // Refs targeted by the unified scroll/parallax RAF so we can write
  // styles directly without triggering React re-renders.
  const perspectiveRef = useRef<HTMLDivElement>(null);
  // Mouse-parallax tilt — pointer position (normalised to [-1, 1]) held in
  // MotionValues, spring-smoothed, then mapped to the diagram's rotateX/rotateY.
  // Replaces the hand-rolled lerp rAF; the static 2° forward tilt is baked into
  // the rotateX mapping. Spring is soft (matches the old 0.055 lerp feel).
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 55, damping: 15, mass: 1 });
  const springY = useSpring(mouseY, { stiffness: 55, damping: 15, mass: 1 });
  const diagramRotateX = useTransform(springY, (v) => 2 - v * 1.8);
  const diagramRotateY = useTransform(springX, (v) => v * 2.2);
  // The section holds a fixed tall scroll range in both directions: going
  // DOWN it's a long pinned scrub that reveals the six nodes one-by-one;
  // going UP the diagram is held fully lit (see `revealedRef`) so nothing
  // reverse-animates. There is deliberately NO height collapse — shrinking
  // the range while it sits above the viewport forced a programmatic scroll
  // compensation that (with Lenis driving scroll) jumped the page backward.
  // `revealedRef` latches once the molecule has fully revealed; combined
  // with the scroll direction it holds the diagram fully lit while the user
  // scrolls back UP, so the nodes never reverse-animate on the way out.
  const revealedRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const scrollDirRef = useRef<"up" | "down">("down");
  // Pinned scroll length for the node-by-node reveal. The section stays this
  // height in both directions — no collapse/scroll-compensation, which (with
  // Lenis driving scroll) could never be made invisible and caused the page
  // to jump backward after the Initiatives slide-over.
  const TALL_VH = (nodes.length + 1) * 70;
  const router = useRouter();
  const viewTransition = useViewTransitionNav();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // `step` (0..nodes.length) stays React state: it gates DISCRETE, structural
  // things (which nodes accept pointer events, the one-shot shine sweep, the
  // idle "breathing" once fully revealed). It changes ~6 times per traversal,
  // not per frame, so its re-renders are cheap.
  const [step, setStep] = useState(0);
  // The CONTINUOUS reveal progress — intro rise, per-node activation, and the
  // recede/push-to-back — is NOT React state. Driving it through setState
  // re-rendered this ~1,200-line SVG tree on every scroll frame (the dominant
  // scroll-jank source). Instead the rAF below lerps these values and writes
  // the derived styles straight to the DOM via the refs collected here, so
  // scrolling never re-renders the tree. Mirrors the pattern HeroSection uses.
  const headingReceRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const connectorRefs = useRef<(SVGLineElement | null)[]>([]);
  const discRefs = useRef<(SVGCircleElement | null)[]>([]);
  const photoRevealRefs = useRef<(SVGGElement | null)[]>([]);
  const labelRevealRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Two-state teal wash: `onDark` flips once when the user scrolls into the
  // heading and once on the way out. It is derived from scroll-coupled
  // enter/exit progress inside a rAF, but only committed to state when the
  // boolean itself changes — so scrolling through the section no longer
  // re-renders this (large) tree on every frame just to move the wash. The
  // visible fade stays smooth because the overlay opacity is CSS-transitioned
  // (duration-900), not interpolated in React.
  const [onDark, setOnDark] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mqDesktop = window.matchMedia("(min-width: 768px)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsDesktop(mqDesktop.matches);
    setReducedMotion(mqReduce.matches);
    const onDesktop = () => setIsDesktop(mqDesktop.matches);
    const onReduce = () => setReducedMotion(mqReduce.matches);
    mqDesktop.addEventListener("change", onDesktop);
    mqReduce.addEventListener("change", onReduce);
    return () => {
      mqDesktop.removeEventListener("change", onDesktop);
      mqReduce.removeEventListener("change", onReduce);
    };
  }, []);

  const pinned = isDesktop && !reducedMotion;

  // Single-threshold background-color flip. The section stays the page's
  // baseline mint until the user has scrolled completely past the heading
  // block (so the page above and the section's top match — no edge line).
  // Once `pastHeading` flips true, a single CSS transition smoothly fades
  // the section bg to a solid deep teal and all text inverts to white.
  // No scroll-driven interpolation, no gradient — just two clean states.
  useEffect(() => {
    if (reducedMotion) {
      setOnDark(false);
      return;
    }
    // `easeOutExpo` — matches the var(--ease-premium) used
    // elsewhere on the site. Fast take-off, long graceful settle.
    const easeOutExpo = (t: number): number =>
      t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

    let raf = 0;
    let lastDark = false;
    const apply = () => {
      const vh = window.innerHeight;
      let enterP = 0;
      let exitP = 0;
      const sectionEl = sectionRef.current;
      if (sectionEl) {
        // Scroll-coupled entrance keyed to the SECTION (not the heading,
        // which now pins inside the diagram stage). The teal wash completes
        // exactly as the section reaches the viewport top — so the title +
        // shape lock onto the dark stage together with no mid-screen edge.
        const top = sectionEl.getBoundingClientRect().top;
        const entryStart = vh * 0.35;
        const entryEnd = 0;
        const raw = Math.max(
          0,
          Math.min(1, (entryStart - top) / (entryStart - entryEnd))
        );
        enterP = easeOutExpo(raw);
      }
      const exitEl = exitRef.current;
      if (exitEl) {
        // Scroll-coupled exit with a built-in delay. The bg stays
        // teal a beat longer before the fade kicks in (fadeStart is
        // closer to the viewport top now) and the window is slightly
        // wider, so the wash recedes deliberately rather than dropping
        // the moment the buffer enters the viewport.
        const top = exitEl.getBoundingClientRect().top;
        const fadeStart = vh * 1.3;
        const fadeEnd = vh * -0.5;
        const raw = Math.max(
          0,
          Math.min(1, (fadeStart - top) / (fadeStart - fadeEnd))
        );
        exitP = easeOutExpo(raw);
      }
      // Same threshold as before — the wash is on once the entrance has
      // passed 55 % and the exit hasn't yet reached 50 %. Commit to state
      // only when the boolean flips (twice per traversal) rather than on
      // every frame.
      const dark = enterP > 0.55 && exitP < 0.5;
      if (dark !== lastDark) {
        lastDark = dark;
        setOnDark(dark);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  // ── Scroll-coupled reveal (framer-motion) ──────────────────────────────
  // Two `useScroll` reads on the sticky range replace the hand-rolled
  // getBoundingClientRect math, exactly:
  //   introRaw = entrance rise — offset ["start end","start start"] yields
  //              `1 − top/vh` clamped 0..1 (0 as the range enters from a
  //              viewport-height below, 1 once its top reaches the viewport top);
  //   pRaw     = pinned scrub — offset ["start start","end end"] yields
  //              `−top/(offsetHeight − vh)` clamped 0..1 across the tall range.
  const { scrollYProgress: introRaw } = useScroll({
    target: stickyRangeRef,
    offset: ["start end", "start start"],
  });
  const { scrollYProgress: pRaw } = useScroll({
    target: stickyRangeRef,
    offset: ["start start", "end end"],
  });
  const { scrollY } = useScroll();

  // Latched targets → springs. The springs replace the manual 0.14/frame LERP
  // with motion's inertial smoothing; `writeFrame` still paints each frame
  // straight to the DOM off the smoothed values, so the ~1,200-line SVG tree
  // never re-renders on scroll — same architecture as before, motion-driven.
  const introTarget = useMotionValue(0);
  const actTarget = useMotionValue(0);
  const pushTarget = useMotionValue(0);
  const introSmooth = useSpring(introTarget, REVEAL_SPRING);
  const actSmooth = useSpring(actTarget, REVEAL_SPRING);
  const pushSmooth = useSpring(pushTarget, REVEAL_SPRING);

  const stepFraction = 1 / (nodes.length + 1);
  // Static per-connector lengths for the stroke-dash draw. Node geometry is
  // baked, so this is constant for a given node set.
  const connectorLengths = useMemo(
    () =>
      nodes
        .slice(0, -1)
        .map((from, i) =>
          Math.hypot(nodes[i + 1].cx - from.cx, nodes[i + 1].cy - from.cy),
        ),
    [nodes],
  );

  // Paint one frame of the scroll-coupled reveal straight to the DOM. Every
  // expression mirrors exactly what the old rAF `writeFrame` computed — only
  // the driver (motion springs vs. the manual LERP) changed, so the visual
  // output is unchanged.
  const writeFrame = useCallback(
    (intro: number, act: number, push: number) => {
      const h = headingReceRef.current;
      if (h) {
        h.style.opacity = String(1 - push * 0.7);
        h.style.transform = `translateY(${push * 56}px) scale(${1 - push * 0.24})`;
      }
      const persp = perspectiveRef.current;
      if (persp) {
        persp.style.opacity = String(intro * (1 - push * 0.7));
        persp.style.transform = `translateY(${(1 - intro) * 24 + push * 56}px) scale(${1 - push * 0.24})`;
      }
      const pf = progressFillRef.current;
      if (pf) pf.style.height = `${act * 100}%`;

      const conns = connectorRefs.current;
      for (let i = 0; i < conns.length; i++) {
        const line = conns[i];
        if (!line) continue;
        const cp = phaseAt(act, i + 1, 0, 0.55, stepFraction);
        line.style.strokeDashoffset = String(
          (connectorLengths[i] ?? 0) * (1 - cp),
        );
      }

      for (let i = 0; i < nodes.length; i++) {
        // Photo/label reveal share one window; disc fill uses its own.
        const pp =
          i === 0
            ? phaseAt(act, i, 0, 0.6, stepFraction)
            : phaseAt(act, i, 0.6, 0.85, stepFraction);
        const disc = discRefs.current[i];
        if (disc) {
          const fillP =
            i === 0
              ? phaseAt(act, i, 0, 0.6, stepFraction)
              : phaseAt(act, i, 0.45, 0.6, stepFraction);
          disc.style.opacity = String(fillP * (1 - pp));
        }
        const pg = photoRevealRefs.current[i];
        if (pg) pg.style.opacity = String(pp);
        const lbl = labelRevealRefs.current[i];
        if (lbl) {
          lbl.style.opacity = String(pp);
          lbl.style.transform = `translate3d(0, ${(1 - pp) * 16}px, 0)`;
        }
      }
    },
    [nodes, stepFraction, connectorLengths],
  );

  // Raw scroll → latched targets. Mirrors the old `tick` target math:
  // activation completes over the first 70% of the scrub then holds; push
  // recedes over the last 28%; once fully revealed, scrolling back up holds
  // the molecule lit so nodes never reverse one-by-one on the way out.
  const recomputeTargets = useCallback(() => {
    if (!pinned) return;
    let intro = introRaw.get();
    const p = pRaw.get();
    let act = Math.min(1, p / 0.7);
    const push = Math.max(0, Math.min(1, (p - 0.72) / 0.28));
    if (act >= 0.999 && intro >= 0.999) revealedRef.current = true;
    if (revealedRef.current && scrollDirRef.current === "up") {
      intro = 1;
      act = 1;
    }
    introTarget.set(intro);
    actTarget.set(act);
    pushTarget.set(push);
  }, [pinned, introRaw, pRaw, introTarget, actTarget, pushTarget]);

  // Smoothed springs → paint + commit `step`. `step` is the only value still
  // in React state; it changes at most nodes.length+1 times per traversal.
  const paintFromSprings = useCallback(() => {
    if (!pinned) return;
    const act = actSmooth.get();
    writeFrame(introSmooth.get(), act, pushSmooth.get());
    const s = Math.min(nodes.length, Math.floor(act * (nodes.length + 1)));
    setStep((cur) => (cur === s ? cur : s));
  }, [pinned, actSmooth, introSmooth, pushSmooth, writeFrame, nodes.length]);

  // Track scroll direction (drives the hold-on-scroll-up latch). No height
  // changes anywhere, so there's never a programmatic scroll jump.
  useMotionValueEvent(scrollY, "change", (y) => {
    const last = lastScrollYRef.current;
    if (y < last - 0.5) scrollDirRef.current = "up";
    else if (y > last + 0.5) scrollDirRef.current = "down";
    lastScrollYRef.current = y;
  });

  // Raw scroll drives the targets; the smoothed springs drive the paint.
  useMotionValueEvent(introRaw, "change", recomputeTargets);
  useMotionValueEvent(pRaw, "change", recomputeTargets);
  useMotionValueEvent(introSmooth, "change", paintFromSprings);
  useMotionValueEvent(actSmooth, "change", paintFromSprings);
  useMotionValueEvent(pushSmooth, "change", paintFromSprings);

  // Prime on mount / when `pinned` flips: seed targets from the current scroll
  // position and jump the springs there (no animate-from-zero on load), then
  // paint once. Mobile / reduced-motion renders fully revealed from the static
  // JSX defaults — just settle `step` so structural gating matches.
  useEffect(() => {
    if (!pinned) {
      setStep(nodes.length);
      return;
    }
    lastScrollYRef.current = window.scrollY;
    recomputeTargets();
    introSmooth.jump(introTarget.get());
    actSmooth.jump(actTarget.get());
    pushSmooth.jump(pushTarget.get());
    paintFromSprings();
  }, [
    pinned,
    nodes.length,
    recomputeTargets,
    paintFromSprings,
    introSmooth,
    actSmooth,
    pushSmooth,
    introTarget,
    actTarget,
    pushTarget,
  ]);

  // Mouse-parallax is now spring-driven off `mouseX`/`mouseY` (see the
  // MotionValues above) — the pointer handlers just set the target, and the
  // springs + `useTransform` supply the smoothed rotateX/rotateY the diagram
  // reads. No rAF, no per-frame ref writes.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinned) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Two-state theme: mint (baseline) or deep cinematic teal (post-heading).
  // Snaps cleanly between 0 and 1 — no glassy mid-range. The overlay
  // crossfades via a CSS transition on opacity, so the visual change is
  // still smooth, but the bg is *always* either solid mint or solid
  // dark teal. The exit threshold is tuned so the teal lets go promptly
  // as the page begins to scroll past — no overstaying once the diagram
  // is no longer the focus. `onDark` controls text-colour inversion in
  // lockstep.
  const darkness = onDark ? 1 : 0;

  // ─────────────────────────────────────────────────────────────────
  //  Scroll-coupled per-node sequencing.
  //  Each step (1..6) "owns" a scroll range inside the activation phase.
  //  Within each step's range we run a strict sequence:
  //    0 → 50 %  draw the incoming connector
  //    55 → 80 % fade-in the destination node's photo + label
  //    80 → 100 % hold (everything settled)
  //  Because progress is tied to scroll position, the sequence is
  //  guaranteed to play in order regardless of scroll speed — the next
  //  step's connector can never start before the previous node is
  //  fully shown.
  //
  //  The per-node phase math now lives in the module-level `phaseAt`
  //  helper and is evaluated inside the rAF (`writeFrame`) against the
  //  lerped activation progress — it is no longer computed in render, so
  //  scrolling the reveal never re-renders this tree.
  // ─────────────────────────────────────────────────────────────────
  const txt = onDark ? "rgb(255, 255, 255)" : "rgb(0, 0, 54)";
  const txt60 = onDark
    ? "rgba(255, 255, 255, 0.6)"
    : "rgba(0, 0, 54, 0.6)";
  const txt70 = onDark
    ? "rgba(255, 255, 255, 0.7)"
    : "rgba(0, 0, 54, 0.7)";
  const txt75 = onDark
    ? "rgba(255, 255, 255, 0.9)"
    : "rgba(0, 0, 54, 0.9)";
  const colorEase =
    "color 900ms var(--ease-premium)";
  // Heading is navy on the light/mint baseline, then turns brand green once
  // the dark teal stage is active — eased with the same colour transition.
  const headingColor = onDark ? "#06FE83" : "#000036";

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      data-hide-nav
      className="bg-error-25 relative isolate"
    >
      {/* Sticky cinematic-tone overlay — pins to the viewport top while
          the section is in view. Fades in via CSS once the user enters
          the heading. Fades out smoothly via scroll-coupled `exitP` so
          the user has continuous scroll time to feel the return to mint;
          no abrupt flip. Section bg always remains mint so there's never
          a visible "edge" between the section and the page above or below. */}
      {/* Bounded to stop 20vh short of the section bottom (desktop) so this
          sticky teal stage un-pins together with the diagram, leaving the
          exit buffer as a clean mint gap. Spanning the full section made the
          teal stay pinned with no gap, so the next (Why BPI) section visibly
          slid up over it. */}
      <div className="absolute inset-x-0 top-0 bottom-0 md:bottom-[20vh] z-0 pointer-events-none">
        <div
          className="sticky top-0 h-screen w-full overflow-hidden transition-opacity duration-900 ease-[var(--ease-premium)]"
          style={{
            backgroundColor: "#042D2B",
            opacity: darkness,
          }}
          aria-hidden
        >
          {/* Slow ambient atmospheric pulse — a faint radial wash that
              breathes very slowly so the dark stage never feels static.
              Animates the separate `opacity` via the `care-atmosphere`
              keyframes (~8s cycle). Only visually present while the
              teal layer is dominant (parent darkness > 0). */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 70%)",
              animation: "care-atmosphere 8s ease-in-out infinite",
            }}
            aria-hidden
          />
        </div>
      </div>
      {/* Mobile heading — desktop renders its heading pinned inside the
          diagram stage (see below) so the title stays put with the shape. */}
      <div
        ref={headingRef}
        className="md:hidden relative z-10 px-12 pt-16 pb-4"
      >
        <div className="mx-auto max-w-page">
          <div className="max-w-3xl">
            <h2
              className="font-display text-display-xs md:text-display-sm font-bold leading-[1.05] tracking-[-0.02em]"
              style={{ color: headingColor, transition: colorEase }}
            >
              {heading}
            </h2>
            <p
              className="mt-3 text-sm md:text-base leading-relaxed max-w-xl"
              style={{ color: txt70, transition: colorEase }}
            >
              {body}
            </p>
            {ctaLabel ? (
              <CtaLink
                href={ctaHref}
                className="mt-5 inline-flex rounded-round border border-current px-5 py-2 text-sm font-semibold transition hover:opacity-80"
                style={{ color: txt, transition: colorEase }}
              >
                {ctaLabel}
              </CtaLink>
            ) : null}
          </div>
        </div>
      </div>

      {/* Desktop sticky range — diagram only. Tall enough to give scroll room
          for the shape-only intro state plus six progressive reveals plus a
          final hold so node 6 is visible long enough before unsticking. */}
      <div
        ref={stickyRangeRef}
        className="hidden md:block relative z-10"
        style={pinned ? { height: `${TALL_VH}vh` } : undefined}
      >
        <div
          className={
            pinned
              ? "sticky top-0 h-screen overflow-hidden flex flex-col px-6 md:px-20 lg:px-32 pt-12 lg:pt-16 pb-4 lg:pb-8"
              : "relative flex flex-col px-6 md:px-20 lg:px-32 pt-12 lg:pt-16 pb-14 md:pb-20 lg:pb-28"
          }
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Heading — pinned with the diagram so the title stays put
              (top-left) on the teal stage while the molecule reveals. It
              recedes (scales back + dims + drifts) on `pushP` in lockstep
              with the diagram, so the whole stage pushes to the back as the
              next section slides over the top. */}
          <div
            ref={headingReceRef}
            className="relative z-10 mx-auto w-full max-w-page shrink-0"
            // Initial = push 0 (opacity 1, no offset). The rAF writes
            // `opacity`/`transform` directly as the stage recedes; these
            // constants only seed the first paint and never change across
            // re-renders, so React never clobbers the rAF's writes.
            style={{
              opacity: 1,
              transform: "translateY(0px) scale(1)",
              transformOrigin: "left top",
              willChange: "opacity, transform",
            }}
          >
            <div className="max-w-3xl">
              <h2
                className="font-display text-display-xs md:text-display-sm lg:text-display-md font-bold leading-[1.05] tracking-[-0.02em]"
                style={{ color: headingColor, transition: colorEase }}
              >
                {heading}
              </h2>
              <p
                className="mt-3 text-sm md:text-base leading-relaxed max-w-xl"
                style={{ color: txt70, transition: colorEase }}
              >
                {body}
              </p>
              {ctaLabel ? (
                <CtaLink
                  href={ctaHref}
                  className="mt-5 lg:mt-6 inline-flex rounded-round border border-current px-5 py-2 text-sm font-semibold transition hover:opacity-80"
                  style={{ color: txt, transition: colorEase }}
                >
                  {ctaLabel}
                </CtaLink>
              ) : null}
            </div>
          </div>

          {/* Perspective wrapper — gives the diagram a discreet "looking
              down at it" tilt. Also driven by introP for the entry rise +
              fade so the molecule arrives gracefully as the user scrolls
              toward it. Disabled for prefers-reduced-motion via `pinned`. */}
          <div
            ref={perspectiveRef}
            className="relative w-full mx-auto mt-2 lg:mt-4"
            style={{
              perspective: "1600px",
              maxWidth: "110vh",
              // `introP` fades/raises the molecule in on entry; `pushP`
              // scales it down and dims it on exit so it recedes deep into
              // the dark stage as the next section slides over the top.
              // Seeded to the initial scroll state (hidden when pinned, since
              // the section enters from below; fully shown otherwise). The rAF
              // then owns `opacity`/`transform`; these constants depend only on
              // the stable `pinned` flag so React never clobbers those writes.
              opacity: pinned ? 0 : 1,
              transform: pinned
                ? "translateY(24px) scale(1)"
                : "translateY(0px) scale(1)",
              transformOrigin: "center 45%",
              willChange: "opacity, transform",
            }}
          >
            <motion.div
              className="relative w-full aspect-3/2"
              style={{
                // Static 2° forward tilt + mouse parallax, supplied by the
                // spring-smoothed `diagramRotateX`/`diagramRotateY` MotionValues
                // (rotateX rests at 2° when the pointer is centred). Motion
                // writes these to `transform` off its own rAF; no re-render.
                ...(pinned
                  ? { rotateX: diagramRotateX, rotateY: diagramRotateY }
                  : {}),
                transformOrigin: "center 60%",
                transformStyle: "preserve-3d",
                willChange: pinned ? "transform" : undefined,
                // Idle breathing animates the separate `scale` property (not
                // `transform`), so it coexists with the rotation. Triggers
                // only when all six nodes are revealed. Slowed to 8 s for
                // an almost-imperceptible "alive" feel — purely atmospheric.
                animation:
                  pinned && step >= nodes.length
                    ? "care-breathe 8s ease-in-out infinite"
                    : "none",
              }}
            >
            {/* Base molecule — uses LogoShape's native left-to-right brand
                gradient (#00CC67 → #F9FDFF). Right side fades to near-white,
                conveying "yet to come." As nodes activate, the bright
                connector strokes fill in the faded side. */}
            <LogoShape noStroke className="absolute inset-0 w-full h-full" />

            {/* Bright connector layer. Per-connector gradient strokes,
                clipped to the molecule path, draw in via stroke-dashoffset
                animation as each node activates. The drop-shadow uses the
                brand mint so the lit portions cast a subtle ambient glow
                onto the dark teal stage — adds cinematic depth without
                outlining the right-side faded base. Darkness gate keeps
                the glow proportional to how immersed the stage is. */}
            <svg
              viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden
            >
              <defs>
                {/* Mask used to limit the bright connector strokes to the
                    molecule shape AND additionally exclude specific nodes
                    (workforce, regulatory-policy) so those node interiors
                    keep the sleek dim-gradient appearance from the base
                    LogoShape — no bright stroke-cap "disc" gets painted
                    over them as the connectors light up. */}
                {/* Connector mask — keeps the bright strokes inside
                    the molecule shape AND excludes every node circle,
                    so the connectors stop at each node's edge instead
                    of painting across the photo area behind the
                    porthole. This is what eliminates the residual
                    green halo around each photo. */}
                <mask id="care-mol-mask">
                  <path d={LOGO_SHAPE_PATH_D} fill="white" />
                  {nodes.map((n) => (
                    <circle
                      key={`mask-${n.id}`}
                      cx={n.cx}
                      cy={n.cy}
                      r={n.r}
                      fill="black"
                    />
                  ))}
                </mask>
              </defs>

              {/* Connectors — masked to the molecule body minus the
                  node circles, so the bright stroke never paints
                  inside a node's photo area. */}
              <g mask="url(#care-mol-mask)">
                {nodes.slice(0, -1).map((from, i) => {
                  const to = nodes[i + 1];
                  const length = Math.hypot(to.cx - from.cx, to.cy - from.cy);
                  return (
                    <line
                      key={`conn-${i}`}
                      ref={(el) => {
                        connectorRefs.current[i] = el;
                      }}
                      x1={from.cx}
                      y1={from.cy}
                      x2={to.cx}
                      y2={to.cy}
                      stroke="#38fe9c"
                      strokeWidth={92}
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={length}
                      // Initial draw state (undrawn when pinned, fully drawn
                      // otherwise). The rAF writes `strokeDashoffset` per frame
                      // — no CSS transition, since the value is already
                      // frame-perfect off the lerped scroll progress.
                      style={{ strokeDashoffset: pinned ? length : 0 }}
                    />
                  );
                })}
              </g>

              {/* Node disc fills — outside the connector mask so they
                  paint freely at their own positions. Shrunk to r-2
                  so the photo's clip covers them with a margin, and
                  faded out as the photo arrives. */}
              <g>
                {nodes.map((n, i) => {
                  if (n.id === "workforce") return null;
                  return (
                    <circle
                      key={`fill-${n.id}`}
                      ref={(el) => {
                        discRefs.current[i] = el;
                      }}
                      cx={n.cx}
                      cy={n.cy}
                      r={n.r - 2}
                      fill="#38fe9c"
                      // Disc fades in on activation then out as the photo
                      // arrives; at both endpoints (hidden or fully revealed)
                      // its opacity is 0, so 0 seeds the first paint. The rAF
                      // writes the mid-reveal opacity per frame.
                      style={{ opacity: 0 }}
                    />
                  );
                })}
              </g>

            </svg>

            <svg
              viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: "none" }}
            >
              <defs>
                {nodes.map((n) => (
                  <clipPath
                    key={n.id}
                    id={`care-clip-${n.id}`}
                    clipPathUnits="userSpaceOnUse"
                  >
                    <circle cx={n.cx} cy={n.cy} r={n.r} />
                  </clipPath>
                ))}
                {/* Light directional vignette — origin offset to the
                    upper-left so the bottom-right rim is just slightly
                    darker than the centre. Reads as a soft curve, not
                    a heavy darkening. */}
                <radialGradient
                  id="care-photo-vignette"
                  cx="35%"
                  cy="30%"
                  r="75%"
                >
                  <stop offset="55%" stopColor="rgba(0, 0, 54, 0)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 54, 0.2)" />
                </radialGradient>
              </defs>
              {nodes.map((n, i) => {
                const activated = step >= i + 1;
                const isHovered = hoveredIndex === i && activated;
                const href = n.href ?? `/sectors/${n.id}`;
                const onClickNode = (e: React.MouseEvent) => {
                  e.preventDefault();
                  if (!activated) return;
                  // "Dive through the porthole" — zoom the node's live media to
                  // full-screen, then dissolve into the sector page. Compute the
                  // node's on-screen circle so the zoom starts exactly on it.
                  const diagram = sectionRef.current?.querySelector<HTMLElement>(
                    "div.aspect-3\\/2",
                  );
                  if (viewTransition && diagram) {
                    const rect = diagram.getBoundingClientRect();
                    viewTransition.zoomReveal({
                      href,
                      centerX: rect.left + (n.cx / VIEWBOX_W) * rect.width,
                      centerY: rect.top + (n.cy / VIEWBOX_H) * rect.height,
                      diameter: (n.r / VIEWBOX_W) * rect.width * 2,
                      videoSrc: n.videoSrc,
                      imageSrc: n.imageSrc,
                    });
                  } else if (viewTransition) {
                    viewTransition.navigate(href, {
                      x: e.clientX,
                      y: e.clientY,
                    });
                  } else {
                    router.push(href);
                  }
                };
                // Cinematic focus pull — when any node is hovered, the
                // others desaturate and dim slightly so the eye is
                // drawn into the active porthole. No hard ring, no
                // jumpy scale; just a quiet shift of attention.
                const dimSiblings =
                  hoveredIndex !== null && hoveredIndex !== i && activated;
                return (
                  // Outer wrapper: the scroll-coupled REVEAL opacity (`pp`),
                  // written every frame by the rAF. Split from the inner
                  // dim/hover opacity so the two multiply — identical math to
                  // the old single `pp * (dimSiblings ? 0.7 : 1)` — while the
                  // reveal stays out of React entirely. Opacity-only ancestor
                  // (never a transform) so the descendant clipPath is safe.
                  <g
                    key={n.id}
                    ref={(el) => {
                      photoRevealRefs.current[i] = el;
                    }}
                    style={{
                      opacity: pinned ? 0 : 1,
                      willChange: "opacity",
                    }}
                  >
                  <g
                    data-cursor="icon"
                    onMouseEnter={() =>
                      activated && setHoveredIndex(i)
                    }
                    onMouseLeave={() =>
                      setHoveredIndex((cur) => (cur === i ? null : cur))
                    }
                    onClick={onClickNode}
                    style={{
                      // Only the hover dim lives here now (the reveal moved to
                      // the outer wrapper). Its 320ms opacity / 700ms filter
                      // transitions still smooth the focus-pull on hover.
                      opacity: dimSiblings ? 0.7 : 1,
                      cursor: activated ? "none" : "default",
                      pointerEvents: activated ? "auto" : "none",
                      filter: dimSiblings
                        ? "saturate(0.35) brightness(0.85)"
                        : "saturate(1) brightness(1)",
                      transition:
                        "opacity 320ms var(--ease-premium), filter 700ms var(--ease-premium)",
                      willChange: "opacity",
                    }}
                  >
                    {/* Clip is applied to this <g> (not the image)
                        so the image's hover-zoom transform stays
                        contained inside the porthole — the clip
                        circle never grows with the image scale. */}
                    <g clipPath={`url(#care-clip-${n.id})`}>
                      {n.videoSrc ? (
                        <foreignObject
                          x={n.cx - n.r}
                          y={n.cy - n.r}
                          width={n.r * 2}
                          height={n.r * 2}
                          clipPath={`url(#care-clip-${n.id})`}
                          style={
                            isHovered
                              ? {
                                  transformBox: "fill-box",
                                  transformOrigin: "center",
                                  animation:
                                    "care-node-drift 5s ease-in-out infinite",
                                }
                              : undefined
                          }
                        >
                          <video
                            src={n.videoSrc}
                            poster={n.imageSrc}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            disableRemotePlayback
                            disablePictureInPicture
                            aria-label={n.imageAlt}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                              // Safari iOS often paints `<video>` into a
                              // native compositing layer that escapes the
                              // surrounding SVG `<clipPath>`. Setting a 50%
                              // border-radius on the square video element
                              // itself makes it visually circular,
                              // independent of the SVG clip.
                              borderRadius: "50%",
                            }}
                          />
                        </foreignObject>
                      ) : (
                        <image
                          href={n.imageSrc}
                          xlinkHref={n.imageSrc}
                          x={n.cx - n.r}
                          y={n.cy - n.r}
                          width={n.r * 2}
                          height={n.r * 2}
                          preserveAspectRatio="xMidYMid slice"
                          clipPath={`url(#care-clip-${n.id})`}
                          style={
                            isHovered
                              ? {
                                  transformBox: "fill-box",
                                  transformOrigin: "center",
                                  animation:
                                    "care-node-drift 5s ease-in-out infinite",
                                }
                              : undefined
                          }
                        />
                      )}
                    </g>
                    {/* Light directional vignette — gives a hint of
                        curvature without darkening the photo. */}
                    <circle
                      cx={n.cx}
                      cy={n.cy}
                      r={n.r}
                      fill="url(#care-photo-vignette)"
                      pointerEvents="none"
                    />
                    {/* Activation shine sweep — a soft white diagonal
                        gleam that crosses the photo once after the
                        photo has finished its fade-in. Renders only
                        when the node is activated; the SVG <animate>
                        fires on mount so each activation gets its
                        own sweep. Clip-path keeps the sweep inside
                        the circular photo. Skewed for a diagonal feel. */}
                    {activated && pinned && (
                      <g clipPath={`url(#care-clip-${n.id})`}>
                        <rect
                          y={n.cy - n.r}
                          width={n.r * 0.5}
                          height={n.r * 2}
                          fill="white"
                          opacity="0.28"
                          transform={`rotate(-18 ${n.cx} ${n.cy})`}
                        >
                          <animate
                            attributeName="x"
                            from={n.cx - n.r * 2.5}
                            to={n.cx + n.r * 2}
                            dur="1.5s"
                            begin={i === 0 ? "1.3s" : "3.5s"}
                            fill="freeze"
                          />
                        </rect>
                      </g>
                    )}
                    {/* Invisible hit-zone — sits on top of all the
                        node visuals so hover/click registers on the
                        full circular area, not just the rastered
                        portion of the image. */}
                    <circle
                      cx={n.cx}
                      cy={n.cy}
                      r={n.r}
                      fill="transparent"
                      pointerEvents={activated ? "all" : "none"}
                    />
                  </g>
                  </g>
                );
              })}
            </svg>

            {nodes.map((n, i) => {
              // Once everything is revealed (final hold), every label
              // settles at full opacity. Otherwise the dim-others rule
              // still applies based on which step the user is in.
              const allRevealed = step >= nodes.length;
              const dimMultiplier = allRevealed
                ? 1
                : step > i + 1
                  ? 0.85
                  : 1; // previously-revealed labels softly dim to 85%
              return (
              // Outer: the scroll-coupled REVEAL (opacity `lp` + translate),
              // written per frame by the rAF. Inner: the step-driven dim,
              // which stays in React and keeps its 700ms crossfade. The two
              // opacities multiply — identical to the old `lp * dimMultiplier`.
              <div
                key={`label-${n.id}`}
                ref={(el) => {
                  labelRevealRefs.current[i] = el;
                }}
                className="absolute w-[18%] max-w-72"
                style={{
                  left: `${n.labelLeftPct}%`,
                  top: `${n.labelTopPct}%`,
                  opacity: pinned ? 0 : 1,
                  transform: pinned
                    ? "translate3d(0, 16px, 0)"
                    : "translate3d(0, 0, 0)",
                  willChange: "opacity, transform",
                }}
              >
                <div
                  style={{
                    opacity: dimMultiplier,
                    transition: "opacity 700ms var(--ease-premium)",
                  }}
                >
                  <h3
                    className="font-display text-sm lg:text-base font-bold leading-tight tracking-[-0.01em]"
                    style={{ color: txt, transition: colorEase }}
                  >
                    {parseInt(n.num, 10)}. {n.title}
                  </h3>
                  <p
                    className="mt-2 text-xs lg:text-sm leading-[1.4]"
                    style={{ color: txt75, transition: colorEase }}
                  >
                    {n.description}
                  </p>
                </div>
              </div>
              );
            })}

            </motion.div>
          </div>

          {/* Scroll-progress indicator — vertical track on the right that
              fills top→bottom like a progress bar as the reveal sequence
              advances through the nodes. */}
          {pinned ? (
            <div
              className="pointer-events-none absolute right-5 lg:right-10 top-1/2 -translate-y-1/2 h-[52vh] w-[3px] rounded-full bg-white/15"
              aria-hidden
            >
              <div
                ref={progressFillRef}
                className="absolute left-0 top-0 w-full rounded-full bg-error-500"
                // rAF writes `height` per frame off the lerped activation
                // progress — frame-perfect, so no CSS height transition.
                style={{ height: "0%" }}
              />
            </div>
          ) : null}

        </div>
      </div>

      {/* Node clicks navigate via the native View Transitions crossfade
          (ViewTransitionProvider in app/[lang]/(site)/layout.tsx) — the page
          dissolves straight into the sector page, no overlay. See onClickNode. */}

      {/* Exit buffer — small visual margin below the sticky range. The
          scroll-coupled `exitP` calculation uses this buffer's position
          as the trigger point so the overlay fades out smoothly over the
          last ~1.4 vh of scroll inside the section, returning to mint
          before the page handoff. Kept short to minimise dead space
          between this section and the next. */}
      <div
        ref={exitRef}
        className="hidden md:block relative z-10 h-[20vh] pointer-events-none"
        aria-hidden
      />

      {/* Mobile fallback — stacked list. */}
      <div className="md:hidden relative z-10 px-6 pb-14 flex flex-col gap-7">
        {nodes.map((n) => (
          <div key={n.id} className="flex gap-5 items-start">
            <div className="relative shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-error-700/60">
              {n.videoSrc ? (
                <video
                  src={n.videoSrc}
                  poster={n.imageSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  disableRemotePlayback
                  disablePictureInPicture
                  aria-label={n.imageAlt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <clipPath id={`mclip-${n.id}`}>
                      <circle cx="50" cy="50" r="50" />
                    </clipPath>
                  </defs>
                  <image
                    href={n.imageSrc}
                    width="100"
                    height="100"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#mclip-${n.id})`}
                  />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h3
                className="font-display text-lg font-bold leading-tight tracking-[-0.01em]"
                style={{ color: txt, transition: colorEase }}
              >
                {parseInt(n.num, 10)}. {n.title}
              </h3>
              <p
                className="mt-2 text-base leading-normal"
                style={{ color: txt75, transition: colorEase }}
              >
                {n.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
