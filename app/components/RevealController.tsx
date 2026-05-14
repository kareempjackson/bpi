"use client";

import { useEffect } from "react";

const SELECTOR =
  "[data-reveal], [data-reveal-stagger], [data-care-mobile]";

/**
 * Sets `data-in-view` on `[data-reveal]` elements when they enter the
 * viewport so the CSS reveal animation fires. Without this attribute,
 * `globals.css` keeps those sections at `opacity: 0`.
 *
 * Important: this mounts once at the layout level and uses a
 * `MutationObserver` to pick up DOM that arrives later — newly-mounted
 * route pages, lazy-loaded sections, etc. A `[pathname]`-dep effect
 * would race the route transition: if the effect fires before the new
 * page's DOM commits, `querySelectorAll` returns nothing and every
 * section on the new page stays invisible. The MutationObserver path
 * makes that race impossible.
 */
export default function RevealController() {
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const flip = (el: HTMLElement) => {
      if (el.hasAttribute("data-care-mobile")) {
        el.setAttribute("data-care-revealed", "");
      }
      el.setAttribute("data-in-view", "");
    };

    const observed = new WeakSet<Element>();

    const io = reduce
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              flip(entry.target as HTMLElement);
              io!.unobserve(entry.target);
            }
          },
          { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
        );

    const scan = () => {
      const els = document.querySelectorAll<HTMLElement>(SELECTOR);
      els.forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        if (reduce) {
          flip(el);
        } else {
          io!.observe(el);
        }
      });
    };

    scan();

    // Pick up DOM added after this effect mounted — e.g. a new route's
    // page committing under the shared layout, or sections that mount
    // late on the same page.
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, []);

  return null;
}
