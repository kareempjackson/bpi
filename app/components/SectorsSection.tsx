"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
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
  nodes?: Node[];
};

const VIEWBOX_W = 1190;
const VIEWBOX_H = 702;

const DEFAULT_IMG = "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg";

// Node coordinates are taken directly from the LogoShape path so the image
// circles sit exactly on top of the molecule's nodes.
// Label coords reflect the layout shown in the design mockup, mapped onto
// a 3:2 (1.5:1) wrapper so each label sits in the margin near its node.
// Flow reversed: activation now starts at the top-left node and travels
// clockwise around the molecule to the top. Each sector keeps its
// physical position, image, and label coordinates — only the number and
// the sequence order change.
const DEFAULT_NODES: Node[] = [
  {
    id: "investment-financing",
    num: "01",
    title: "Investment & Financing",
    description:
      "Connecting viable projects to the right capital at the right stage.",
    cx: 141.509,
    cy: 141.54,
    r: 140.685,
    imageSrc: DEFAULT_IMG,
    imageAlt: "Investment and financing partners",
    labelLeftPct: -4,
    labelTopPct: 42,
  },
  {
    id: "regulatory-policy",
    num: "02",
    title: "Regulatory Development & Policy",
    description:
      "Building the regulatory framework that gives investors and manufacturers confidence to commit.",
    cx: 362.982,
    cy: 610.674,
    r: 89.823,
    imageSrc: DEFAULT_IMG,
    imageAlt: "Regulatory framework and policy",
    labelLeftPct: 40,
    labelTopPct: 80,
  },
  {
    id: "innovation-technology",
    num: "03",
    title: "Innovation & Technology",
    description:
      "Creating the conditions for pharmaceutical innovation to take root and scale.",
    cx: 618.931,
    cy: 419.507,
    r: 84.336,
    imageSrc: DEFAULT_IMG,
    imageAlt: "Innovation and technology",
    labelLeftPct: 28,
    labelTopPct: 45,
  },
  {
    id: "research-development",
    num: "04",
    title: "Research & Development",
    description:
      "Establishing Barbados as a credible site for pharmaceutical research and technology transfer.",
    cx: 886.678,
    cy: 608.904,
    r: 88.642,
    imageSrc:
      "/images/6 sectors/national-cancer-institute-wTrKloP4UKw-unsplash.jpg",
    imageAlt: "Pharmaceutical research and development",
    // Bottom-right of this node — drops below the lower edge on the
    // right side of the molecule.
    labelLeftPct: 85,
    labelTopPct: 84,
  },
  {
    id: "workforce",
    num: "05",
    title: "Workforce & Talent Development",
    description:
      "Building the skilled workforce Caribbean pharmaceutical production depends on.",
    cx: 1043.13,
    cy: 219.292,
    r: 145.927,
    imageSrc:
      "/images/6 sectors/christina-wocintechchat-com-m-rg1y72eKw6o-unsplash.jpg",
    imageAlt: "Workforce training and development",
    // Bottom-right of the workforce node — tucked under the lower
    // edge of the node circle, nudged further right so it clears the
    // node and hugs the right edge of the diagram.
    labelLeftPct: 86,
    labelTopPct: 55,
  },
  {
    id: "market-access",
    num: "06",
    title: "Market Access & Trade Development",
    description:
      "Opening pharmaceutical trade routes across CARICOM, Latin America, Africa, and the Global South.",
    cx: 618.8,
    cy: 149.734,
    r: 84.336,
    imageSrc: "/images/6 sectors/daniel-miksha-4ZornyPnGlA-unsplash.jpg",
    imageAlt: "Trade and supply chain",
    // Right corner of the top node — sits between this node and the
    // workforce node, lifted toward the top of the diagram.
    labelLeftPct: 60,
    labelTopPct: 5,
  },
];

