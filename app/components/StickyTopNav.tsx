"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";
import type { MenuConfig } from "./Menu";
import MenuLauncher from "./MenuLauncher";
import SearchLauncher from "./SearchLauncher";
import { hasLocale, localizedHref, toLocale } from "@/app/lib/locale";

/** Strip a leading `/en|/es|…` segment so route comparisons stay locale-agnostic. */
function stripLocale(pathname: string): string {
  const segs = pathname.split("/");
  if (hasLocale(segs[1])) segs.splice(1, 1);
  const stripped = segs.join("/");
  return stripped === "" ? "/" : stripped;
}

export type StickyNavLink = {
  label: string;
  href: string;
  disabled?: boolean;
};

const DEFAULT_NAV_LINKS: StickyNavLink[] = [
  { label: "About", href: "/about" },
  { label: "Initiatives", href: "/initiatives" },
];

const FALLBACK_BG = "#eafbf1"; // matches bg-error-25 in globals.css

/**
 * Pages that mount `<HeroSection />`. Used to determine `hasHero`
 * deterministically during SSR — keeps the server-rendered nav state in
 * sync with the client, preventing a flash of the default state on
 * hydration. Update this list when adding heroes to new routes.
 */
const HERO_PATHS = new Set<string>(["/"]);

/**
 * Hero background colour per route (locale-stripped path). The live sampler
 * only reads the section under the nav *after* the first paint, so on a hard
 * load — or the moment a client-side navigation commits — the nav would briefly
 * show the light fallback before correcting itself. That reads as the nav
 * flashing the wrong colour over a dark hero. Seeding the initial / reset
 * background from this map makes the very first paint match the hero beneath
 * it. Routes not listed fall back to the light page background. `dark` drives
 * the text/icon contrast flip. Keep these in sync with each page's hero bg
 * (`#01190d` = `bg-error-950`).
 */
const HERO_NAV_BG: Record<string, { bg: string; dark: boolean }> = {
  "/careers": { bg: "#01190d", dark: true },
  "/about": { bg: "#01190d", dark: true },
  "/impact": { bg: "#01190d", dark: true },
  "/sectors": { bg: "#01190d", dark: true },
  "/initiatives": { bg: "#01190d", dark: true },
  "/reports": { bg: "#01190d", dark: true },
  "/investors": { bg: "#01190d", dark: true },
  "/priorities": { bg: "#01190d", dark: true },
};

/** Initial nav background + contrast for a route, before the live sampler runs. */
function initialNavTheme(routePath: string): { bg: string; dark: boolean } {
  return HERO_NAV_BG[routePath] ?? { bg: FALLBACK_BG, dark: false };
}

/** Parse `rgb()` / `rgba()` into [r, g, b, a]. */
function parseRgb(input: string): [number, number, number, number] | null {
  const m = input.match(/^rgba?\(([^)]+)\)$/i);
  if (!m) return null;
  const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
  if (parts.length < 3 || parts.some(Number.isNaN)) return null;
  return [parts[0], parts[1], parts[2], parts[3] ?? 1];
}

/** Convert `#rrggbb` or `#rgb` to `rgb(...)` so `parseRgb` can read it. */
function toRgbString(color: string): string {
  if (color.startsWith("rgb")) return color;
  const hex = color.replace("#", "");
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return color;
}

/** Relative luminance per WCAG. 0 = black, 1 = white. */
function luminance(r: number, g: number, b: number): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/**
 * Top navigation bar.
 *
 *  - On pages with a hero (`[data-page-hero]`) the bar hides on scroll-down,
 *    reveals on scroll-up, and stays hidden over the hero itself.
 *  - On pages without a hero the bar is always visible at the top.
 *
 * Background colour is sampled live each frame from whatever element is
 * sitting under the nav (via `document.elementsFromPoint` +
 * `getComputedStyle`). Text / icon contrast flips automatically based on
 * the sampled colour's luminance. Sections can still set `data-nav-bg`
 * to force a specific colour — the sampler honours it if found.
 */
type Props = {
  navLinks?: StickyNavLink[];
  menuConfig?: MenuConfig;
};

