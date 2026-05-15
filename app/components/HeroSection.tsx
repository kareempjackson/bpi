"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import ArrowRight from "./ArrowRight";
import Button from "./Button";
import CtaLink from "./CtaLink";
import Logo from "./Logo";
import type { MenuConfig } from "./Menu";
import MenuLauncher from "./MenuLauncher";

const DEFAULT_HEADLINE = "Building the Caribbean's pharmaceutical gateway.";
const DEFAULT_BODY =
  "97% of Caribbean medicines are imported. BPI is building the manufacturing capacity, supply chain, and regulatory infrastructure to change that.";
const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: "ABOUT", href: "/about" },
  { label: "ECOSYSTEM", href: "#ecosystem", disabled: true },
  { label: "INITIATIVES", href: "#initiative" },
];

export type NavLink = {
  label: string;
  href: string;
  disabled?: boolean;
};

export type HeroSectionProps = {
  headline?: string;
  body?: string;
  /** "video" (default) renders the autoplay loop; "image" renders a still. */
  backgroundKind?: "video" | "image";
  videoSrc?: string;
  imageSrc?: string;
  imageAlt?: string;
  ctaHref?: string;
  navLinks?: NavLink[];
  menuConfig?: MenuConfig;
};

// The hero card has a notched top-right where the embedded nav sits. The
// original path was authored at 1412×1020 and clipped with `objectBoundingBox`
// units — which non-uniformly stretches the path to whatever aspect the card
// has, squishing curves on mobile and elongating them on wide desktops. We
// now generate the path procedurally with pixel-stable radii and clip with
// `userSpaceOnUse`, so the silhouette stays sleek at every viewport size.
type HeroGeo = {
  R: number;       // outer corner radius (TL, BL, BR)
  nr: number;      // notch corner radius (all 3 notch curves + TR card corner)
  nh: number;      // notch height (y-coordinate of the shelf)
  notchW: number;  // total notch horizontal extent
};

function computeHeroGeo(cardW: number): HeroGeo {
  if (cardW < 640) {
    // Mobile: the HamburgerMenu at size=76 renders at 76×34px (120:54 aspect).
    // Position is top:12 / right:12, so the pill occupies y=12→46 and
    // x=cardW-88→cardW-12. Hug the pill with ~10px breathing room on the
    // outside edges; anything taller leaves dead space inside the notch.
    return {
      R: 20,
      nr: 12,
      nh: 58,
      notchW: Math.min(Math.max(cardW * 0.32, 116), 138),
    };
  }
  if (cardW < 1024) {
    return {
      R: 28,
      nr: 18,
      nh: 84,
      notchW: Math.min(Math.max(cardW * 0.36, 300), 380),
    };
  }
  return {
    R: 36,
    nr: 22,
    nh: 76,
    notchW: Math.min(Math.max(cardW * 0.32, 420), 540),
  };
}

function computeLogoSize(cardW: number): number {
  if (cardW < 640) return 92;
  if (cardW < 1024) return 118;
  return 138;
}

function buildHeroPath(W: number, H: number, geo: HeroGeo): string {
  const { R, nr, nh } = geo;
  const minNotchW = 3 * nr;
  const maxNotchW = Math.max(minNotchW, W - R - nr);
  const notchW = Math.min(Math.max(geo.notchW, minNotchW), maxNotchW);
  const x1 = W - notchW;
  // Approximate each 90° arc with a cubic Bézier. SVG `A` commands work
  // in SVG `<path>` and in Chrome's CSS `clip-path: path()`, but Safari
  // mis-interprets the sweep-flag and renders the notch as a warped /
  // bulbous shape. Bézier control points are mathematically equivalent
  // and parse identically on every browser.
  const K = 0.5522847498; // (4/3) * tan(π/8) — the magic constant.
  const kr = K * R;
  const kn = K * nr;
  return [
    `M${R} 0`,
    `H${x1}`,
    // Top of card → inside-top of notch (concave-down corner).
    `C${x1 + kn} 0 ${x1 + nr} ${nr - kn} ${x1 + nr} ${nr}`,
    `V${nh - nr}`,
    // Inside-bottom of notch → notch shelf (concave-up corner).
    `C${x1 + nr} ${nh - nr + kn} ${x1 + 2 * nr - kn} ${nh} ${x1 + 2 * nr} ${nh}`,
    `H${W - nr}`,
    // Notch shelf → card right edge.
    `C${W - nr + kn} ${nh} ${W} ${nh + nr - kn} ${W} ${nh + nr}`,
    `V${H - R}`,
    // Bottom-right outer corner.
    `C${W} ${H - R + kr} ${W - R + kr} ${H} ${W - R} ${H}`,
    `H${R}`,
    // Bottom-left outer corner.
    `C${R - kr} ${H} 0 ${H - R + kr} 0 ${H - R}`,
    `V${R}`,
    // Top-left outer corner.
    `C0 ${R - kr} ${R - kr} 0 ${R} 0`,
    "Z",
  ].join(" ");
}

