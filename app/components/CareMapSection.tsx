"use client";

import { useEffect, useRef, useState } from "react";
import ArrowRight from "./ArrowRight";
import Button from "./Button";
import LogoShape from "./shapes/LogoShape";

type Node = {
  id: string;
  /** Number shown in the eyebrow ("01", "02", …). */
  index: string;
  title: string;
  description: string;
  /** SVG circle position + radius (within VIEWBOX_W × VIEWBOX_H). */
  cx: number;
  cy: number;
  r: number;
  imageSrc: string;
  imageAlt: string;
  /** Where the title+description block sits, as a % of the wrapper. */
  labelLeftPct: number;
  labelTopPct: number;
};

type Props = {
  heading?: string;
  body?: string;
  viewAllHref?: string;
  nodes?: Node[];
};

const VIEWBOX_W = 1190;
const VIEWBOX_H = 702;

const DEFAULT_NODES: Node[] = [
  {
    id: "sovereignty",
    index: "01",
    title: "Sovereignty",
    description:
      "The authorship of the architecture. The decision to build rather than wait — on our terms, with our people.",
    cx: 141.509,
    cy: 141.54,
    r: 140.685,
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Nurse in profile",
    labelLeftPct: 0,
    labelTopPct: 0,
  },
  {
    id: "dignity",
    index: "02",
    title: "Dignity",
    description:
      "The purpose the architecture serves. The patient, the nurse, the standard of care we hold ourselves to.",
    cx: 618.8,
    cy: 149.734,
    r: 84.336,
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Masked surgeon preparing",
    labelLeftPct: 41,
    labelTopPct: 0,
  },
  {
    id: "standard",
    index: "03",
    title: "Standard",
    description:
      "The level we hold ourselves to. Internationally credible, locally accountable, never compromised.",
    cx: 1043.13,
    cy: 219.292,
    r: 145.927,
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Surgical team in operating room",
    labelLeftPct: 80,
    labelTopPct: 0,
  },
  {
    id: "research",
    index: "04",
    title: "Research",
    description:
      "The science that makes the work credible. Discovery embedded in care, not separated from it.",
    cx: 618.931,
    cy: 419.507,
    r: 84.336,
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Researcher with safety goggles",
    labelLeftPct: 22,
    labelTopPct: 50,
  },
  {
    id: "care",
    index: "05",
    title: "Care",
    description:
      "Front-line excellence. The hands and voices that turn infrastructure into outcomes.",
    cx: 886.678,
    cy: 608.904,
    r: 88.642,
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Smiling nurse with stethoscope",
    labelLeftPct: 41,
    labelTopPct: 92,
  },
  {
    id: "alliance",
    index: "06",
    title: "Alliance",
    description:
      "The structure that holds it up. The corridors and coalitions that make one small state's ambition permanent.",
    cx: 362.982,
    cy: 610.674,
    r: 89.823,
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Care provider with patient",
    labelLeftPct: 0,
    labelTopPct: 92,
  },
];

const DEFAULT_HEADING = "The Architecture of Care";
const DEFAULT_BODY =
  "The structure through which a small state and a region care for their own. Built deliberately. Piece by piece. With the people it is for.";

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const local = (p: number, start: number, end: number) =>
  clamp01((p - start) / (end - start));

// 6 paired beats (node + label reveal together) across the pinned scroll.
// Headers/backdrop come first; pairs cascade.
const HEADER_RANGE = [0.0, 0.1] as const;
const LOGO_RANGE = [0.12, 0.22] as const;
const PAIR_START = 0.26;
const PAIR_DURATION = 0.06;
const PAIR_GAP = 0.04;

function pairRange(i: number): [number, number] {
  const start = PAIR_START + i * (PAIR_DURATION + PAIR_GAP);
  return [start, start + PAIR_DURATION];
}

