"use client";

import { useEffect } from "react";
import { useLenis } from "./LenisProvider";

const DEFAULT_THEME_COLOR = "#cdffe6";

/**
 * Recovers from browser back/forward bfcache restoration.
 *
 * When the browser restores a page from bfcache, React effects do *not*
 * re-run and their cleanups do *not* fire — the DOM and JS heap come
 * back exactly as they were when the page was last hidden. Anything an
 * effect wrote to long-lived DOM (`document.body`, `<meta>` tags, the
 * sticky-nav surface) is restored with it.
 *
 * On a `pageshow` with `event.persisted === true` we forcibly clear the
 * known offenders so the user can never land on a frozen / unscrollable
 * / unclickable page after a Back navigation. Lenis is also re-aligned
 * with the browser's restored `scrollY` to prevent a stale-target yank
 * on the next wheel event.
 */
export default function BfcacheReset() {
  const { sync } = useLenis();

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;

      // Menu scroll-lock recovery
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");

      // Sticky-nav pointer-events / theme-color recovery
      const header = document.querySelector<HTMLElement>("[data-page-header]");
      if (header) {
        const surface = header.firstElementChild as HTMLElement | null;
        if (surface) surface.style.pointerEvents = "";
      }
      const themeMeta = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]'
      );
      if (themeMeta) themeMeta.setAttribute("content", DEFAULT_THEME_COLOR);

      // Lenis: re-align with whatever scrollY the browser restored
      sync();
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [sync]);

  return null;
}
