"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import MenuLauncher from "./MenuLauncher";

type NavLink = { label: string; href: string };

const NAV_LINKS: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Ecosystem", href: "/ecosystem" },
  { label: "Initiatives", href: "/initiatives" },
];

const FALLBACK_BG = "#cdffe6"; // matches bg-error-25 in globals.css

/**
 * Pages that mount `<HeroSection />`. Used to determine `hasHero`
 * deterministically during SSR — keeps the server-rendered nav state in
 * sync with the client, preventing a flash of the default state on
 * hydration. Update this list when adding heroes to new routes.
 */
const HERO_PATHS = new Set<string>(["/"]);

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
export default function StickyTopNav() {
  const pathname = usePathname() ?? "/";
  // Resolve `hasHero` from the route up front — `usePathname` is valid
  // during SSR so the initial server-rendered nav matches what the user
  // will see on hydration: hidden over hero pages, visible on non-hero
  // pages. No state flip, no flash.
  const initialHasHero = HERO_PATHS.has(pathname);
  // `ready` gates the transition classes until the initial state has
  // settled (first detect pass). Without this gate the colour change
  // from the fallback bg to the sampled bg would animate visibly on the
  // first paint.
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(!initialHasHero);
  const [hasHero, setHasHero] = useState(initialHasHero);
  const [overHero, setOverHero] = useState(initialHasHero);
  const [bg, setBg] = useState<string>(FALLBACK_BG);
  const [isDark, setIsDark] = useState(false);
  const visibleRef = useRef(!initialHasHero);
  const overHeroRef = useRef(initialHasHero);
  const bgRef = useRef<string>(FALLBACK_BG);
  const isDarkRef = useRef<boolean>(false);
  const lastYRef = useRef(0);
  const surfaceRef = useRef<HTMLDivElement>(null);

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

    let raf = 0;
    lastYRef.current = window.scrollY;

    // Mobile browser chrome (iOS status bar, Android URL bar) is tinted
    // via the `<meta name="theme-color">` tag. Keeping its content in
    // sync with whatever colour the nav is showing makes the status area
    // read as a seamless extension of the page on mobile.
    const themeMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
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
      // as the topmost element at the sample points.
      const prevPE = surface.style.pointerEvents;
      surface.style.pointerEvents = "none";

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

      surface.style.pointerEvents = prevPE;
      return chosen;
    };

    const update = () => {
      const y = window.scrollY;

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
        lastYRef.current = y;
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

      // Over the hero, the nav uses a frosted navy tint — mirror that on
      // the mobile status bar so the time area reads as part of the
      // hero card, not a white strip above it.
      if (nextOverHero) {
        setThemeColor("#000036");
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
    };
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const txt = overHero ? "text-white" : isDark ? "text-white" : "text-primary-500";

  return (
    <div
      data-page-header
      aria-hidden={!visible}
      className={`${hasHero ? "fixed" : "sticky"} top-0 inset-x-0 z-40 ${
        ready
          ? "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          : ""
      } ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div
        ref={surfaceRef}
        className={`backdrop-blur-md backdrop-saturate-150 ${
          ready ? "transition-colors duration-300 ease-out" : ""
        } ${txt}`}
        style={{
          backgroundColor: overHero ? "rgba(0, 0, 54, 0.35)" : bg,
        }}
      >
        <div className="flex items-center justify-between gap-5 px-6 md:px-10 lg:px-14 h-16 lg:h-20">
          <a
            href="/"
            aria-label="BPI home"
            className="inline-flex items-center shrink-0"
          >
            <Logo size={100} className="block" />
          </a>

          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-8 lg:gap-11"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
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
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3.5 lg:gap-4 shrink-0">
            <button
              type="button"
              aria-label="Search"
              className="group/search hidden md:inline-flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-70 hover:scale-110 active:scale-95 motion-reduce:transform-none focus-visible:outline-none focus-visible:opacity-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4.25 h-4.25"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>

            <LanguageToggle />

            <MenuLauncher size={70} />
          </div>
        </div>
      </div>
    </div>
  );
}

type LanguageCode = "EN" | "ES" | "FR" | "PT" | "NL";
type Language = { code: LanguageCode; label: string };

const LANGUAGES: Language[] = [
  { code: "EN", label: "English" },
  { code: "ES", label: "Español" },
  { code: "FR", label: "Français" },
  { code: "PT", label: "Português" },
  { code: "NL", label: "Nederlands" },
];

function LanguageToggle() {
  const [lang, setLang] = useState<LanguageCode>("EN");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="hidden md:inline-block relative text-[11.5px] font-medium tracking-[0.06em] uppercase"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="group inline-flex items-center gap-1.5 py-1 px-0.5 transition-opacity duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-70 focus-visible:outline-none focus-visible:opacity-100"
      >
        <span>{lang}</span>
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-3 h-3 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden
        >
          <path d="m3 4.5 3 3 3-3" />
        </svg>
      </button>

      <div
        className={`absolute right-0 mt-3 min-w-44 origin-top-right transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-[0.98] -translate-y-1 pointer-events-none"
        }`}
      >
        <ul
          role="listbox"
          aria-label="Languages"
          className="overflow-hidden rounded-xl border border-primary-500/8 bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_-24px_rgba(0,0,54,0.25)] text-primary-500 py-1.5"
        >
          {LANGUAGES.map((l) => {
            const selected = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className="group/lang relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-200 hover:bg-primary-500/4 focus-visible:bg-primary-500/4 focus-visible:outline-none"
                >
                  <span className="font-semibold tracking-[0.12em] text-[10.5px] w-7 shrink-0">
                    {l.code}
                  </span>
                  <span
                    className={`normal-case tracking-[0.005em] text-[13px] transition-colors duration-200 ${
                      selected ? "text-primary-500" : "text-primary-500/45"
                    }`}
                  >
                    {l.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
