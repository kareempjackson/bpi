"use client";

import { useEffect, useRef, useState } from "react";
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
  /** Where the label block sits — as a % of the diagram wrapper. */
  labelLeftPct: number;
  labelTopPct: number;
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
const DEFAULT_NODES: Node[] = [
  {
    id: "market-access",
    num: "01",
    title: "Market Access & Trade Development",
    description:
      "Opening pharmaceutical trade routes across CARICOM, Latin America, Africa, and the Global South.",
    cx: 618.8,
    cy: 149.734,
    r: 84.336,
    imageSrc: DEFAULT_IMG,
    imageAlt: "Trade and supply chain",
    labelLeftPct: 32,
    labelTopPct: 2,
  },
  {
    id: "workforce",
    num: "02",
    title: "Workforce & Talent Development",
    description:
      "Building the skilled workforce Caribbean pharmaceutical production depends on.",
    cx: 1043.13,
    cy: 219.292,
    r: 145.927,
    imageSrc: DEFAULT_IMG,
    imageAlt: "Workforce training and development",
    labelLeftPct: 68,
    labelTopPct: 5,
  },
  {
    id: "research-development",
    num: "03",
    title: "Research & Development",
    description:
      "Establishing Barbados as a credible site for pharmaceutical research and technology transfer.",
    cx: 886.678,
    cy: 608.904,
    r: 88.642,
    imageSrc: DEFAULT_IMG,
    imageAlt: "Pharmaceutical research and development",
    labelLeftPct: 83,
    labelTopPct: 68,
  },
  {
    id: "innovation-technology",
    num: "04",
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
    id: "regulatory-policy",
    num: "05",
    title: "Regulatory Development & Policy",
    description:
      "Building the regulatory framework that gives investors and manufacturers confidence to commit.",
    cx: 362.982,
    cy: 610.674,
    r: 89.823,
    imageSrc: DEFAULT_IMG,
    imageAlt: "Regulatory framework and policy",
    labelLeftPct: 38,
    labelTopPct: 89,
  },
  {
    id: "investment-financing",
    num: "06",
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
];

export default function CareMapSection({
  heading = "Shifting Trade Prowess in Favour of the Global South",
  body = "BPI is building across six sectors, each one a structural component of the Caribbean's pharmaceutical future.",
  nodes = DEFAULT_NODES,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const stickyRangeRef = useRef<HTMLDivElement>(null);
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const [step, setStep] = useState(0);
  const [introP, setIntroP] = useState(0);
  const [activationP, setActivationP] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
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
    let raf = 0;
    const apply = () => {
      const el = stickyRangeRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Intro progress (0 → 1) — drives the cinematic entry. 0 when the
      // sticky range's top edge is at the viewport bottom, 1 when it
      // reaches the viewport top (i.e. just about to pin). This gives a
      // continuous fade/rise hand-off from the heading scrolling away to
      // the molecule appearing.
      const newIntroP = Math.max(0, Math.min(1, 1 - rect.top / vh));
      setIntroP(newIntroP);

      const total = el.offsetHeight - vh;
      const p = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
      // Split scroll into an activation phase (first 65 %) and a hold
      // phase (final 35 %). All nodes are revealed during the activation
      // phase; the hold phase keeps step 6 pinned so the user can absorb.
      const ACTIVATION_RATIO = 0.65;
      const newActivationP = Math.min(1, p / ACTIVATION_RATIO);
      const newStep = Math.min(
        nodes.length,
        Math.floor(newActivationP * (nodes.length + 1))
      );
      setStep(newStep);
      setActivationP(newActivationP);
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
  }, [nodes.length, pinned]);

  // Smooth mouse-parallax loop. Targets are written by `onMouseMove` and
  // `onMouseLeave`; this RAF lerps the rendered `mouse` state toward them
  // so the diagram tilt feels buttery rather than jittery. A lower lerp
  // factor (0.055) gives a more luxurious follow-through — the diagram
  // tracks the cursor with a slight, deliberate lag.
  useEffect(() => {
    if (!pinned) return;
    let raf = 0;
    const tick = () => {
      const t = mouseTargetRef.current;
      setMouse((prev) => {
        const lerp = 0.055;
        const nx = prev.x + (t.x - prev.x) * lerp;
        const ny = prev.y + (t.y - prev.y) * lerp;
        if (
          Math.abs(nx - prev.x) < 0.0005 &&
          Math.abs(ny - prev.y) < 0.0005
        ) {
          return prev;
        }
        return { x: nx, y: ny };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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
  // The bg color is applied to a sticky overlay layer (not the section
  // itself) so the section's surface always matches the page mint — no
  // visible boundary line between the section and the page above.
  // Combined overlay-presence value. Used to invert text only while the
  // dark teal is substantially visible. Text flips at the 50% threshold
  // and the CSS color transition smooths the swap inside the scroll
  // runway.
  const darkness = enterP * (1 - exitP);
  const onDark = darkness > 0.5;

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
    ? "rgba(255, 255, 255, 0.75)"
    : "rgba(0, 0, 54, 0.75)";
  const colorEase =
    "color 700ms cubic-bezier(0.16, 1, 0.3, 1)";

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
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
          className="sticky top-0 h-screen w-full overflow-hidden"
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
        style={pinned ? { height: `${(nodes.length + 4) * 100}vh` } : undefined}
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
            className="relative w-full mx-auto"
            style={{
              perspective: "1600px",
              maxWidth: "140vh",
              opacity: introP,
              transform: `translateY(${(1 - introP) * 24}px)`,
            }}
          >
            <div
              className="relative w-full aspect-3/2"
              style={{
                // Static 2° forward tilt + mouse-driven micro-rotation
                // for parallax depth. Magnitudes tightened slightly so
                // the diagram reads as living depth rather than swaying.
                transform: pinned
                  ? `rotateX(${2 - mouse.y * 1.8}deg) rotateY(${
                      mouse.x * 2.2
                    }deg)`
                  : "none",
                transformOrigin: "center 60%",
                transformStyle: "preserve-3d",
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
            <LogoShape className="absolute inset-0 w-full h-full" />

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
              style={{
                filter: `drop-shadow(0 0 32px rgba(56, 254, 156, ${
                  0.18 * darkness
                })) drop-shadow(0 18px 40px rgba(4, 45, 43, 0.4))`,
                transition: "filter 700ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              aria-hidden
            >
              <defs>
                {/* Mask used to limit the bright connector strokes to the
                    molecule shape AND additionally exclude specific nodes
                    (workforce, regulatory-policy) so those node interiors
                    keep the sleek dim-gradient appearance from the base
                    LogoShape — no bright stroke-cap "disc" gets painted
                    over them as the connectors light up. */}
                <mask id="care-mol-mask">
                  <path d={LOGO_SHAPE_PATH_D} fill="white" />
                  {nodes
                    .filter((n) => n.id === "workforce")
                    .map((n) => (
                      <circle
                        key={`mask-${n.id}`}
                        cx={n.cx}
                        cy={n.cy}
                        r={n.r}
                        fill="black"
                      />
                    ))}
                </mask>
                {/* Soft bloom filter — adds a luminous halo around the
                    bright fills so they read as light against the dark
                    teal stage. The blurred copy is merged underneath the
                    crisp source for a clean lit feel rather than a
                    smudgy glow. */}
                <filter
                  id="care-fill-glow"
                  x="-15%"
                  y="-15%"
                  width="130%"
                  height="130%"
                >
                  <feGaussianBlur
                    stdDeviation="5"
                    result="bloom"
                  />
                  <feMerge>
                    <feMergeNode in="bloom" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Connectors — one per consecutive node pair. Connector i
                  runs from nodes[i] to nodes[i+1]; it lights up at step
                  i + 2 (after the destination node "activates"). The mask
                  trims strokes to the molecule shape minus the masked-out
                  nodes (2 + 5), preserving their gradient interiors. The
                  soft bloom filter gives the bright fills a luminous,
                  lit-from-within feel against the dark teal stage. */}
              <g mask="url(#care-mol-mask)" filter="url(#care-fill-glow)">
                {/* Tube strokes — single solid colour, narrower width so
                    the band stays inside its own tube and doesn't bleed
                    sideways into adjacent areas of the molecule.
                    Connector window extended to 55 % of the step so the
                    draw stretches out and feels more luxurious. */}
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
                      strokeWidth={110}
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={length}
                      strokeDashoffset={length * (1 - cp)}
                    />
                  );
                })}
                {/* Node disc fills — overlap the connector's last 10 % so
                    the fill appears to be "delivered" by the arriving
                    tube, then settles into the node. Window broadened
                    (0.45 → 0.6) so the fade itself has more time to
                    smooth out the easing curve. The first node has no
                    incoming connector, so it fills alongside its photo's
                    reveal window. */}
                {nodes.map((n, i) => {
                  if (n.id === "workforce") return null;
                  const fillP =
                    i === 0
                      ? phaseP(i, 0, 0.6)
                      : phaseP(i, 0.45, 0.6);
                  return (
                    <circle
                      key={`fill-${n.id}`}
                      cx={n.cx}
                      cy={n.cy}
                      r={n.r}
                      fill="#38fe9c"
                      opacity={fillP}
                    />
                  );
                })}
              </g>

            </svg>

            <svg
              viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden
            >
              <defs>
                {nodes.map((n) => (
                  <clipPath key={n.id} id={`care-clip-${n.id}`}>
                    <circle cx={n.cx} cy={n.cy} r={n.r} />
                  </clipPath>
                ))}
                {/* Inner vignette — subtle dark gradient at the photo's
                    edge gives each circle a "porthole" depth, suggesting
                    the photo is set into the molecule rather than pasted on. */}
                <radialGradient
                  id="care-photo-vignette"
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="55%" stopColor="rgba(0, 0, 54, 0)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 54, 0.22)" />
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
                return (
                  <g
                    key={n.id}
                    style={{
                      opacity: pp,
                      transform: `scale(${0.92 + 0.08 * pp})`,
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                  >
                    <image
                      href={n.imageSrc}
                      x={n.cx - n.r}
                      y={n.cy - n.r}
                      width={n.r * 2}
                      height={n.r * 2}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#care-clip-${n.id})`}
                    />
                    {/* Inner vignette — soft darkening at the photo's
                        outer edge for porthole depth. */}
                    <circle
                      cx={n.cx}
                      cy={n.cy}
                      r={n.r - 1}
                      fill="url(#care-photo-vignette)"
                    />
                    {/* Solid brand ring — replaces the previous dashed
                        border. Finer (1.5 px) and slightly muted for a
                        refined UI-marker look. Skipped on the workforce
                        node (02) per design — it sits flush with the
                        molecule body. */}
                    {n.id !== "workforce" && (
                      <circle
                        cx={n.cx}
                        cy={n.cy}
                        r={n.r - 0.75}
                        fill="none"
                        stroke="#04b25c"
                        strokeOpacity="0.7"
                        strokeWidth="1.5"
                      />
                    )}
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
                  ? 0.55
                  : 1; // previously-revealed labels dim to 55% (active stays 1)
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
                  className="font-display text-sm lg:text-base font-semibold leading-tight tracking-[-0.005em]"
                  style={{ color: txt, transition: colorEase }}
                >
                  <span style={{ color: txt60, transition: colorEase }}>
                    {n.num}:
                  </span>{" "}
                  {n.title}
                </h3>
                <p
                  className="mt-2 text-xs lg:text-sm leading-[1.55]"
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
            </div>
            <div className="min-w-0">
              <h3
                className="font-display text-sm font-bold leading-tight"
                style={{ color: txt, transition: colorEase }}
              >
                {n.num}: {n.title}
              </h3>
              <p
                className="mt-2 text-sm leading-[1.55]"
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
