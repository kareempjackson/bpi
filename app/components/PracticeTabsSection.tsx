"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";

import type { PortableTextBlock } from "@/sanity/lib/types";
import { plainText } from "@/app/lib/plainText";
import { hangLastWord } from "@/app/lib/hangLastWord";
import PortableTextBody from "./PortableTextBody";
import { Stagger, StaggerItem } from "./motion";

export type PracticeTabInput = {
  label?: string | null;
  body?: PortableTextBlock[] | string | null;
  bullets?: string | null;
};

/** Class set for each selectable heading style (layout classes added separately). */
const HEADING_STYLES = {
  default:
    "max-w-xs font-display text-4xl md:text-5xl font-bold text-(--ink) leading-[1.05] tracking-[-0.02em]",
  compactBold:
    "font-sans font-bold text-[26px] leading-12 tracking-[0.48px] align-middle text-black",
} as const;

type Props = {
  heading?: string;
  /** Which heading style variant to render. Defaults to the large display. */
  headingStyle?: keyof typeof HEADING_STYLES | null;
  lead?: PortableTextBlock[] | string | null;
  statement?: string;
  /** Optional small paragraph shown below the statement. */
  trail?: PortableTextBlock[] | string | null;
  tabs: PracticeTabInput[];
  /** Section canvas colour. Defaults to the pale blue. */
  bg?: string;
  /** Ink colour for text + accents. Defaults to the brand navy. */
  ink?: string;
};

/** How long each tab stays active before advancing, in ms. */
const DWELL = 8000;

/**
 * "What this looks like in practice" (tabbed) — a heading on the left; a lead,
 * a large statement, and an auto-cycling tabbed panel on the right. Each tab
 * lifts into a white card; a progress bar, counter, and ring track the cycle.
 */
export default function PracticeTabsSection({
  heading,
  headingStyle,
  lead,
  statement,
  trail,
  tabs,
  bg = "#E7F9FF",
  ink = "#000036",
}: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const count = tabs.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reduced || count < 2) return;
    const id = window.setTimeout(
      () => setActive((a) => (a + 1) % count),
      DWELL,
    );
    return () => window.clearTimeout(id);
  }, [active, paused, reduced, count]);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  const activeTab = tabs[active];
  const bullets = (activeTab?.bullets ?? "")
    .split(/\n+/)
    .map((b) => b.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);

  return (
    <section
      data-nav-theme="light"
      style={{ backgroundColor: bg, "--ink": ink } as CSSProperties}
      className="px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto grid max-w-page grid-cols-1 items-start gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-16">
        {/* Left — heading. */}
        {heading ? (
          <Stagger
            as="h2"
            className={`${HEADING_STYLES[headingStyle ?? "default"]} lg:sticky lg:top-28`}
          >
            {headingStyle === "compactBold" ? hangLastWord(heading) : heading}
          </Stagger>
        ) : (
          <span className="hidden lg:block" />
        )}

        {/* Right — lead, statement, tabs. */}
        <Stagger className="flex flex-col gap-12 lg:gap-16">
          {lead ? (
            <StaggerItem
              as="div"
              className="w-full"
            >
              <PortableTextBody
                value={lead}
                paragraphClassName="whitespace-pre-line font-sans font-normal text-[18px] leading-[176%] tracking-[0.48px] align-middle text-black"
              />
            </StaggerItem>
          ) : null}

          {statement ? (
            <StaggerItem
              as="p"
              className="whitespace-pre-line text-2xl md:text-3xl lg:text-[2.5rem] font-medium text-(--ink) leading-[1.32] tracking-[-0.01em]"
            >
              {plainText(statement)}
            </StaggerItem>
          ) : null}

          {trail ? (
            <StaggerItem
              as="div"
              className="w-full"
            >
              <PortableTextBody
                value={trail}
                paragraphClassName="whitespace-pre-line font-sans font-normal text-[18px] leading-[176%] tracking-[0.48px] align-middle text-black"
              />
            </StaggerItem>
          ) : null}

          {count > 0 && activeTab ? (
            <StaggerItem
              onMouseEnter={pause}
              onMouseLeave={resume}
              onFocusCapture={pause}
              onBlurCapture={resume}
            >
              {/* Tab bar */}
              <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-(--ink)/15">
                {tabs.map((t, i) => {
                  const on = i === active;
                  return (
                    <button
                      key={`${i}-${t.label ?? ""}`}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-pressed={on}
                      className={`relative -mb-px flex items-center gap-2 pb-3 text-sm md:text-base font-semibold transition-colors focus-visible:outline-none ${
                        on
                          ? "text-(--ink)"
                          : "text-(--ink)/40 hover:text-(--ink)/70"
                      }`}
                    >
                      {on ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-(--ink)" />
                      ) : null}
                      {t.label}
                      {on ? (
                        <span className="absolute inset-x-0 -bottom-px h-0.5 bg-(--ink)" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Active tab content — re-keyed so it re-animates on change. */}
              <div
                key={active}
                className="mt-6 flex flex-col gap-5 rounded-2xl bg-white p-6 md:p-8 lg:p-10"
              >
                {activeTab.body ? (
                  <PortableTextBody
                    value={activeTab.body}
                    paragraphClassName="text-base md:text-lg text-(--ink)/85 leading-relaxed"
                  />
                ) : null}
                {bullets.length > 0 ? (
                  <ul className="flex list-disc flex-col gap-2.5 pl-5 marker:text-(--ink)/40">
                    {bullets.map((b, i) => (
                      <li
                        key={i}
                        className="pl-1 text-base md:text-lg text-(--ink)/85 leading-relaxed"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {/* Progress bar + counter + ring. */}
              <div className="mt-6">
                <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-(--ink)/15">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-(--ink) transition-[width] duration-500 ease-out"
                    style={{ width: `${((active + 1) / count) * 100}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-semibold tabular-nums text-(--ink)/50">
                    {String(active + 1).padStart(2, "0")}/
                    {String(count).padStart(2, "0")}
                  </span>
                  <TabRing active paused={paused} reduced={reduced} />
                </div>
              </div>
            </StaggerItem>
          ) : null}
        </Stagger>
      </div>
    </section>
  );
}

/** Small circular countdown that fills over the dwell duration. */
function TabRing({
  active,
  paused,
  reduced,
}: {
  active: boolean;
  paused: boolean;
  reduced: boolean;
}) {
  const R = 9;
  const C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 -rotate-90">
      <circle
        cx="12"
        cy="12"
        r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-(--ink)/15"
      />
      {active ? (
        <circle
          key={reduced ? "static" : "run"}
          cx="12"
          cy="12"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-(--ink)"
          style={
            reduced
              ? { strokeDasharray: C, strokeDashoffset: 0 }
              : ({
                  strokeDasharray: C,
                  "--ring-c": `${C}`,
                  animation: `motion-ring-fill ${DWELL}ms linear forwards`,
                  animationPlayState: paused ? "paused" : "running",
                } as CSSProperties)
          }
        />
      ) : null}
    </svg>
  );
}
