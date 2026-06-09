"use client";

import { useEffect, useRef } from "react";
import Logo from "./Logo";

/**
 * Site-wide custom cursor — keeps the native pointer by default and swaps in
 * the BPI molecular logo mark only while the pointer is hovering a selectable
 * element (links, buttons, inputs, anything with a pointer affordance).
 * Tracks the mouse via direct DOM writes (no React re-render) and uses
 * `mix-blend-mode: difference` so the white mark stays legible over any
 * background.
 *
 * Only activates on devices with a fine pointer (real mouse). On touch /
 * coarse-pointer devices it renders nothing and leaves the native cursor
 * untouched — and the `cursor: none` rule is only applied while hovering an
 * interactive element, so the regular mouse is used everywhere else.
 */

// What counts as "selectable" — show the logo mark over these.
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [role="link"], input, textarea, select, label, summary, [onclick], [data-cursor="icon"]';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const el = cursorRef.current;
    if (!el) return;

    const root = document.documentElement;
    let active = false;

    const move = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;

      // Toggle the logo mark based on whether we're over a selectable element.
      const overInteractive = !!(e.target as Element | null)?.closest?.(
        INTERACTIVE_SELECTOR
      );
      if (overInteractive !== active) {
        active = overInteractive;
        root.classList.toggle("cursor-icon-active", active);
        el.style.opacity = active ? "1" : "0";
      }
    };
    // Hide the mark when the pointer leaves the window or the tab loses focus.
    const hide = () => {
      active = false;
      root.classList.remove("cursor-icon-active");
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      root.classList.remove("cursor-icon-active");
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden md:block"
      style={{
        opacity: 0,
        transform: "translate3d(-200px, -200px, 0)",
        mixBlendMode: "difference",
        willChange: "transform",
      }}
    >
      <Logo iconOnly size={22} className="text-white" />
    </div>
  );
}