export default function StickyTopNav({
  navLinks = DEFAULT_NAV_LINKS,
  menuConfig,
}: Props = {}) {
  const pathname = usePathname() ?? "/";
  const params = useParams();
  const lang = toLocale(params?.lang as string | string[] | undefined);
  // Route comparisons use the locale-stripped path so `/en`, `/es/about`, etc.
  // resolve like `/`, `/about`.
  const routePath = stripLocale(pathname);
  // Resolve `hasHero` from the route up front — `usePathname` is valid
  // during SSR so the initial server-rendered nav matches what the user
  // will see on hydration: hidden over hero pages, visible on non-hero
  // pages. No state flip, no flash.
  const initialHasHero = HERO_PATHS.has(routePath);
  // Seed the nav colour from the route's known hero bg so the first paint
  // (SSR + hydration) matches the section underneath, not the light fallback.
  const initialTheme = initialNavTheme(routePath);
  // `ready` gates the transition classes until the initial state has
  // settled (first detect pass). Without this gate the colour change
  // from the fallback bg to the sampled bg would animate visibly on the
  // first paint.
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(!initialHasHero);
  const [hasHero, setHasHero] = useState(initialHasHero);
  const [overHero, setOverHero] = useState(initialHasHero);
  const [bg, setBg] = useState<string>(initialTheme.bg);
  const [isDark, setIsDark] = useState(initialTheme.dark);
  // Tracks whether the page has scrolled past the top. Inner (non-hero)
  // pages render an enlarged logo while pinned at the top, then shrink it
  // to the default size once the user scrolls.
  const [scrolled, setScrolled] = useState(false);
  const visibleRef = useRef(!initialHasHero);
  const scrolledRef = useRef(false);
  const overHeroRef = useRef(initialHasHero);
  const bgRef = useRef<string>(initialTheme.bg);
  const isDarkRef = useRef<boolean>(initialTheme.dark);
  const lastYRef = useRef(0);
  const surfaceRef = useRef<HTMLDivElement>(null);

  // Reset visibility/hero state synchronously when the route changes
  // (client-side nav). Without this, the existing `[pathname]` effect
  // fires *after* the new page has already painted with the previous
  // route's `visible`/`hasHero`/`overHero` — you get one frame of the
  // nav in its old configuration (e.g. still frosted-over-hero on a
  // page with no hero) before it snaps. React's "setState during
  // render" bail-out pattern updates the values without a stale frame.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    const nextRoutePath = stripLocale(pathname);
    const nextHasHero = HERO_PATHS.has(nextRoutePath);
    const nextTheme = initialNavTheme(nextRoutePath);
    setHasHero(nextHasHero);
    setVisible(!nextHasHero);
    setOverHero(nextHasHero);
    setScrolled(false);
    setBg(nextTheme.bg);
    setIsDark(nextTheme.dark);
    // Pause CSS transitions for the brief window between this reset
    // and the dynamic detect pass — otherwise the nav visibly animates
    // its colour/translate from the old route's values to the new
    // route's values on every navigation. The pathname effect's
    // double-rAF re-enables transitions after the new state settles.
    setReady(false);
    // Refs are kept in sync by the `[pathname]` effect below — React
    // 19 disallows ref mutation during render.
  }

  useEffect(() => {
    const heroEl = document.querySelector("[data-page-hero]");
    const heroExists = !!heroEl;
    setHasHero(heroExists);
    if (heroExists) {
      setVisible(false);
      visibleRef.current = false;
    } else {
      setVisible(true);
      visibleRef.current = true;
    }
    // Keep tracking refs in sync with the route-change state reset — seed
    // from the route's known hero bg so the sampler refines from the right
    // baseline instead of snapping up from the light fallback.
    const routeTheme = initialNavTheme(stripLocale(pathname));
    overHeroRef.current = heroExists;
    bgRef.current = routeTheme.bg;
    isDarkRef.current = routeTheme.dark;

    let raf = 0;
    lastYRef.current = window.scrollY;

    // Mobile browser chrome (iOS status bar, Android URL bar) is tinted
    // via the `<meta name="theme-color">` tag. Keeping its content in
    // sync with whatever colour the nav is showing makes the status area
    // read as a seamless extension of the page on mobile.
    const themeMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    // Snapshot the original theme-color so we can restore it on cleanup.
    // Without this, a bfcache snapshot of an in-flight sample outlives
    // its page and the mobile chrome looks mismatched on Back.
    const originalThemeColor = themeMeta?.getAttribute("content") ?? null;
    let lastThemeColor: string | null = null;
    const setThemeColor = (color: string) => {
      if (!themeMeta || color === lastThemeColor) return;
      lastThemeColor = color;
      themeMeta.setAttribute("content", color);
    };

    const detect = (): { color: string; dark: boolean } | null => {
      const surface = surfaceRef.current;
      if (!surface) return null;

      // Briefly disable pointer events so the nav itself isn't picked up
      // as the topmost element at the sample points. Wrapped in
      // try/finally — if anything below throws (e.g. a third-party
      // element with an exotic computed style), we must never leave the
      // surface unclickable; that state would persist into bfcache.
      const prevPE = surface.style.pointerEvents;
      surface.style.pointerEvents = "none";

      try {
        const navRect = surface.getBoundingClientRect();
        // Sample just below the nav so we read the section underneath, not
        // the nav itself or a scrim sitting at its edge.
        const sampleY = Math.max(1, navRect.bottom + 2);
        const samples = [
          window.innerWidth * 0.5,
          window.innerWidth * 0.18,
          window.innerWidth * 0.82,
        ];

        let chosen: { color: string; dark: boolean } | null = null;
        outer: for (const x of samples) {
          const els = document.elementsFromPoint(x, sampleY);
          for (const el of els) {
            if (!(el instanceof HTMLElement)) continue;
            if (surface.contains(el)) continue;

            // Explicit override wins.
            const override = el.closest<HTMLElement>("[data-nav-bg]");
            if (override?.dataset.navBg) {
              const color = override.dataset.navBg;
              const parsed = parseRgb(toRgbString(color));
              const dark = parsed
                ? luminance(parsed[0], parsed[1], parsed[2]) < 0.5
                : false;
              chosen = { color, dark };
              break outer;
            }

            const cs = window.getComputedStyle(el);
            const parsed = parseRgb(cs.backgroundColor);
            if (parsed && parsed[3] > 0.5) {
              const dark = luminance(parsed[0], parsed[1], parsed[2]) < 0.5;
              chosen = { color: cs.backgroundColor, dark };
              break outer;
            }
          }
        }

        return chosen;
      } finally {
        surface.style.pointerEvents = prevPE;
      }
    };

    const update = () => {
      const y = window.scrollY;

      // Shrink the enlarged inner-page logo once the user leaves the very
      // top of the page. Small threshold so the transition triggers early.
      const nextScrolled = y > 12;
      if (nextScrolled !== scrolledRef.current) {
        scrolledRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }

      // Sections marked `[data-hide-nav]` (e.g. the immersive Sectors
      // pinned diagram) take over the viewport — the nav must hide
      // while any of them overlap the nav's vertical range, otherwise
      // it covers the node labels and breaks the cinematic effect.
      const surfaceForRange = surfaceRef.current;
      const navBottomForRange = surfaceForRange
        ? surfaceForRange.getBoundingClientRect().bottom
        : 0;
      let suppressForSection = false;
      const hideEls = document.querySelectorAll<HTMLElement>(
        "[data-hide-nav]"
      );
      for (const el of hideEls) {
        const r = el.getBoundingClientRect();
        if (r.top < navBottomForRange + 2 && r.bottom > 0) {
          suppressForSection = true;
          break;
        }
      }

      if (heroExists) {
        const dy = y - lastYRef.current;
        const pastHero = y > window.innerHeight * 0.5;
        let nextVisible = visibleRef.current;
        if (!pastHero) {
          nextVisible = false;
        } else if (dy < -2) {
          nextVisible = true;
        } else if (dy > 2) {
          nextVisible = false;
        }
        if (suppressForSection) nextVisible = false;
        lastYRef.current = y;
        if (nextVisible !== visibleRef.current) {
          visibleRef.current = nextVisible;
          setVisible(nextVisible);
        }
      } else {
        // Non-hero pages: the bar is normally always visible, but a
        // `[data-hide-nav]` section can still override that.
        const nextVisible = !suppressForSection;
        if (nextVisible !== visibleRef.current) {
          visibleRef.current = nextVisible;
          setVisible(nextVisible);
        }
      }

      // Is the nav currently sitting over the hero? If so we use a
      // frosted-glass treatment instead of sampling the dark video
      // background. The frost lets the video texture show through with
      // a soft blur — much sleeker than a solid navy block.
      const surfaceEl = surfaceRef.current;
      const navBottom = surfaceEl
        ? surfaceEl.getBoundingClientRect().bottom
        : 0;
      const heroRect = heroEl?.getBoundingClientRect();
      const nextOverHero =
        !!heroRect && heroRect.bottom > navBottom + 4;
      if (nextOverHero !== overHeroRef.current) {
        overHeroRef.current = nextOverHero;
        setOverHero(nextOverHero);
      }

      // Over the hero, keep the mobile status bar tinted with the site's
      // mint so the time area reads as part of the page surrounding the
      // hero card, not a white strip above it.
      if (nextOverHero) {
        setThemeColor(FALLBACK_BG);
      }

      // Only sample the page background when the nav is *not* over the
      // hero — over the hero we always use the frost.
      if (!nextOverHero) {
        const detected = detect();
        if (detected) {
          if (detected.color !== bgRef.current) {
            bgRef.current = detected.color;
            setBg(detected.color);
          }
          // Match the mobile status-bar tint to whatever the nav is
          // sampling, so the time/battery area extends the page colour.
          setThemeColor(detected.color);
          if (detected.dark !== isDarkRef.current) {
            isDarkRef.current = detected.dark;
            setIsDark(detected.dark);
          }
        }
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    // After the first state-resolution render flushes, flip `ready` so
    // future state changes pick up the transition classes. Double rAF
    // makes sure the browser has painted the resolved state before we
    // enable transitions.
    const readyRaf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setReady(true));
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(readyRaf);
      if (themeMeta && originalThemeColor !== null) {
        themeMeta.setAttribute("content", originalThemeColor);
      }
    };
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return routePath === "/";
    return routePath === href || routePath.startsWith(`${href}/`);
  };

  const txt = overHero ? "text-white" : isDark ? "text-white" : "text-primary-500";

  // Inner (non-hero) pages show an enlarged logo while pinned at the top;
  // it scales back down to the default size (100px) once the user scrolls.
  const enlarged = !hasHero && !scrolled;

  return (
    <div
      data-page-header
      aria-hidden={!visible}
      // `transform-gpu` + `will-change-transform`: this bar toggles its
      // `translateY` on scroll-up/down, so keep it on its own compositor
      // layer — the show/hide is then a pure composited transform with no
      // layout or paint per scroll frame.
      className={`${hasHero ? "fixed" : "sticky"} top-0 inset-x-0 z-40 transform-gpu will-change-transform ${
        ready
          ? "transition-transform duration-500 ease-[var(--ease-premium)]"
          : ""
      } ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div
        ref={surfaceRef}
        // `isolate` gives the backdrop-filter its own stacking context so
        // its repaint stays bounded to this thin bar rather than compositing
        // against the whole page.
        className={`isolate backdrop-blur-md backdrop-saturate-150 ${
          ready ? "transition-colors duration-300 ease-out" : ""
        } ${txt}`}
        style={{
          backgroundColor: overHero ? "rgba(0, 0, 54, 0.35)" : bg,
        }}
      >
        <div className="flex items-center justify-between gap-5 px-6 md:px-10 lg:px-14 h-16 lg:h-20">
          <Link
            href={localizedHref(lang, "/")}
            aria-label="BPI home"
            className="inline-flex items-center shrink-0"
          >
            {/* Base size is the enlarged size; scale down to the default
                100px (100/140 ≈ 0.714) once scrolled. Transform-based so the
                resize is a smooth, composited transition anchored to the
                left edge. */}
            <Logo
              size={140}
              className={`block origin-left transform-gpu will-change-transform ${
                ready
                  ? "transition-transform duration-700 ease-[var(--ease-emphasized)]"
                  : ""
              } ${enlarged ? "scale-100" : "scale-[0.714]"}`}
            />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-8 lg:gap-11"
          >
            {navLinks.map((link) => {
              if (link.disabled) {
                return (
                  <span
                    key={link.href + link.label}
                    aria-disabled="true"
                    className="text-[11.5px] font-medium tracking-[0.01em] py-1 opacity-40 cursor-not-allowed select-none"
                  >
                    {link.label}
                  </span>
                );
              }
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href + link.label}
                  href={localizedHref(lang, link.href)}
                  aria-current={active ? "page" : undefined}
                  className="group relative text-[11.5px] font-medium tracking-[0.01em] py-1"
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={`absolute -bottom-0.5 left-0 h-px bg-current transition-all duration-300 ease-out ${
                      active
                        ? "w-full opacity-100"
                        : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3.5 lg:gap-4 shrink-0">
            <SearchLauncher className="hidden md:inline-flex" />

            <LanguageToggle className="hidden md:inline-block" />

            <MenuLauncher size={70} menuConfig={menuConfig} />
          </div>
        </div>
      </div>
    </div>
  );
}

