"use client";

import { useEffect } from "react";

/**
 * Single global controller for image parallax.
 * - Watches every [data-parallax] element.
 * - On scroll, translates each element vertically based on its center's
 *   distance from the viewport center, multiplied by data-parallax (speed).
 * - Speed values: 0.10 = subtle, 0.20 = pronounced. Negative inverts direction.
 * - Skipped under prefers-reduced-motion.
 *
 * Authoring pattern: wrap the parallax target in a clipping container with
 * overflow-hidden, and oversize the parallax element by ~10% so edges stay
 * covered while it drifts.
 */
export default function ParallaxController() {
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    let raf = 0;
    let els: HTMLElement[] = [];

    const collect = () => {
      els = Array.from(
        document.querySelectorAll<HTMLElement>("[data-parallax]")
      );
    };

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const center = vh / 2;
        for (const el of els) {
          const speed = parseFloat(el.dataset.parallax || "0.12");
          const rect = el.getBoundingClientRect();
          // Skip if far outside viewport (perf)
          if (rect.bottom < -vh || rect.top > vh * 2) continue;
          const elCenter = rect.top + rect.height / 2;
          const offset = (elCenter - center) * speed;
          // Negate so element moves OPPOSITE to scroll → feels slower
          el.style.setProperty("--parallax-y", `${-offset}px`);
        }
      });
    };

    collect();
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    // Re-collect when the DOM changes (route changes, late mounts)
    const mo = new MutationObserver(() => {
      collect();
      update();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
