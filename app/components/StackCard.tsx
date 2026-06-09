"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps a section so it behaves as the pinned "base card" in a stacking-
 * cards scroll: it sticks to the top of the viewport while the NEXT
 * sibling section slides up and covers it, and it recedes — scaling down
 * and dimming — as it's covered, pushing it visually to the back.
 *
 * Desktop + motion only. On mobile / reduced-motion the wrapper is inert
 * (no sticky, no transform) so the sections simply stack in normal flow.
 *
 * The recede is written straight to the inner element's style inside a
 * rAF (no React state), so scrolling never re-renders the wrapped tree.
 */
export default function StackCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    if (reduce || !desktop) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const outer = outerRef.current;
      const inner = innerRef.current;
      const next = outer?.nextElementSibling as HTMLElement | null;
      if (!outer || !inner || !next) return;
      const vh = window.innerHeight;
      // Coverage progress: the next section's top edge travels from the
      // viewport bottom (vh) up to the top (0) as it slides over this one.
      const nextTop = next.getBoundingClientRect().top;
      const p = Math.max(0, Math.min(1, (vh - nextTop) / vh));
      inner.style.transform = `scale(${1 - p * 0.06}) translateY(${p * -18}px)`;
      inner.style.opacity = String(1 - p * 0.5);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={outerRef}
      // Opaque page-green backdrop (desktop) so that when the inner card
      // scales down to recede, the revealed margin shows a clean surface
      // — not the molecule section pinned behind it (whose node shadows
      // were bleeding through).
      className={`${className} motion-safe:md:sticky motion-safe:md:top-0 motion-safe:md:bg-error-25`}
    >
      <div
        ref={innerRef}
        className="motion-safe:md:will-change-transform"
        style={{ transformOrigin: "center 40%" }}
      >
        {children}
      </div>
    </div>
  );
}
