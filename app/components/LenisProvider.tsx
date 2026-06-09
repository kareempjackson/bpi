"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

type ScrollToOptions = {
  duration?: number;
  immediate?: boolean;
  /** Prevent user scroll input from interrupting until the target is reached. */
  lock?: boolean;
  /** Scroll even if Lenis is currently stopped. */
  force?: boolean;
};

type LenisControls = {
  stop: () => void;
  start: () => void;
  /**
   * Re-align Lenis with the browser's current `window.scrollY` and
   * recompute its internal dimensions. Call after a bfcache restore
   * (the browser snaps `scrollY` back to where the user was, but Lenis
   * still holds its pre-cache target/actual values; the next wheel
   * event would otherwise yank the page to a stale offset).
   */
  sync: () => void;
  /**
   * Smoothly (or immediately) scroll to an absolute document Y position
   * through Lenis, so the motion uses the same easing as wheel scrolls.
   * Falls back to native `window.scrollTo` when Lenis is absent
   * (e.g. reduced-motion).
   */
  scrollTo: (target: number, opts?: ScrollToOptions) => void;
};

const LenisContext = createContext<LenisControls>({
  stop: () => {},
  start: () => {},
  sync: () => {},
  scrollTo: () => {},
});

export const useLenis = () => useContext(LenisContext);

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const isFirstPathRef = useRef(true);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    // `duration` + custom easing produces a more physically-modeled
    // glide than the simpler `lerp` mode. easeOutExpo (`1 - 2^(-10t)`)
    // is the curve Linear/Vercel-style sites converge on: fast take-off,
    // long graceful settle.
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    const startRaf = () => {
      if (!rafId) rafId = requestAnimationFrame(raf);
    };
    const stopRaf = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
    startRaf();

    // Pause the rAF loop when the tab is hidden so background tabs don't
    // burn CPU/battery on scroll smoothing nobody is watching. On return,
    // resize+sync so Lenis catches up with any scroll the browser
    // committed while we were paused.
    const onVisibility = () => {
      if (document.hidden) {
        stopRaf();
      } else {
        lenis.resize();
        startRaf();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Anchor-link smooth scroll. Intercept clicks on in-page hash links
    // and let Lenis animate to the target with the same easing as wheel
    // scrolls — keeps the feel consistent. Skip when the click has a
    // modifier (cmd/ctrl/shift) so users can still open in new tabs.
    const onAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      // Update the URL hash without re-scrolling natively.
      history.pushState(null, "", href);
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      stopRaf();
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("click", onAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Sync Lenis with the browser's scroll position whenever the route
  // changes. Don't *force* the page to the top — let Next.js decide
  // (top on forward / push, restored position on back / forward
  // history pop). Without this sync, Lenis keeps its target/actual
  // from the previous route and the first wheel/touch event after
  // navigation yanks the page back to the old offset.
  //
  // Skip the very first mount so we don't override the user's
  // initial scroll position (e.g. a refresh at a deep-linked offset).
  useEffect(() => {
    if (isFirstPathRef.current) {
      isFirstPathRef.current = false;
      return;
    }
    const lenis = lenisRef.current;
    if (!lenis) return;
    // rAF so Next.js's own scroll handling has committed first.
    const id = requestAnimationFrame(() => {
      lenis.resize();
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const stop = useCallback(() => lenisRef.current?.stop(), []);
  const start = useCallback(() => lenisRef.current?.start(), []);
  const sync = useCallback(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.resize();
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  }, []);
  const scrollTo = useCallback((target: number, opts?: ScrollToOptions) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, {
        duration: opts?.duration,
        immediate: opts?.immediate,
        lock: opts?.lock,
        force: opts?.force,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      return;
    }
    window.scrollTo({
      top: target,
      behavior: opts?.immediate ? "auto" : "smooth",
    });
  }, []);

  // Memoise so consumers depending on the context value (e.g.
  // `BfcacheReset`'s effect with `[sync]` deps) don't re-run their
  // effects on every parent render.
  const value = useMemo<LenisControls>(
    () => ({ stop, start, sync, scrollTo }),
    [stop, start, sync, scrollTo]
  );

  return (
    <LenisContext.Provider value={value}>{children}</LenisContext.Provider>
  );
}
