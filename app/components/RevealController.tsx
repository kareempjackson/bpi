"use client";

import { useEffect } from "react";

const SELECTOR =
  "[data-reveal], [data-reveal-stagger], [data-care-mobile]";

export default function RevealController() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(SELECTOR)
    );
    if (els.length === 0) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const flip = (el: HTMLElement) => {
      if (el.hasAttribute("data-care-mobile")) {
        el.setAttribute("data-care-revealed", "");
      }
      el.setAttribute("data-in-view", "");
    };

    if (reduce) {
      els.forEach(flip);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          flip(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach((el) => io.observe(el));

    const failSafe = window.setTimeout(() => {
      els.forEach((el) => {
        if (!el.hasAttribute("data-in-view")) flip(el);
      });
    }, 2000);

    return () => {
      io.disconnect();
      window.clearTimeout(failSafe);
    };
  }, []);

  return null;
}