const DEFAULT_CARD_SIZE = { w: 1412, h: 1020 } as const;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const local = (p: number, start: number, end: number) =>
  clamp01((p - start) / (end - start));

export default function HeroSection({
  headline = DEFAULT_HEADLINE,
  body = DEFAULT_BODY,
  backgroundKind = "video",
  videoSrc,
  imageSrc,
  imageAlt = "",
  ctaHref,
  navLinks = DEFAULT_NAV_LINKS,
  menuConfig,
}: HeroSectionProps = {}) {
  const NAV_LINKS = navLinks;
  const showImage = backgroundKind === "image" && !!imageSrc;
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const copyWrapRef = useRef<HTMLDivElement>(null);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const navLogoRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cardSize, setCardSize] = useState<{ w: number; h: number }>(
    DEFAULT_CARD_SIZE,
  );

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

  // Track the card's measured pixel size so the clip-path stays sleek.
  // `offsetWidth` / `offsetHeight` ignore the scroll-driven scale transform
  // applied to `cardRef`, so the path always reflects the un-transformed box.
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const update = () => {
      setCardSize((prev) => {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        if (w === prev.w && h === prev.h) return prev;
        return { w, h };
      });
    };
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const heroGeo = computeHeroGeo(cardSize.w);
  const heroPath = buildHeroPath(cardSize.w, cardSize.h, heroGeo);
  const logoSize = computeLogoSize(cardSize.w);
  const heroVars = {
    "--hero-logo-left": `${cardSize.w < 640 ? 16 : heroGeo.R}px`,
    "--hero-notch-h": `${heroGeo.nh}px`,
    "--hero-notch-right": `${heroGeo.nr}px`,
    "--hero-notch-w": `${Math.max(heroGeo.notchW - 3 * heroGeo.nr, 0)}px`,
  } as CSSProperties;

  useEffect(() => {
    if (!isDesktop || reducedMotion) return;

    let raf = 0;
    const apply = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const range = el.offsetHeight - window.innerHeight;
      const p = range > 0 ? clamp01(-rect.top / range) : 0;

      // Card scales from 1 (small notched card) → 1.7 (covers full viewport).
      // The clip-path stays at the notched shape, but at scale 1.7 the
      // notch corners are well outside the viewport, so the user sees a
      // clean, full-bleed video.
      const cardScale = 1 + p * 0.7;
      const copyP = local(p, 0.0, 0.4);
      const copyOpacity = 1 - copyP;
      const copyTranslateY = copyP * -60;
      const heroFadeP = local(p, 0.85, 1.0);
      const heroOverallOpacity = 1 - heroFadeP * 0.3;
      const tintBoost = local(p, 0.2, 0.9) * 0.35;

      if (cardRef.current) {
        cardRef.current.style.transform = `scale(${cardScale})`;
      }
      if (copyWrapRef.current) {
        copyWrapRef.current.style.opacity = String(copyOpacity);
        copyWrapRef.current.style.transform = `translate3d(0, ${copyTranslateY}px, 0)`;
      }
      if (heroWrapRef.current) {
        heroWrapRef.current.style.opacity = String(heroOverallOpacity);
      }
      if (tintRef.current) {
        // Add a deepening dark layer as we scroll into the video
        tintRef.current.style.opacity = String(0.22 + tintBoost);
      }
      if (videoWrapRef.current) {
        // Subtle parallax: video drifts down ~40px over the hero range,
        // creating depth against the card's scale-up. Stays well within the
        // card so no edges are exposed.
        videoWrapRef.current.style.transform = `translate3d(0, ${p * 40}px, 0)`;
      }

      // Hero-embedded nav exits with a staggered, cascading lift as the user
      // begins scrolling. The logo leads, then each nav link, then the menu
      // launcher — creating a premium "pushed aside" effect rather than a
      // single block fade. The global sticky nav takes over on scroll-up
      // after ~62 % of the range.
      const stagger = (start: number, end: number) =>
        local(p, start, end);
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

      // Logo: leads the cascade, exits straight up
      const logoP = easeOut(stagger(0.02, 0.16));
      if (navLogoRef.current) {
        navLogoRef.current.style.opacity = String(1 - logoP);
        navLogoRef.current.style.transform = `translate3d(0, ${
          logoP * -12
        }px, 0)`;
      }

      // Right nav cluster: stagger each child slightly
      if (navLinksRef.current) {
        const items = navLinksRef.current.querySelectorAll<HTMLElement>(
          "[data-nav-item]"
        );
        items.forEach((el, i) => {
          // Each subsequent item starts its exit ~3% later
          const start = 0.04 + i * 0.025;
          const end = start + 0.12;
          const itemP = easeOut(stagger(start, end));
          el.style.opacity = String(1 - itemP);
          el.style.transform = `translate3d(${itemP * 14}px, ${
            itemP * -10
          }px, 0)`;
        });
        // Container handles pointer-events once the last item is gone
        const lastEnd = 0.04 + (items.length - 1) * 0.025 + 0.12;
        const containerP = easeOut(stagger(0, lastEnd));
        navLinksRef.current.style.pointerEvents =
          containerP > 0.95 ? "none" : "";
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
  }, [isDesktop, reducedMotion]);

  const pinned = isDesktop && !reducedMotion;

  // CSS `clip-path: path("...")` with the raw path data directly. Using
  // `url(#hero-clip-bbox)` referencing a hidden 0×0 SVG renders correctly
  // on Chrome but Safari mis-computes the path bounds in that case,
  // showing the notch as a warped/bulbous shape instead of the clean
  // rectangular indent. Inline `path()` works identically on both.
  const heroClipPath = `path("${heroPath}")`;

  return (
    <>
      <section
        ref={sectionRef}
        data-page-hero
        className="relative bg-error-25"
        style={pinned ? { height: "180vh" } : undefined}
      >
        <div
          ref={heroWrapRef}
          className={
            pinned
              ? "sticky top-0 h-dvh overflow-hidden p-1.5 lg:p-4"
              : "h-dvh overflow-hidden p-1.5 lg:p-4"
          }
        >
          <div className="relative w-full h-full" style={heroVars}>
            {/* Hero card — clipped to notch shape via CSS clip-path on a plain div.
                Scales freely on scroll because there's no SVG clipPath/foreignObject
                in the transform path. */}
            <div
              ref={cardRef}
              className="absolute inset-0 hero-anim-fade"
              style={
                {
                  clipPath: heroClipPath,
                  WebkitClipPath: heroClipPath,
                  transformOrigin: "center",
                  backgroundColor: "#000036",
                  "--anim-delay": "0s",
                } as CSSProperties
              }
            >
              <div
                ref={videoWrapRef}
                className="absolute inset-x-0 top-[-6%] bottom-[-6%] will-change-transform"
              >
                {showImage ? (
                  <Image
                    key={imageSrc}
                    src={imageSrc!}
                    alt={imageAlt}
                    fill
                    preload
                    sizes="100vw"
                    quality={90}
                    className="hero-video object-cover"
                  />
                ) : videoSrc ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    disableRemotePlayback
                    disablePictureInPicture
                    className="hero-video absolute inset-0 w-full h-full object-cover"
                    key={videoSrc}
                  >
                    <source src={videoSrc} />
                  </video>
                ) : null}
              </div>

              {/* Brand tint — opacity bumps as we scroll deeper */}
              <div
                ref={tintRef}
                className="absolute inset-0"
                style={{ backgroundColor: "#000036", opacity: 0.22 }}
              />

              {/* Top scrim — keeps nav legible */}
              <div className="absolute inset-x-0 top-0 h-[18%] bg-linear-to-b from-black/55 to-transparent" />

              {/* Bottom scrim — keeps headline legible */}
              <div className="absolute inset-x-0 bottom-0 h-[42%] bg-linear-to-t from-black/78 via-black/45 to-transparent" />
            </div>

            <div
              ref={navLogoRef}
              data-page-header
              className="absolute z-20 flex items-center will-change-[opacity,transform]"
              style={
                {
                  left: "var(--hero-logo-left)",
                  top: 0,
                  height: "var(--hero-notch-h)",
                } as CSSProperties
              }
            >
              <Logo
                size={logoSize}
                className="block text-white hero-anim"
                style={{ "--anim-delay": "0.15s" } as CSSProperties}
              />
            </div>

            <div
              ref={navLinksRef}
              className="absolute z-30 hidden md:flex items-center justify-end gap-7 lg:gap-9 will-change-[opacity,transform]"
              style={{
                right: "calc(var(--hero-notch-right) + 4px)",
                top: 0,
                height: "var(--hero-notch-h)",
                maxWidth: "var(--hero-notch-w)",
              }}
            >
              <nav data-page-header className="flex items-center gap-7 lg:gap-9 text-[11px] font-semibold uppercase tracking-[0.14em] text-black">
                {NAV_LINKS.map((link, i) =>
                  link.disabled ? (
                    <div
                      key={link.href}
                      data-nav-item
                      className="will-change-[opacity,transform]"
                    >
                      <span
                        aria-disabled="true"
                        className="hero-anim opacity-40 cursor-not-allowed select-none"
                        style={
                          {
                            "--anim-delay": `${0.25 + i * 0.07}s`,
                          } as CSSProperties
                        }
                      >
                        {link.label}
                      </span>
                    </div>
                  ) : (
                    <div
                      key={link.href}
                      data-nav-item
                      className="will-change-[opacity,transform]"
                    >
                      <CtaLink
                        href={link.href}
                        className="hero-anim hover:opacity-60 transition-opacity duration-200"
                        style={
                          {
                            "--anim-delay": `${0.25 + i * 0.07}s`,
                          } as CSSProperties
                        }
                      >
                        {link.label}
                      </CtaLink>
                    </div>
                  )
                )}
              </nav>
              <div
                data-nav-item
                className="will-change-[opacity,transform]"
              >
                <div
                  className="hero-anim-fade"
                  style={{ "--anim-delay": "0.55s" } as CSSProperties}
                >
                  <MenuLauncher size={120} menuConfig={menuConfig} />
                </div>
              </div>
            </div>

            <div
              className="absolute top-0 right-0 z-30 md:hidden hero-anim-fade"
              style={{ "--anim-delay": "0.45s" } as CSSProperties}
            >
              <MenuLauncher size={104} menuConfig={menuConfig} />
            </div>

            <div
              ref={copyWrapRef}
              className="absolute bottom-0 left-0 z-10 px-8 lg:px-14 pb-36 lg:pb-48 max-w-2xl"
            >
              <h1
                className="hero-anim font-display text-display-lg font-semibold text-white tracking-[-0.03em] leading-[1.02]"
                style={{ "--anim-delay": "0.65s" } as CSSProperties}
              >
                {headline}
              </h1>
              <div className="mt-7 lg:mt-9 flex items-center gap-6">
                <p
                  className="hero-anim text-md lg:text-lg text-white/70 max-w-md leading-[1.6]"
                  style={{ "--anim-delay": "0.78s" } as CSSProperties}
                >
                  {body}
                </p>
                <div
                  className="hero-anim shrink-0"
                  style={{ "--anim-delay": "0.9s" } as CSSProperties}
                >
                  {ctaHref ? (
                    <CtaLink href={ctaHref} className="inline-flex" aria-label="Learn more">
                      <Button variant="primary" iconOnly="md">
                        <ArrowRight />
                      </Button>
                    </CtaLink>
                  ) : (
                    <Button
                      variant="primary"
                      iconOnly="md"
                      aria-label="Learn more"
                    >
                      <ArrowRight />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
