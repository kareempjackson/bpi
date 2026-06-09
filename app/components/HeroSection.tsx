"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import CtaLink from "./CtaLink";
import LanguageToggle from "./LanguageToggle";
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

/**
 * A single hero slide — its own background, copy, and CTA. The slider only
 * cycles these; the bottom-right feature card is fixed (see HeroFeature).
 */
export type HeroSlide = {
  headline: string;
  body?: string;
  ctaHref?: string;
  /** "video" (default) renders the autoplay loop; "image" renders a still. */
  backgroundKind?: "video" | "image";
  videoSrc?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Thumbnail for the bottom-left slider control. Falls back to imageSrc. */
  thumbnailSrc?: string;
  thumbnailAlt?: string;
};

/**
 * The fixed bottom-right feature card. A single looping video callout that
 * does NOT change with the slider — set once.
 */
export type HeroFeature = {
  /** Small label above the title, defaults to "Feature". */
  eyebrow?: string;
  /** The feature title, e.g. "Who we are". */
  label: string;
  /** Where the card links to. */
  href?: string;
  /** Looping video shown in the card. */
  videoSrc?: string;
  /** Still poster / fallback image. */
  posterSrc?: string;
  posterAlt?: string;
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
  /**
   * Slides. When two or more are supplied the hero becomes an auto-advancing
   * slider with progress segments (bottom-left). When omitted, the top-level
   * headline/body/background props render as a single static slide.
   */
  slides?: HeroSlide[];
  /** Fixed bottom-right feature card — independent of the slider. */
  feature?: HeroFeature;
  navLinks?: NavLink[];
  menuConfig?: MenuConfig;
};

/** How long each slide stays before auto-advancing, in ms. */
const SLIDE_DURATION = 7000;

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
      notchW: Math.min(Math.max(cardW * 0.42, 360), 480),
    };
  }
  return {
    R: 36,
    nr: 22,
    nh: 76,
    notchW: Math.min(Math.max(cardW * 0.34, 560), 600),
  };
}

function computeLogoSize(cardW: number): number {
  if (cardW < 640) return 92;
  if (cardW < 1024) return 118;
  return 138;
}

// Default path builder — uses SVG `A` (arc) commands. Compact and works
// in every browser EXCEPT desktop Safari's CSS `clip-path: path()`,
// which mis-interprets the sweep-flag and renders a warped/bulbous
// shape. Used on mobile and non-Safari desktop.
function buildHeroPathArcs(W: number, H: number, geo: HeroGeo): string {
  const { R, nr, nh } = geo;
  const minNotchW = 3 * nr;
  const maxNotchW = Math.max(minNotchW, W - R - nr);
  const notchW = Math.min(Math.max(geo.notchW, minNotchW), maxNotchW);
  const x1 = W - notchW;
  return [
    `M${R} 0`,
    `H${x1}`,
    `A${nr} ${nr} 0 0 1 ${x1 + nr} ${nr}`,
    `V${nh - nr}`,
    `A${nr} ${nr} 0 0 0 ${x1 + 2 * nr} ${nh}`,
    `H${W - nr}`,
    `A${nr} ${nr} 0 0 1 ${W} ${nh + nr}`,
    `V${H - R}`,
    `A${R} ${R} 0 0 1 ${W - R} ${H}`,
    `H${R}`,
    `A${R} ${R} 0 0 1 0 ${H - R}`,
    `V${R}`,
    `A${R} ${R} 0 0 1 ${R} 0`,
    "Z",
  ].join(" ");
}