export default function CareMapSection({
  heading = DEFAULT_HEADING,
  body = DEFAULT_BODY,
  viewAllHref = "/architecture-of-care",
  nodes = DEFAULT_NODES,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(SVGGElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  useEffect(() => {
    if (!isDesktop || reducedMotion) return;

    let raf = 0;
    const apply = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const range = el.offsetHeight - window.innerHeight;
      const p = range > 0 ? clamp01(-rect.top / range) : 0;

      if (headerRef.current) {
        const hp = local(p, HEADER_RANGE[0], HEADER_RANGE[1]);
        headerRef.current.style.opacity = String(hp);
        headerRef.current.style.transform = `translate3d(0, ${(1 - hp) * 20}px, 0)`;
      }
      if (logoRef.current) {
        const lp = local(p, LOGO_RANGE[0], LOGO_RANGE[1]);
        logoRef.current.style.opacity = String(lp);
        logoRef.current.style.transform = `scale(${0.92 + 0.08 * lp})`;
      }

      // Each pair (node + label) reveals together at its own range.
      nodes.forEach((_, i) => {
        const [start, end] = pairRange(i);
        const np = local(p, start, end);
        const node = nodeRefs.current[i];
        const lab = labelRefs.current[i];
        if (node) {
          node.style.opacity = String(np);
          node.style.transform = `scale(${0.7 + 0.3 * np})`;
        }
        if (lab) {
          lab.style.opacity = String(np);
          lab.style.transform = `translate3d(0, ${(1 - np) * 14}px, 0)`;
        }
      });
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
  }, [isDesktop, reducedMotion, nodes]);

  // Mobile / reduced-motion: simple sequential paired reveal
  if (!isDesktop || reducedMotion) {
    return (
      <section
        data-care-mobile
        data-nav-theme="light"
        className="bg-error-25 px-8 md:px-16 lg:px-28 py-10 md:py-14 lg:py-20"
      >
        <div className="mx-auto max-w-page rounded-lg bg-error-25 px-5 md:px-8 lg:px-10 py-7 md:py-10 lg:py-12">
          <CareMapHeader
            heading={heading}
            body={body}
            viewAllHref={viewAllHref}
          />
          <CareMapDiagram nodes={nodes} />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      className="bg-error-25 relative"
      style={{ height: "420vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-page w-full">
          <div ref={headerRef} style={{ opacity: 0 }}>
            <CareMapHeader
              heading={heading}
              body={body}
              viewAllHref={viewAllHref}
            />
          </div>

          <div className="grid grid-cols-12 gap-10 lg:gap-20 items-center">
            <div className="col-span-7 relative">
              <div
                ref={logoRef}
                style={{ opacity: 0, transformOrigin: "center" }}
              >
                <LogoShape fill="#9bffcd" className="w-full h-auto" />
              </div>

              <svg
                viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden
              >
              <defs>
                <filter
                  id="care-node-shadow"
                  x="-30%"
                  y="-30%"
                  width="160%"
                  height="160%"
                >
                  <feDropShadow
                    dx="0"
                    dy="6"
                    stdDeviation="12"
                    floodColor="#000036"
                    floodOpacity="0.18"
                  />
                </filter>
                {nodes.map((n) => (
                  <clipPath key={n.id} id={`care-clip-${n.id}`}>
                    <circle cx={n.cx} cy={n.cy} r={n.r} />
                  </clipPath>
                ))}
              </defs>
              {nodes.map((n, i) => (
                <g
                  key={n.id}
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  style={{
                    opacity: 0,
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                >
                  {/* Soft drop shadow under the node */}
                  <circle
                    cx={n.cx}
                    cy={n.cy}
                    r={n.r}
                    fill="#000036"
                    fillOpacity="0.08"
                    filter="url(#care-node-shadow)"
                  />
                  <image
                    href={n.imageSrc}
                    x={n.cx - n.r}
                    y={n.cy - n.r}
                    width={n.r * 2}
                    height={n.r * 2}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#care-clip-${n.id})`}
                  />
                  {/* Subtle inner darken at bottom for depth */}
                  <circle
                    cx={n.cx}
                    cy={n.cy}
                    r={n.r}
                    fill={`url(#care-glaze-${n.id})`}
                  />
                  {/* Crisp white ring */}
                  <circle
                    cx={n.cx}
                    cy={n.cy}
                    r={n.r - 0.75}
                    fill="none"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="1.5"
                  />
                </g>
              ))}
              <defs>
                {nodes.map((n) => (
                  <radialGradient
                    key={`grad-${n.id}`}
                    id={`care-glaze-${n.id}`}
                    cx="50%"
                    cy="50%"
                    r="55%"
                  >
                    <stop offset="60%" stopColor="#000036" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000036" stopOpacity="0.18" />
                  </radialGradient>
                ))}
              </defs>
            </svg>
            </div>

            <div className="col-span-5 flex flex-col gap-8 lg:gap-10">
              {nodes.map((n, i) => (
                <div
                  key={`label-${n.id}`}
                  ref={(el) => {
                    labelRefs.current[i] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  <NodeLabel node={n} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NodeLabel({ node }: { node: Node }) {
  return (
    <div className="flex gap-5 lg:gap-7 items-start">
      <div className="shrink-0 pt-1.5 text-[11px] lg:text-xs font-bold tracking-[0.24em] uppercase text-primary-500/35 w-9">
        {node.index}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-lg lg:text-xl font-semibold text-primary-500 leading-[1.15] tracking-[-0.015em]">
          {node.title}
        </h3>
        <p className="mt-2 text-sm lg:text-base text-primary-500/65 leading-[1.6]">
          {node.description}
        </p>
      </div>
    </div>
  );
}

function CareMapHeader({
  heading,
  body,
  viewAllHref,
}: {
  heading: string;
  body: string;
  viewAllHref: string;
}) {
  return (
    <div className="flex items-start justify-between gap-8 mb-10 md:mb-14 lg:mb-16">
      <div className="max-w-2xl">
        <h2 className="font-display text-display-md md:text-display-lg font-semibold text-primary-500 leading-[1.05] tracking-tight">
          {heading}
        </h2>
        <p className="mt-5 text-base lg:text-lg text-primary-500/75 leading-[1.55] max-w-lg">
          {body}
        </p>
      </div>
      <a
        href={viewAllHref}
        className="flex items-center gap-3 text-primary-500 hover:opacity-70 transition-opacity shrink-0"
      >
        <span className="text-sm font-semibold">View all</span>
        <Button
          variant="tertiary"
          iconOnly="sm"
          aria-label="View all"
          tabIndex={-1}
        >
          <ArrowRight />
        </Button>
      </a>
    </div>
  );
}

function CareMapDiagram({ nodes }: { nodes: Node[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">
      <div className="md:col-span-7 relative">
      <LogoShape fill="#9bffcd" className="w-full h-auto" />

      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden
      >
        <defs>
          <filter
            id="care-node-shadow-mobile"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="12"
              floodColor="#000036"
              floodOpacity="0.18"
            />
          </filter>
          {nodes.map((n) => (
            <clipPath key={n.id} id={`care-clip-mobile-${n.id}`}>
              <circle cx={n.cx} cy={n.cy} r={n.r} />
            </clipPath>
          ))}
          {nodes.map((n) => (
            <radialGradient
              key={`grad-m-${n.id}`}
              id={`care-glaze-mobile-${n.id}`}
              cx="50%"
              cy="50%"
              r="55%"
            >
              <stop offset="60%" stopColor="#000036" stopOpacity="0" />
              <stop offset="100%" stopColor="#000036" stopOpacity="0.18" />
            </radialGradient>
          ))}
        </defs>
        {nodes.map((n) => (
          <g key={n.id} data-care-node>
            <circle
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill="#000036"
              fillOpacity="0.08"
              filter="url(#care-node-shadow-mobile)"
            />
            <image
              href={n.imageSrc}
              x={n.cx - n.r}
              y={n.cy - n.r}
              width={n.r * 2}
              height={n.r * 2}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#care-clip-mobile-${n.id})`}
            />
            <circle
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill={`url(#care-glaze-mobile-${n.id})`}
            />
            <circle
              cx={n.cx}
              cy={n.cy}
              r={n.r - 0.75}
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </svg>
      </div>

      <div className="md:col-span-5 flex flex-col gap-6">
      {nodes.map((n) => (
        <div key={`label-${n.id}`} data-care-label>
          <NodeLabel node={n} />
        </div>
      ))}
      </div>
    </div>
  );
}
