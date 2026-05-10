"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import ArrowRight from "./ArrowRight";
import Button from "./Button";
import Logo from "./Logo";
import MenuLauncher from "./MenuLauncher";

const HERO_SHAPE_PATH =
  "M930.407 0C937.54 2.56009e-05 944.381 2.78212 949.425 7.73438C954.469 12.6868 957.303 19.4044 957.303 26.4082V48.0488C957.303 65.7218 971.63 80.0488 989.303 80.0488H1385.1L1385.77 80.0566C1392.66 80.2245 1399.24 82.9855 1404.12 87.7832C1409.17 92.7355 1412 99.4525 1412 106.456V972C1412 998.51 1390.51 1020 1364 1020H48C21.4903 1020 5.0742e-07 998.51 0 972V48C0 21.4903 21.4903 1.07108e-06 48 0H930.407Z";

const VIDEO_SRC = "/videos/Procur%20%20Motion%20animation%20V3%20SD.mp4";

const HERO_GEO = {
  vbW: 1412,
  vbH: 1020,
  notchRightX: 1385,
  notchLeftX: 989,
  notchBottomY: 80,
  logoLeftX: 48,
} as const;

const heroVars = {
  "--notch-right-pct": `${
    ((HERO_GEO.vbW - HERO_GEO.notchRightX) / HERO_GEO.vbW) * 100
  }%`,
  "--notch-shelf-h-pct": `${(HERO_GEO.notchBottomY / HERO_GEO.vbH) * 100}%`,
  "--notch-shelf-w-pct": `${
    ((HERO_GEO.notchRightX - HERO_GEO.notchLeftX) / HERO_GEO.vbW) * 100
  }%`,
  "--logo-left-pct": `${(HERO_GEO.logoLeftX / HERO_GEO.vbW) * 100}%`,
} as CSSProperties;

const NAV_LINKS = [
  { label: "ECOSYSTEM", href: "#ecosystem" },
  { label: "ABOUT", href: "#about" },
  { label: "INITIATIVE", href: "#initiative" },
];

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const local = (p: number, start: number, end: number) =>
  clamp01((p - start) / (end - start));

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const copyWrapRef = useRef<HTMLDivElement>(null);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      {/* Hidden SVG defining the notched clip shape (referenced via CSS clip-path) */}
      <svg
        width="0"
        height="0"
        aria-hidden
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <defs>
          <clipPath id="hero-clip-bbox" clipPathUnits="objectBoundingBox">
            <path
              d={HERO_SHAPE_PATH}
              transform={`scale(${1 / HERO_GEO.vbW} ${1 / HERO_GEO.vbH})`}
            />
          </clipPath>
        </defs>
      </svg>

      <section
        ref={sectionRef}
        className="relative bg-error-25"
        style={pinned ? { height: "180vh" } : undefined}
      >
        <div
          ref={heroWrapRef}
          className={
            pinned
              ? "sticky top-0 h-dvh overflow-hidden p-3 lg:p-4"
              : "h-dvh overflow-hidden p-3 lg:p-4"
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
                  clipPath: "url(#hero-clip-bbox)",
                  WebkitClipPath: "url(#hero-clip-bbox)",
                  transformOrigin: "center",
                  backgroundColor: "#000036",
                  "--anim-delay": "0s",
                } as CSSProperties
              }
            >
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
                <source src={VIDEO_SRC} type="video/mp4" />
              </video>

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
              data-page-header
              className="absolute z-20 hero-anim flex items-center"
              style={
                {
                  left: "var(--logo-left-pct)",
                  top: 0,
                  height: "var(--notch-shelf-h-pct)",
                  "--anim-delay": "0.15s",
                } as CSSProperties
              }
            >
              <Logo size={124} className="text-white" />
            </div>

            <div
              className="absolute z-30 hidden md:flex items-center justify-end gap-7 lg:gap-9"
              style={{
                right: "var(--notch-right-pct)",
                top: 0,
                height: "var(--notch-shelf-h-pct)",
                maxWidth: "var(--notch-shelf-w-pct)",
              }}
            >
              <nav data-page-header className="flex items-center gap-7 lg:gap-9 text-[11px] font-semibold uppercase tracking-[0.14em] text-black">
                {NAV_LINKS.map((link, i) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="hero-anim hover:opacity-60 transition-opacity duration-200"
                    style={
                      {
                        "--anim-delay": `${0.25 + i * 0.07}s`,
                      } as CSSProperties
                    }
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div
                className="hero-anim-fade"
                style={{ "--anim-delay": "0.55s" } as CSSProperties}
              >
                <MenuLauncher size={104} />
              </div>
            </div>

            <div
              className="absolute top-3 right-3 z-30 md:hidden hero-anim-fade"
              style={{ "--anim-delay": "0.45s" } as CSSProperties}
            >
              <MenuLauncher size={84} />
            </div>

            <div
              ref={copyWrapRef}
              className="absolute bottom-0 left-0 z-10 px-8 lg:px-14 pb-20 lg:pb-28 max-w-2xl"
            >
              <h1
                className="hero-anim font-display text-display-md lg:text-display-lg font-medium text-white tracking-[-0.03em] leading-[1.02]"
                style={{ "--anim-delay": "0.65s" } as CSSProperties}
              >
                We are building the pharmaceutical infrastructure Barbados and
                its region deserve.
              </h1>
              <div className="mt-7 lg:mt-9 flex items-center gap-6">
                <p
                  className="hero-anim text-sm text-white/70 max-w-sm leading-[1.6]"
                  style={{ "--anim-delay": "0.78s" } as CSSProperties}
                >
                  A manufacturer. A regulator. A regional supply chain. A model
                  for small states.
                </p>
                <div
                  className="hero-anim shrink-0"
                  style={{ "--anim-delay": "0.9s" } as CSSProperties}
                >
                  <Button
                    variant="primary"
                    iconOnly="md"
                    aria-label="Learn more"
                  >
                    <ArrowRight />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
