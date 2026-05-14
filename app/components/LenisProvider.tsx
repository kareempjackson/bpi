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
};

const LenisContext = createContext<LenisControls>({
  stop: () => {},
  start: () => {},
  sync: () => {},
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

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
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

  // Memoise so consumers depending on the context value (e.g.
  // `BfcacheReset`'s effect with `[sync]` deps) don't re-run their
  // effects on every parent render.
  const value = useMemo<LenisControls>(
    () => ({ stop, start, sync }),
    [stop, start, sync]
  );

  return (
    <LenisContext.Provider value={value}>{children}</LenisContext.Provider>
  );
}