// Bézier-only variant for desktop Safari — every 90° arc replaced with
// a cubic Bézier (visually identical, parsed correctly).
function buildHeroPathBeziers(W: number, H: number, geo: HeroGeo): string {
  const { R, nr, nh } = geo;
  const minNotchW = 3 * nr;
  const maxNotchW = Math.max(minNotchW, W - R - nr);
  const notchW = Math.min(Math.max(geo.notchW, minNotchW), maxNotchW);
  const x1 = W - notchW;
  const K = 0.5522847498; // (4/3) * tan(π/8) — the cubic-bezier circle constant.
  const kr = K * R;
  const kn = K * nr;
  return [
    `M${R} 0`,
    `H${x1}`,
    `C${x1 + kn} 0 ${x1 + nr} ${nr - kn} ${x1 + nr} ${nr}`,
    `V${nh - nr}`,
    `C${x1 + nr} ${nh - nr + kn} ${x1 + 2 * nr - kn} ${nh} ${x1 + 2 * nr} ${nh}`,
    `H${W - nr}`,
    `C${W - nr + kn} ${nh} ${W} ${nh + nr - kn} ${W} ${nh + nr}`,
    `V${H - R}`,
    `C${W} ${H - R + kr} ${W - R + kr} ${H} ${W - R} ${H}`,
    `H${R}`,
    `C${R - kr} ${H} 0 ${H - R + kr} 0 ${H - R}`,
    `V${R}`,
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
  slides: slidesProp,
  feature,
  navLinks = DEFAULT_NAV_LINKS,
  menuConfig,
}: HeroSectionProps = {}) {
  const NAV_LINKS = navLinks;

  // Normalise to a slide list. With no slides configured we synthesise a
  // single slide from the top-level props so the hero stays a plain hero.
  const slides: HeroSlide[] =
    slidesProp && slidesProp.length > 0
      ? slidesProp
      : [{ headline, body, ctaHref, backgroundKind, videoSrc, imageSrc, imageAlt }];

  const [active, setActive] = useState(0);
  const isSlider = slides.length > 1;
  const safeActive = active % slides.length;
  const activeSlide = slides[safeActive];

  const slideBackgroundKind = activeSlide.backgroundKind ?? "video";
  const showImage = slideBackgroundKind === "image" && !!activeSlide.imageSrc;

  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const copyWrapRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
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
  // Browser check is gated on desktop. On mobile we always render the
  // default arc-based path (mobile Safari handles it fine; mobile Chrome
  // is unaffected). On desktop we sniff Safari and swap to the cubic
  // Bézier path because desktop Safari's CSS `clip-path: path()`
  // mis-renders the arc commands.
  const [isDesktopSafari, setIsDesktopSafari] = useState(false);

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
    // Only run the Safari detection on desktop — mobile keeps the
    // default code path without any UA sniffing.
    if (!isDesktop) {
      setIsDesktopSafari(false);
      return;
    }
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent;
    // Safari but not Chrome / Edge / Firefox / Android (Chrome's UA
    // includes the literal word "Safari", so we exclude those engines).
    const isSafari =
      /^((?!chrome|crios|fxios|edg|android|opr).)*safari/i.test(ua);
    setIsDesktopSafari(isSafari);
  }, [isDesktop]);

  // Auto-advance the slider. Pauses for reduced-motion and when there is
  // only a single slide. Re-arms whenever the active index changes (whether
  // from the timer or a manual click), keeping the progress bar in sync.
  useEffect(() => {
    if (!isSlider || reducedMotion) return;
    const id = window.setTimeout(
      () => setActive((a) => (a + 1) % slides.length),
      SLIDE_DURATION,
    );
    return () => window.clearTimeout(id);
  }, [safeActive, isSlider, reducedMotion, slides.length]);

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
  // Desktop Safari needs the Bézier-only path; every other browser
  // (mobile Safari, mobile Chrome, desktop Chrome / Firefox / Edge)
  // uses the more compact arc-based path. The detection itself is
  // skipped on mobile — `isDesktopSafari` stays false there.
  const heroPath = isDesktopSafari
    ? buildHeroPathBeziers(cardSize.w, cardSize.h, heroGeo)
    : buildHeroPathArcs(cardSize.w, cardSize.h, heroGeo);
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
      if (bottomBarRef.current) {
        bottomBarRef.current.style.opacity = String(copyOpacity);
        bottomBarRef.current.style.transform = `translate3d(0, ${copyTranslateY}px, 0)`;
        bottomBarRef.current.style.pointerEvents = copyOpacity < 0.05 ? "none" : "";
      }
      if (heroWrapRef.current) {
        heroWrapRef.current.style.opacity = String(heroOverallOpacity);
      }
      if (tintRef.current) {
        // Add a deepening dark layer as we scroll into the video
        tintRef.current.style.opacity = String(0.38 + tintBoost);
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
                {/* Active slide background — keyed by index so a slide change
                    remounts the media and crossfades it in. */}
                <div key={safeActive} className="hero-slide-media absolute inset-0">
                  {showImage ? (
                    <Image
                      src={activeSlide.imageSrc!}
                      alt={activeSlide.imageAlt ?? ""}
                      fill
                      priority={safeActive === 0}
                      sizes="100vw"
                      quality={90}
                      className="hero-video object-cover"
                    />
                  ) : activeSlide.videoSrc ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      disableRemotePlayback
                      disablePictureInPicture
                      className="hero-video absolute inset-0 w-full h-full object-cover"
                    >
                      <source src={activeSlide.videoSrc} />
                    </video>
                  ) : null}
                </div>
              </div>

              {/* Brand tint — opacity bumps as we scroll deeper */}
              <div
                ref={tintRef}
                className="absolute inset-0"
                style={{ backgroundColor: "#000036", opacity: 0.38 }}
              />

              {/* Cinematic colour grade — a teal→green→navy wash that gives
                  the footage a graded, filmic tone. Plain (non-blend) overlay
                  so it never flickers while the card scales on scroll. */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(2,47,46,0.55) 0%, rgba(6,254,131,0.12) 50%, rgba(26,26,74,0.55) 100%)",
                }}
              />

              {/* Cinematic vignette — darkens the edges to draw the eye in. */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(120% 100% at 50% 42%, transparent 48%, rgba(0,0,22,0.55) 100%)",
                }}
              />

              {/* Top scrim — keeps nav legible */}
              <div className="absolute inset-x-0 top-0 h-[18%] bg-linear-to-b from-black/55 to-transparent" />

              {/* Bottom scrim — keeps headline legible */}
              <div className="absolute inset-x-0 bottom-0 h-[50%] bg-linear-to-t from-black/90 via-black/60 to-transparent" />
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
              className="absolute z-30 hidden md:flex items-center justify-end gap-6 lg:gap-9 will-change-[opacity,transform]"
              style={{
                // Sit flush to the card's right edge so the menu blob's
                // right side lines up with the hero video's right edge
                // (previously inset by the notch radius).
                right: 0,
                top: 0,
                height: "var(--hero-notch-h)",
                maxWidth: "var(--hero-notch-w)",
              }}
            >
              <nav data-page-header className="flex items-center gap-6 lg:gap-9 text-[13px] lg:text-[13.5px] font-semibold uppercase tracking-[0.14em] text-black whitespace-nowrap">
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
                data-page-header
                className="will-change-[opacity,transform] text-black"
              >
                <div
                  className="hero-anim-fade"
                  style={{ "--anim-delay": "0.5s" } as CSSProperties}
                >
                  <LanguageToggle className="text-[13px] lg:text-[13.5px] tracking-[0.14em]" />
                </div>
              </div>
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
              className="absolute bottom-0 left-0 z-10 px-8 lg:px-14 pb-52 lg:pb-72 max-w-4xl"
            >
              {/* Keyed by active slide so the copy re-animates on change,
                  while the scroll-driven fade stays on the stable parent. */}
              <div key={safeActive}>
                <h1
                  className="hero-anim font-display text-display-lg lg:text-display-xl font-semibold text-white tracking-[-0.03em] leading-[1.02]"
                  style={
                    { "--anim-delay": safeActive === 0 ? "0.65s" : "0.05s" } as CSSProperties
                  }
                >
                  {activeSlide.headline}
                </h1>
                {activeSlide.body ? (
                  <p
                    className="hero-anim mt-7 lg:mt-9 text-lg lg:text-xl text-white/70 max-w-md leading-[1.6]"
                    style={
                      { "--anim-delay": safeActive === 0 ? "0.78s" : "0.12s" } as CSSProperties
                    }
                  >
                    {activeSlide.body}
                  </p>
                ) : null}
                <div
                  className="hero-anim mt-8 lg:mt-10"
                  style={
                    { "--anim-delay": safeActive === 0 ? "0.9s" : "0.18s" } as CSSProperties
                  }
                >
                  {activeSlide.ctaHref ? (
                    <CtaLink
                      href={activeSlide.ctaHref}
                      className="inline-flex items-center rounded-round bg-error-500 px-5 py-2 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-[var(--ease-premium)] hover:bg-error-400"
                    >
                      Learn More
                    </CtaLink>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-round bg-error-500 px-5 py-2 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-[var(--ease-premium)] hover:bg-error-400"
                    >
                      Learn More
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom bar — slider progress (left) + feature card (right).
                Fades out on scroll alongside the headline copy. */}
            <div
              ref={bottomBarRef}
              className="absolute inset-x-0 bottom-0 z-20 px-8 lg:px-14 pb-10 lg:pb-14 flex items-end justify-between gap-6 will-change-[opacity,transform]"
            >
              {/* Left: a single preview of the active slide, above the
                  clickable progress toggles. The preview is exactly one
                  segment wide and carries a thin green border; the lines
                  are hairline-thin. Click any toggle to jump to a slide. */}
              {isSlider ? (
                <div
                  className="hero-anim-fade flex flex-col gap-3"
                  style={{ "--anim-delay": "1s" } as CSSProperties}
                >
                  {/* Outer wrapper slides horizontally so the preview sits
                      above the active segment (segment width + the 0.625rem
                      `gap-2.5`). The inner keyed div handles the crossfade. */}
                  <div
                    className="w-20 lg:w-24 transition-transform duration-700 ease-[var(--ease-emphasized)] motion-reduce:transition-none"
                    style={{
                      transform: `translateX(calc(${safeActive} * (100% + 0.625rem)))`,
                    }}
                  >
                    <div
                      key={safeActive}
                      className="hero-slide-media relative w-full aspect-5/3 overflow-hidden rounded-xs ring-[1.5px] ring-error-500"
                    >
                      {activeSlide.thumbnailSrc ?? activeSlide.imageSrc ? (
                        <Image
                          src={(activeSlide.thumbnailSrc ?? activeSlide.imageSrc)!}
                          alt={activeSlide.thumbnailAlt ?? ""}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="absolute inset-0 bg-white/10" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {slides.map((s, i) => (
                      <button
                        key={`${s.headline}-${i}`}
                        type="button"
                        onClick={() => setActive(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        aria-current={i === safeActive}
                        className="group flex h-3 w-20 lg:w-24 items-center focus-visible:outline-none"
                      >
                        <span className="relative block h-px w-full overflow-hidden rounded-full bg-white/35 transition-colors group-hover:bg-white/55">
                          <span
                            className="absolute inset-0 origin-left rounded-full bg-error-500"
                            style={
                              i < safeActive
                                ? { transform: "scaleX(1)" }
                                : i === safeActive
                                  ? reducedMotion
                                    ? { transform: "scaleX(1)" }
                                    : {
                                        transform: "scaleX(0)",
                                        animation: `hero-slider-fill ${SLIDE_DURATION}ms linear forwards`,
                                      }
                                  : { transform: "scaleX(0)" }
                            }
                          />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <span />
              )}

              {/* Right: fixed feature callout card — does not change with
                  the slider. */}
              {feature?.label ? (
                <FeatureCard
                  eyebrow={feature.eyebrow ?? "Feature"}
                  label={feature.label}
                  href={feature.href}
                  videoSrc={feature.videoSrc}
                  posterSrc={feature.posterSrc}
                  posterAlt={feature.posterAlt ?? ""}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  eyebrow,
  label,
  href,
  videoSrc,
  posterSrc,
  posterAlt,
}: {
  eyebrow: string;
  label: string;
  href?: string;
  videoSrc?: string;
  posterSrc?: string;
  posterAlt?: string;
}) {
  const inner = (
    <>
      <div className="flex flex-col justify-between py-1">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-error-500/80">
          {eyebrow}
        </span>
        <span className="font-display text-base lg:text-lg font-semibold leading-tight text-error-500">
          {label}
        </span>
      </div>
      <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-xs bg-black/30">
        {videoSrc ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={posterSrc}
            disableRemotePlayback
            disablePictureInPicture
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={videoSrc} />
          </video>
        ) : posterSrc ? (
          <Image
            src={posterSrc}
            alt={posterAlt ?? ""}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-7 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-3.5 w-3.5 fill-white" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </div>
    </>
  );

  const className =
    "hero-anim-fade group hidden sm:flex items-stretch gap-5 rounded-md border border-error-500/55 bg-black/20 p-3 backdrop-blur-md transition-colors hover:border-error-500/90";
  const style = { "--anim-delay": "1.05s" } as CSSProperties;

  if (href) {
    return (
      <CtaLink href={href} className={className} style={style} aria-label={`${eyebrow}: ${label}`}>
        {inner}
      </CtaLink>
    );
  }
  return (
    <div className={className} style={style}>
      {inner}
    </div>
  );
}
