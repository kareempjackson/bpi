"use client";

import { useEffect } from "react";

/**
 * Single global controller for image parallax.
 *
 * - Watches every [data-parallax] element.
 * - Uses IntersectionObserver to track which elements are near the
 *   viewport; only those animate. Off-screen elements have zero
 *   scripting cost.
 * - On scroll, translates each in-view element vertically based on its
 *   center's distance from the viewport center, multiplied by
 *   data-parallax (speed). Speed is clamped to [-0.35, 0.35].
 * - Writes `transform` directly to inline style — no CSS-variable
 *   indirection, one style recalc per element per frame.
 * - Pauses rAF entirely when the tab is hidden.
 *
 * Authoring pattern: wrap the parallax target in a clipping container
 * with overflow-hidden, and oversize the parallax element by ~10% so
 * edges stay covered while it drifts.
 */
export default function ParallaxController() {
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    let raf = 0;
    let lastY = -Infinity;
    const active = new Set<HTMLElement>();
    const speeds = new WeakMap<HTMLElement, number>();

    const clampSpeed = (n: number) => Math.max(-0.35, Math.min(0.35, n));
    const readSpeed = (el: HTMLElement): number => {
      const cached = speeds.get(el);
      if (cached !== undefined) return cached;
      const parsed = parseFloat(el.dataset.parallax || "0.12");
      const v = clampSpeed(Number.isFinite(parsed) ? parsed : 0.12);
      speeds.set(el, v);
      return v;
    };

    const tick = () => {
      raf = 0;
      const y = window.scrollY;
      // Skip if scroll hasn't actually moved (e.g. resize listener fire).
      if (Math.abs(y - lastY) < 1 && active.size === 0) return;
      lastY = y;
      const vh = window.innerHeight;
      const center = vh / 2;
      // Single rAF, all reads then all writes — batched layout.
      const writes: Array<[HTMLElement, number]> = [];
      for (const el of active) {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const offset = (elCenter - center) * readSpeed(el);
        writes.push([el, -offset]);
      }
      for (const [el, dy] of writes) {
        el.style.transform = `translate3d(0, ${dy}px, 0)`;
      }
    };

    const schedule = () => {
      if (raf || document.hidden) return;
      raf = requestAnimationFrame(tick);
    };

    // IntersectionObserver gates per-element work — only animate
    // elements within (or near) the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            active.add(el);
          } else {
            active.delete(el);
            // Reset transform when leaving so re-entry starts clean.
            el.style.transform = "";
          }
        }
        schedule();
      },
      { rootMargin: "20% 0px" },
    );

    const observe = () => {
      const all = document.querySelectorAll<HTMLElement>("[data-parallax]");
      for (const el of all) io.observe(el);
    };

    observe();
    schedule();

    const onScroll = () => schedule();
    const onResize = () => {
      lastY = -Infinity;
      schedule();
    };
    const onVisibility = () => {
      if (!document.hidden) schedule();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    // Re-observe when the DOM changes (route changes, late mounts).
    // Limit to elements we haven't seen yet to avoid duplicate observes.
    const mo = new MutationObserver(() => {
      observe();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      mo.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
