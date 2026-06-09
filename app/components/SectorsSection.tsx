"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CtaLink from "./CtaLink";
import { useLenis } from "./LenisProvider";
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

export default function SectorsSection({
  heading = "Shifting Trade Prowess in Favour of the Global South",
  body = "BPI is building across six sectors, each one a structural component of the Caribbean's pharmaceutical future.",
  ctaLabel = "Explore our work",
  ctaHref = "/initiatives",
  nodes = [],
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const stickyRangeRef = useRef<HTMLDivElement>(null);
  // Refs targeted by the unified scroll/parallax RAF so we can write
  // styles directly without triggering React re-renders.
  const perspectiveRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const { sync } = useLenis();
  // Asymmetric scroll length, the buttery way — no programmatic scroll.
  // Going DOWN the section is tall so the six nodes reveal one-by-one over
  // a long pinned scrub. Once revealed AND scrolled fully past, the tall
  // scroll range COLLAPSES to a short sticky section (like Initiatives):
  // scrolling back up the Why-BPI slide-over reveals the diagram, it
  // sticks for a beat, then a normal short scroll carries you to the
  // section above — all natural momentum, nothing forced. When you go back
  // above it, the tall range is restored so the next downward pass reveals
  // from scratch. Height changes happen only while the section is fully
  // off-screen, with the scroll position compensated in a layout effect so
  // there's no visible jump.
  const revealedRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const scrollDirRef = useRef<"up" | "down">("down");
  const [collapsed, setCollapsed] = useState(false);
  const collapsedRef = useRef(false);
  // Collapsed height. The Why-BPI slide-over overlaps the bottom 120vh of
  // this section, so the collapsed pinned range must outlast that overlap:
  // ~120vh for Why-BPI to slide off + a short ~40vh hold of the FULL
  // diagram, then the section unpins promptly toward "how we work". The
  // trailing static-hold scroll = (COLLAPSED_VH - 220)vh, so keep this just
  // above 220 for a brief hold rather than a long dead scrub.
  const COLLAPSED_VH = 260;
  const TALL_VH = (nodes.length + 1) * 100;
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [portalIndex, setPortalIndex] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [introP, setIntroP] = useState(0);
  const [activationP, setActivationP] = useState(0);
  // Recede ("push to back") progress for the slide-over: 0 = molecule at
  // full size on its stage, 1 = scaled down + dimmed into the dark stage
  // as the next section covers it.
  const [pushP, setPushP] = useState(0);
  const [enterP, setEnterP] = useState(0);
  const [exitP, setExitP] = useState(0);
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

  // Compensate scroll when the tall range collapses. The collapse only
  // ever fires while the section is fully ABOVE the viewport (the user has
  // scrolled past it), so shrinking it pulls everything below — including
  // what the user is looking at — up by the height delta. We subtract that
  // delta from the scroll position in a layout effect (before paint) so
  // the view never moves. Restoring fires while the section is fully BELOW
  // the viewport, so growth happens off-screen below the user and needs no
  // compensation — just a Lenis resize so its scroll limits stay correct.
  const prevCollapsedRef = useRef(false);
  useLayoutEffect(() => {
    if (!pinned) {
      prevCollapsedRef.current = collapsed;
      return;
    }
    if (prevCollapsedRef.current === collapsed) return; // not a real toggle
    const wasCollapsed = prevCollapsedRef.current;
    prevCollapsedRef.current = collapsed;
    if (collapsed && !wasCollapsed) {
      // Section shrank above the viewport → pull the view up by the delta.
      const deltaPx = ((TALL_VH - COLLAPSED_VH) / 100) * window.innerHeight;
      window.scrollTo(0, Math.max(0, window.scrollY - deltaPx));
    }
    // Re-align Lenis with the new scroll position / document height.
    sync();
  }, [collapsed, pinned, TALL_VH, sync]);

  // Single-threshold background-color flip. The section stays the page's
  // baseline mint until the user has scrolled completely past the heading
  // block (so the page above and the section's top match — no edge line).
  // Once `pastHeading` flips true, a single CSS transition smoothly fades
  // the section bg to a solid deep teal and all text inverts to white.
  // No scroll-driven interpolation, no gradient — just two clean states.
  useEffect(() => {
    if (reducedMotion) {
      setEnterP(0);
      setExitP(0);
      return;
    }
    // `easeOutExpo` — matches the var(--ease-premium) used
    // elsewhere on the site. Fast take-off, long graceful settle.
    const easeOutExpo = (t: number): number =>
      t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

    let raf = 0;
    const apply = () => {
      const vh = window.innerHeight;
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
        setEnterP(easeOutExpo(raw));
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
        setExitP(easeOutExpo(raw));
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

  useEffect(() => {
    if (!pinned) {
      setStep(nodes.length);
      setIntroP(1);
      setActivationP(1);
      setPushP(0);
      return;
    }
    // Scroll position is read into `target.*`; a continuous RAF then
    // lerps `displayed.*` toward those targets so motion never snaps
    // with raw scroll events. The result reads as a Lenis-style
    // inertial smoothing layer specifically for the sector animation
    // — fast scrolls smooth into ~8 frames of motion, slow scrolls
    // never stutter on individual scroll events.
    let raf = 0;
    let settledFor = 0;
    let inView = false;
    let isHidden = typeof document !== "undefined" && document.hidden;
    const target = { introP: 0, activationP: 0, pushP: 0 };
    const displayed = { introP: 0, activationP: 0, pushP: 0 };
    // Last setState'd values — we only call setState when the displayed
    // value crosses a perceptual threshold, so re-renders happen ~5-10x
    // per scroll traversal instead of 60Hz.
    let lastSetIntro = -Infinity;
    let lastSetAct = -Infinity;
    let lastSetPush = -Infinity;
    let lastSetStep = -1;

    const readTargets = () => {
      const el = stickyRangeRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      target.introP = Math.max(0, Math.min(1, 1 - rect.top / vh));
      const total = el.offsetHeight - vh;
      const p = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
      // Reveal completes within the first ~70 % of the pinned travel, so
      // the last node is fully shown and the diagram then HOLDS — pinned
      // and stationary, fully lit — for the remaining ~30 %. That stuck
      // hold is the beat the user reads as "the section stays put"; only
      // after it does the section release and the next section slide up
      // over it. (Pacing 1:1 with `p` finished the reveal exactly at the
      // un-pin point, leaving no hold, so node 6 looked cut off.)
      target.activationP = Math.min(1, p / 0.7);
      // Recede over the last ~28 % of the pinned travel — beginning just
      // after the reveal completes (~p 0.72) so the molecule + heading ease
      // back gradually as the next section slides up and covers them,
      // rather than snapping back over a short window.
      target.pushP = Math.max(0, Math.min(1, (p - 0.72) / 0.28));
    };

    const LERP = 0.14; // premium smoothing — high enough to feel
                       // responsive, low enough that fast scrolls
                       // float into place instead of slamming.
    const SETTLE_EPSILON = 0.0006;
    // Re-render only when the lerped value has moved by ~0.5% of full
    // travel since the last commit. Keeps the visible motion buttery
    // (the rAF still runs every frame) without recomputing the 1141-
    // line tree on every tick.
    const RENDER_EPSILON = 0.005;

    const tick = () => {
      readTargets();

      // Mark the section as fully revealed once the reveal completes.
      if (target.activationP >= 0.999 && target.introP >= 0.999) {
        revealedRef.current = true;
      }
      // Hold the diagram fully lit when the section is collapsed (it's
      // "done"), or when scrolling up after a reveal but before collapse —
      // so the nodes never reverse one-by-one on the way back up.
      if (
        collapsedRef.current ||
        (revealedRef.current && scrollDirRef.current === "up")
      ) {
        target.introP = 1;
        target.activationP = 1;
      }

      const nextIntro =
        displayed.introP + (target.introP - displayed.introP) * LERP;
      const nextAct =
        displayed.activationP + (target.activationP - displayed.activationP) * LERP;
      const nextPush =
        displayed.pushP + (target.pushP - displayed.pushP) * LERP;
      const settled =
        Math.abs(target.introP - nextIntro) < SETTLE_EPSILON &&
        Math.abs(target.activationP - nextAct) < SETTLE_EPSILON &&
        Math.abs(target.pushP - nextPush) < SETTLE_EPSILON;

      displayed.introP = nextIntro;
      displayed.activationP = nextAct;
      displayed.pushP = nextPush;

      // Coalesced re-renders. Always commit on settle so the final
      // frame lands exactly on target.
      if (settled || Math.abs(nextIntro - lastSetIntro) > RENDER_EPSILON) {
        setIntroP(nextIntro);
        lastSetIntro = nextIntro;
      }
      if (settled || Math.abs(nextAct - lastSetAct) > RENDER_EPSILON) {
        setActivationP(nextAct);
        lastSetAct = nextAct;
      }
      if (settled || Math.abs(nextPush - lastSetPush) > RENDER_EPSILON) {
        setPushP(nextPush);
        lastSetPush = nextPush;
      }
      const nextStep = Math.min(
        nodes.length,
        Math.floor(nextAct * (nodes.length + 1)),
      );
      if (nextStep !== lastSetStep) {
        setStep(nextStep);
        lastSetStep = nextStep;
      }

      // Keep the RAF alive briefly past settle so the next scroll
      // event picks up smoothly without spin-up latency.
      if (settled) {
        settledFor += 1;
        if (settledFor > 10) {
          raf = 0;
          return;
        }
      } else {
        settledFor = 0;
      }
      raf = requestAnimationFrame(tick);
    };

    const ensureRunning = () => {
      if (!raf && inView && !isHidden) {
        settledFor = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    // IntersectionObserver gates the rAF — when the section is fully
    // off-screen, scripting cost drops to zero. Section root has its
    // own ref already.
    const observed = sectionRef.current;
    const io = observed
      ? new IntersectionObserver(
          ([entry]) => {
            inView = !!entry?.isIntersecting;
            if (inView) {
              ensureRunning();
            } else if (raf) {
              cancelAnimationFrame(raf);
              raf = 0;
            }
          },
          { rootMargin: "20% 0px" },
        )
      : null;
    if (io && observed) io.observe(observed);

    // Visibility pause — also bail when the tab is hidden.
    const onVisibility = () => {
      isHidden = document.hidden;
      if (isHidden && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        ensureRunning();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Prime the loop and snap to initial scroll position so we don't
    // animate from zero on first paint.
    readTargets();
    displayed.introP = target.introP;
    displayed.activationP = target.activationP;
    displayed.pushP = target.pushP;
    setIntroP(target.introP);
    setActivationP(target.activationP);
    setPushP(target.pushP);
    lastSetIntro = target.introP;
    lastSetAct = target.activationP;
    lastSetPush = target.pushP;
    const initialStep = Math.min(
      nodes.length,
      Math.floor(target.activationP * (nodes.length + 1)),
    );
    setStep(initialStep);
    lastSetStep = initialStep;
    // Decide whether to kick off the rAF immediately (section visible)
    // or wait for the IO callback.
    if (observed) {
      const rect = observed.getBoundingClientRect();
      inView = rect.bottom > 0 && rect.top < window.innerHeight;
    }
    if (inView && !isHidden) raf = requestAnimationFrame(tick);

    // ── Collapse / restore the tall scroll range ────────────────────
    // Always-on so it reacts to natural scrolling (no programmatic scroll).
    //   • COLLAPSE once the reveal is done AND the section is fully above
    //     the viewport (scrolled past): the tall range shrinks to a short
    //     sticky section, so scrolling back up is a brief Initiatives-style
    //     stick rather than a 700vh scrub. Compensated in the layout effect.
    //   • RESTORE once the section is fully below the viewport (scrolled
    //     back above it): the tall range returns so the next downward pass
    //     reveals node-by-node from scratch.
    lastScrollYRef.current = window.scrollY;
    const onRangeScroll = () => {
      const yy = window.scrollY;
      if (yy < lastScrollYRef.current - 0.5) scrollDirRef.current = "up";
      else if (yy > lastScrollYRef.current + 0.5) scrollDirRef.current = "down";
      lastScrollYRef.current = yy;

      const rangeEl = stickyRangeRef.current;
      if (!rangeEl) return;
      const rect = rangeEl.getBoundingClientRect();
      const vh = window.innerHeight;

      if (
        !collapsedRef.current &&
        revealedRef.current &&
        rect.bottom <= 0
      ) {
        // Fully scrolled past, below the section → collapse.
        collapsedRef.current = true;
        setCollapsed(true);
      } else if (collapsedRef.current && rect.top >= vh) {
        // Scrolled back above the section → restore tall + re-arm reveal.
        collapsedRef.current = false;
        revealedRef.current = false;
        setCollapsed(false);
      }
    };

    window.addEventListener("scroll", ensureRunning, { passive: true });
    window.addEventListener("scroll", onRangeScroll, { passive: true });
    window.addEventListener("resize", ensureRunning, { passive: true });
    return () => {
      window.removeEventListener("scroll", ensureRunning);
      window.removeEventListener("scroll", onRangeScroll);
      window.removeEventListener("resize", ensureRunning);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [nodes.length, pinned]);

  // Smooth mouse-parallax loop — writes directly to the diagram's
  // transform via ref. Lerping happens in a ref (no React state) so
  // mouse movement does not trigger re-renders of the whole tree;
  // scroll stays smooth even while the cursor moves across the diagram.
  // The static 2° forward tilt is baked into the formula here.
  useEffect(() => {
    if (!pinned) return;
    let raf = 0;
    let settledFor = 0;
    const tick = () => {
      const t = mouseTargetRef.current;
      const m = mouseRef.current;
      const lerp = 0.055;
      const nx = m.x + (t.x - m.x) * lerp;
      const ny = m.y + (t.y - m.y) * lerp;
      const settled =
        Math.abs(nx - m.x) < 0.0005 && Math.abs(ny - m.y) < 0.0005;
      m.x = nx;
      m.y = ny;
      const el = diagramRef.current;
      if (el) {
        const rx = 2 - ny * 1.8;
        const ry = nx * 2.2;
        el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      // Keep the RAF alive briefly even after settling so a small new
      // mouse movement always picks up smoothly.
      if (settled) {
        settledFor += 1;
        if (settledFor > 8) {
          raf = 0;
          return;
        }
      } else {
        settledFor = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    const ensureRunning = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    // Restart the RAF on movement events.
    const el = sectionRef.current;
    el?.addEventListener("mousemove", ensureRunning, { passive: true });
    el?.addEventListener("mouseleave", ensureRunning, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      el?.removeEventListener("mousemove", ensureRunning);
      el?.removeEventListener("mouseleave", ensureRunning);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pinned]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinned) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseTargetRef.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
  };

  const handleMouseLeave = () => {
    mouseTargetRef.current = { x: 0, y: 0 };
  };

  // Two-state theme: mint (baseline) or deep cinematic teal (post-heading).
  // Snaps cleanly between 0 and 1 — no glassy mid-range. The overlay
  // crossfades via a CSS transition on opacity, so the visual change is
  // still smooth, but the bg is *always* either solid mint or solid
  // dark teal. The exit threshold is tuned so the teal lets go promptly
  // as the page begins to scroll past — no overstaying once the diagram
  // is no longer the focus. `onDark` controls text-colour inversion in
  // lockstep.
  const isDarkPhase = enterP > 0.55 && exitP < 0.5;
  const darkness = isDarkPhase ? 1 : 0;
  const onDark = isDarkPhase;

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
  // ─────────────────────────────────────────────────────────────────
  const sceneEaseOutExpo = (t: number): number =>
    t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  const stepFraction = 1 / (nodes.length + 1);
  const phaseP = (
    nodeIdx: number,
    subStart: number,
    subEnd: number
  ): number => {
    const stepStart = (nodeIdx + 1) * stepFraction;
    const stepEnd = (nodeIdx + 2) * stepFraction;
    const inStep = (activationP - stepStart) / (stepEnd - stepStart);
    const raw = Math.max(
      0,
      Math.min(1, (inStep - subStart) / (subEnd - subStart))
    );
    return sceneEaseOutExpo(raw);
  };
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
        style={
          pinned
            ? { height: `${collapsed ? COLLAPSED_VH : TALL_VH}vh` }
            : undefined
        }
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
            className="relative z-10 mx-auto w-full max-w-page shrink-0"
            style={{
              opacity: 1 - pushP * 0.7,
              transform: `translateY(${pushP * 56}px) scale(${1 - pushP * 0.24})`,
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
              opacity: introP * (1 - pushP * 0.7),
              transform: `translateY(${(1 - introP) * 24 + pushP * 56}px) scale(${1 - pushP * 0.24})`,
              transformOrigin: "center 45%",
              willChange: "opacity, transform",
            }}
          >
            <div
              ref={diagramRef}
              className="relative w-full aspect-3/2"
              style={{
                // Static 2° forward tilt baked into the rotateX init.
                // The mouse-parallax RAF (above) writes `transform`
                // directly to this element via ref, so React doesn't
                // re-render on every mouse move.
                transform: pinned ? "rotateX(2deg) rotateY(0deg)" : "none",
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
                  const cp = phaseP(i + 1, 0, 0.55);
                  return (
                    <line
                      key={`conn-${i}`}
                      x1={from.cx}
                      y1={from.cy}
                      x2={to.cx}
                      y2={to.cy}
                      stroke="#38fe9c"
                      strokeWidth={92}
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={length}
                      strokeDashoffset={length * (1 - cp)}
                      style={{
                        transition:
                          "stroke-dashoffset 280ms var(--ease-premium)",
                      }}
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
                  const fillP =
                    i === 0
                      ? phaseP(i, 0, 0.6)
                      : phaseP(i, 0.45, 0.6);
                  const photoP =
                    i === 0
                      ? phaseP(i, 0, 0.6)
                      : phaseP(i, 0.6, 0.85);
                  return (
                    <circle
                      key={`fill-${n.id}`}
                      cx={n.cx}
                      cy={n.cy}
                      r={n.r - 2}
                      fill="#38fe9c"
                      opacity={fillP * (1 - photoP)}
                      style={{
                        transition:
                          "opacity 280ms var(--ease-premium)",
                      }}
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
                // Scroll-coupled photo reveal. For the first node there
                // is no incoming connector, so it appears over the first
                // 60 % of its step. For every subsequent node, the photo
                // waits for the disc fill to settle (60 % of step) then
                // appears over the next 25 % — guaranteed to arrive
                // AFTER both the connector and the fill, BEFORE the hold.
                const pp =
                  i === 0
                    ? phaseP(i, 0, 0.6)
                    : phaseP(i, 0.6, 0.85);
                const isHovered = hoveredIndex === i && activated;
                const href = n.href ?? `/sectors/${n.id}`;
                const onClickNode = (e: React.MouseEvent) => {
                  e.preventDefault();
                  if (!activated) return;
                  // Trigger the portal-zoom transition, then navigate
                  // once the animation has had time to register.
                  setPortalIndex(i);
                  window.setTimeout(() => router.push(href), 650);
                };
                // Cinematic focus pull — when any node is hovered, the
                // others desaturate and dim slightly so the eye is
                // drawn into the active porthole. No hard ring, no
                // jumpy scale; just a quiet shift of attention.
                const dimSiblings =
                  hoveredIndex !== null && hoveredIndex !== i && activated;
                return (
                  <g
                    key={n.id}
                    data-cursor="icon"
                    onMouseEnter={() =>
                      activated && setHoveredIndex(i)
                    }
                    onMouseLeave={() =>
                      setHoveredIndex((cur) => (cur === i ? null : cur))
                    }
                    onClick={onClickNode}
                    style={{
                      // No `transform` on this wrapper — Safari iOS /
                      // desktop drops the descendants' SVG `<clipPath>`
                      // reference whenever an ancestor `<g>` has a CSS
                      // transform applied. The reveal is now opacity-
                      // only, with the static `r` doing all the sizing.
                      opacity: pp * (dimSiblings ? 0.7 : 1),
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
                );
              })}
            </svg>

            {nodes.map((n, i) => {
              // Scroll-coupled label reveal — same window as the node's
              // photo so they appear together as a strict pair after
              // the connector has drawn and the disc has filled.
              const lp =
                i === 0
                  ? phaseP(i, 0, 0.6)
                  : phaseP(i, 0.6, 0.85);
              // Once everything is revealed (final hold), every label
              // settles at full opacity. Otherwise the dim-others rule
              // still applies based on which step the user is in.
              const isActive = step === i + 1;
              const allRevealed = step >= nodes.length;
              const baseOpacity = lp; // 0 → 1 during this node's step
              const dimMultiplier = allRevealed
                ? 1
                : step > i + 1
                  ? 0.85
                  : 1; // previously-revealed labels softly dim to 85%
              const labelOpacity = baseOpacity * dimMultiplier;
              void isActive; // currently informative only
              return (
              <div
                key={`label-${n.id}`}
                className="absolute w-[18%] max-w-72"
                style={{
                  left: `${n.labelLeftPct}%`,
                  top: `${n.labelTopPct}%`,
                  opacity: labelOpacity,
                  transform: `translate3d(0, ${(1 - lp) * 16}px, 0)`,
                  // Only the dim-cross-fade (when other labels dim once
                  // they're no longer active) needs a CSS transition.
                  // The reveal itself is scroll-coupled via `lp`.
                  transition:
                    "opacity 700ms var(--ease-premium)",
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
              );
            })}

            </div>
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
                className="absolute left-0 top-0 w-full rounded-full bg-error-500 transition-[height] duration-150 ease-[var(--ease-premium)]"
                style={{ height: `${activationP * 100}%` }}
              />
            </div>
          ) : null}

        </div>
      </div>

      {/* Portal transition — when a node is clicked, a fixed overlay
          paints a dark veil that fades in while the chosen node's
          photo scales out from its origin to fill the viewport. Route
          push fires ~650 ms in so the new page lands as the zoom
          completes — reads as stepping through the porthole into a
          new dimension. */}
      {portalIndex !== null && pinned && (
        <div
          className="fixed inset-0 z-60 pointer-events-none overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute inset-0 bg-primary-500"
            style={{
              animation:
                "care-portal-veil 700ms var(--ease-premium) forwards",
            }}
          />
          <PortalBloom
            node={nodes[portalIndex]}
            sectionEl={sectionRef.current}
          />
        </div>
      )}

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

/**
 * Portal bloom — a circle that starts at the chosen node's on-screen
 * position and scales up to fill the viewport, painted with the
 * node's image. Reads as the porthole opening into a new space.
 */
function PortalBloom({
  node,
  sectionEl,
}: {
  node: Node;
  sectionEl: HTMLElement | null;
}) {
  // Find the node's pixel position on screen so the portal grows from
  // exactly where the user clicked. Falls back to viewport centre.
  let originX = 0.5;
  let originY = 0.5;
  let startPx = 160;
  if (sectionEl) {
    // The diagram wrapper is `.aspect-3/2` inside the perspective box.
    // Its viewBox is 1190 × 702; we need the on-screen pixel rect for
    // the node circle (cx/cy/r) relative to the viewport.
    const diagram = sectionEl.querySelector<HTMLElement>(
      "div.aspect-3\\/2"
    );
    if (diagram) {
      const rect = diagram.getBoundingClientRect();
      const px = rect.left + (node.cx / 1190) * rect.width;
      const py = rect.top + (node.cy / 702) * rect.height;
      originX = px / window.innerWidth;
      originY = py / window.innerHeight;
      startPx = (node.r / 1190) * rect.width * 2;
    }
  }

  return (
    <div
      className="absolute"
      style={{
        left: `${originX * 100}%`,
        top: `${originY * 100}%`,
        width: `${startPx}px`,
        height: `${startPx}px`,
        marginLeft: `-${startPx / 2}px`,
        marginTop: `-${startPx / 2}px`,
        borderRadius: "9999px",
        overflow: "hidden",
        backgroundColor: "#042D2B",
        backgroundImage: `url(${node.imageSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        animation:
          "care-portal-zoom 700ms cubic-bezier(0.65, 0, 0.35, 1) forwards",
        boxShadow: "0 0 80px rgba(56, 254, 156, 0.45)",
      }}
    />
  );
}