export default function SectorsSection({
  heading = "Shifting Trade Prowess in Favour of the Global South",
  body = "BPI is building across six sectors, each one a structural component of the Caribbean's pharmaceutical future.",
  nodes = DEFAULT_NODES,
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
  // Custom cursor that follows the mouse only while hovering an
  // activated node. We write `transform` directly via ref so the
  // cursor tracking doesn't trigger React re-renders.
  const cursorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [portalIndex, setPortalIndex] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [introP, setIntroP] = useState(0);
  const [activationP, setActivationP] = useState(0);
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
    // `easeOutExpo` — matches the cubic-bezier(0.16, 1, 0.3, 1) used
    // elsewhere on the site. Fast take-off, long graceful settle.
    const easeOutExpo = (t: number): number =>
      t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

    let raf = 0;
    const apply = () => {
      const vh = window.innerHeight;
      const headingEl = headingRef.current;
      if (headingEl) {
        // Scroll-coupled entrance. Starts when the heading's top edge
        // reaches the viewport top (the user has "scrolled to Shifting")
        // and completes after another 0.6 vh of scroll. Eased so the
        // colour washes in gracefully rather than ramping linearly.
        const top = headingEl.getBoundingClientRect().top;
        const entryEnd = -vh * 0.6;
        const raw = Math.max(0, Math.min(1, top / entryEnd));
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
    const target = { introP: 0, activationP: 0 };
    const displayed = { introP: 0, activationP: 0 };

    const readTargets = () => {
      const el = stickyRangeRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      target.introP = Math.max(0, Math.min(1, 1 - rect.top / vh));
      const total = el.offsetHeight - vh;
      const p = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
      // Most of the scroll budget goes to the activation phase. A short
      // hold (~15 %) lets the eye finish on the fully-lit diagram, then
      // the section releases promptly so the page keeps moving without
      // feeling stuck.
      target.activationP = Math.min(1, p / 0.85);
    };

    const LERP = 0.14; // premium smoothing — high enough to feel
                       // responsive, low enough that fast scrolls
                       // float into place instead of slamming.
    const SETTLE_EPSILON = 0.0006;

    const tick = () => {
      readTargets();
      const nextIntro =
        displayed.introP + (target.introP - displayed.introP) * LERP;
      const nextAct =
        displayed.activationP + (target.activationP - displayed.activationP) * LERP;
      const settled =
        Math.abs(target.introP - nextIntro) < SETTLE_EPSILON &&
        Math.abs(target.activationP - nextAct) < SETTLE_EPSILON;

      displayed.introP = nextIntro;
      displayed.activationP = nextAct;

      setIntroP(nextIntro);
      setActivationP(nextAct);
      setStep(
        Math.min(nodes.length, Math.floor(nextAct * (nodes.length + 1)))
      );

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
      if (!raf) {
        settledFor = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    // Prime the loop and snap to initial scroll position so we don't
    // animate from zero on first paint.
    readTargets();
    displayed.introP = target.introP;
    displayed.activationP = target.activationP;
    setIntroP(target.introP);
    setActivationP(target.activationP);
    setStep(
      Math.min(
        nodes.length,
        Math.floor(target.activationP * (nodes.length + 1)),
      ),
    );
    raf = requestAnimationFrame(tick);
    window.addEventListener("scroll", ensureRunning, { passive: true });
    window.addEventListener("resize", ensureRunning, { passive: true });
    return () => {
      window.removeEventListener("scroll", ensureRunning);
      window.removeEventListener("resize", ensureRunning);
      cancelAnimationFrame(raf);
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

  // Custom-cursor follower — when a node is hovered, the BPI logo
  // icon tracks the cursor via direct DOM writes (no React re-render).
  // The listener is window-scoped so the icon stays aligned even if
  // the mouse moves slightly off the SVG hit-zone between frames.
  useEffect(() => {
    if (hoveredIndex === null) return;
    const cursor = cursorRef.current;
    if (!cursor) return;
    const handle = (e: MouseEvent) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    };
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, [hoveredIndex]);

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
    "color 700ms cubic-bezier(0.16, 1, 0.3, 1)";

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
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="sticky top-0 h-screen w-full overflow-hidden transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
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
      {/* Heading + body — flow normally above the sticky range. The
          `headingRef` covers BOTH so the bg flip waits until both have
          scrolled past the viewport top, preventing any text-on-changing-
          bg contrast issues. */}
      <div
        ref={headingRef}
        className="relative z-10 px-12 md:px-20 lg:px-32 pt-16 md:pt-24 lg:pt-32 pb-4 md:pb-6 lg:pb-8"
      >
        <div className="mx-auto max-w-page">
          <div className="max-w-3xl">
            <h2
              className="font-display text-display-lg lg:text-display-xl font-bold leading-[1.02] tracking-tight"
              style={{ color: txt, transition: colorEase }}
            >
              {heading}
            </h2>
            <p
              className="mt-6 text-base lg:text-lg leading-[1.55] max-w-xl"
              style={{ color: txt70, transition: colorEase }}
            >
              {body}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop sticky range — diagram only. Tall enough to give scroll room
          for the shape-only intro state plus six progressive reveals plus a
          final hold so node 6 is visible long enough before unsticking. */}
      <div
        ref={stickyRangeRef}
        className="hidden md:block relative z-10"
        style={pinned ? { height: `${(nodes.length + 2) * 100}vh` } : undefined}
      >
        <div
          className={
            pinned
              ? "sticky top-0 h-screen overflow-hidden flex items-start justify-center px-6 lg:px-10 pt-6 lg:pt-10 pb-20 lg:pb-32"
              : "relative px-6 lg:px-10 pb-14 md:pb-20 lg:pb-28"
          }
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Perspective wrapper — gives the diagram a discreet "looking
              down at it" tilt. Also driven by introP for the entry rise +
              fade so the molecule arrives gracefully as the user scrolls
              toward it. Disabled for prefers-reduced-motion via `pinned`. */}
          <div
            ref={perspectiveRef}
            className="relative w-full mx-auto"
            style={{
              perspective: "1600px",
              maxWidth: "140vh",
              opacity: introP,
              transform: `translateY(${(1 - introP) * 24}px)`,
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
                          "stroke-dashoffset 280ms cubic-bezier(0.16, 1, 0.3, 1)",
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
                          "opacity 280ms cubic-bezier(0.16, 1, 0.3, 1)",
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
                  <clipPath key={n.id} id={`care-clip-${n.id}`}>
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
                    onMouseEnter={() =>
                      activated && setHoveredIndex(i)
                    }
                    onMouseLeave={() =>
                      setHoveredIndex((cur) => (cur === i ? null : cur))
                    }
                    onClick={onClickNode}
                    style={{
                      opacity: pp * (dimSiblings ? 0.7 : 1),
                      transform: `scale(${0.92 + 0.08 * pp})`,
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      cursor: activated ? "none" : "default",
                      pointerEvents: activated ? "auto" : "none",
                      filter: dimSiblings
                        ? "saturate(0.35) brightness(0.85)"
                        : "saturate(1) brightness(1)",
                      transition:
                        "opacity 320ms cubic-bezier(0.16, 1, 0.3, 1), transform 320ms cubic-bezier(0.16, 1, 0.3, 1), filter 700ms cubic-bezier(0.16, 1, 0.3, 1)",
                      willChange: "opacity, transform",
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
                          style={{
                            transformBox: "fill-box",
                            transformOrigin: "center",
                            animation: isHovered
                              ? "care-node-drift 5s ease-in-out infinite"
                              : "none",
                            transform: isHovered ? undefined : "scale(1)",
                            transition: isHovered
                              ? undefined
                              : "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
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
                            }}
                          />
                        </foreignObject>
                      ) : (
                        <image
                          href={n.imageSrc}
                          x={n.cx - n.r}
                          y={n.cy - n.r}
                          width={n.r * 2}
                          height={n.r * 2}
                          preserveAspectRatio="xMidYMid slice"
                          style={{
                            transformBox: "fill-box",
                            transformOrigin: "center",
                            animation: isHovered
                              ? "care-node-drift 5s ease-in-out infinite"
                              : "none",
                            transform: isHovered ? undefined : "scale(1)",
                            transition: isHovered
                              ? undefined
                              : "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
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
                    "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <h3
                  className="font-display text-lg lg:text-xl font-bold leading-tight tracking-[-0.01em]"
                  style={{ color: txt, transition: colorEase }}
                >
                  {parseInt(n.num, 10)}. {n.title}
                </h3>
                <p
                  className="mt-3 text-base lg:text-lg leading-[1.45]"
                  style={{ color: txt75, transition: colorEase }}
                >
                  {n.description}
                </p>
              </div>
              );
            })}

            </div>
          </div>

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
                "care-portal-veil 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
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

      {/* Custom cursor — the BPI molecular icon follows the mouse
          whenever an activated node is being hovered, replacing the
          default arrow with a brand cue. Pointer-events disabled so
          it never blocks clicks on the node beneath. */}
      <div
        ref={cursorRef}
        aria-hidden
        className="hidden md:block fixed top-0 left-0 z-50 pointer-events-none"
        style={{
          opacity: hoveredIndex !== null ? 1 : 0,
          transform: "translate3d(-200px, -200px, 0)",
          transition:
            "opacity 220ms cubic-bezier(0.16, 1, 0.3, 1)",
          mixBlendMode: "difference",
        }}
      >
        <Logo iconOnly size={22} className="text-white" />
      </div>

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
