"use client";

import { useCallback, useEffect, useState } from "react";

import { Stagger, StaggerItem } from "@/app/components/motion";
import type { InvestorRole } from "@/sanity/lib/types";

/** How long each role stays highlighted before advancing, in ms. */
const DWELL = 3200;

/**
 * BPI's roles as an auto-cycling, hover-aware list. The active row lifts into a
 * light card (dark text); the rest stay white-on-dark, divided by hairline
 * rules. Auto-advances on a timer, pausing while hovered/focused (hovering a
 * row activates it), and holds still for reduced-motion users. Rows reveal on
 * scroll via the shared Stagger.
 */
export default function InvestorsRolesTable({
  roles,
}: {
  roles: InvestorRole[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const count = roles.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Auto-advance; re-arms on every active change so a manual hover also resets
  // the dwell. Parked while paused, reduced-motion, or single-item.
  useEffect(() => {
    if (paused || reduced || count < 2) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % count), DWELL);
    return () => window.clearTimeout(id);
  }, [active, paused, reduced, count]);

  const resume = useCallback(() => setPaused(false), []);

  return (
    <Stagger
      className="flex flex-col"
      onMouseLeave={resume}
      onBlurCapture={resume}
    >
      {roles.map((role, i) => {
        const isActive = i === active;
        // Hide the rule directly above the active card (and on the first row).
        const showTopBorder = i > 0 && active !== i && active !== i - 1;
        return (
          <StaggerItem
            key={`${role.label ?? "role"}-${i}`}
            onMouseEnter={() => {
              setActive(i);
              setPaused(true);
            }}
            onFocusCapture={() => {
              setActive(i);
              setPaused(true);
            }}
            className={`grid grid-cols-1 items-center gap-1 rounded-2xl px-6 py-4 transition-colors duration-500 ease-[var(--ease-premium)] sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6 md:px-7 md:py-6 ${
              isActive
                ? "bg-error-25"
                : showTopBorder
                  ? "border-t border-white/15"
                  : ""
            }`}
          >
            <span
              className={`font-display text-[24px] font-semibold leading-none tracking-[-0.48px] transition-colors duration-300 ${
                isActive ? "text-primary-500" : "text-white"
              }`}
            >
              {role.label}
            </span>
            <span
              className={`font-display text-[16px] font-normal leading-[28px] tracking-normal transition-colors duration-300 ${
                isActive ? "text-primary-500/70" : "text-white/60"
              }`}
            >
              {role.description}
            </span>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
