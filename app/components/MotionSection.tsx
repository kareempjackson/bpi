"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";

import type { PortableTextBlock, ResolvedMedia } from "@/sanity/lib/types";
import ConvergenceGraphic from "./ConvergenceGraphic";
import CtaLink from "./CtaLink";
import MediaImage from "./MediaImage";
import PortableTextBody from "./PortableTextBody";
import { Reveal, Stagger, StaggerItem } from "./motion";

export type MotionItem = {
  title: string;
  body: PortableTextBlock[] | string | null;
  /** Per-initiative right-column media. Falls back to the section media. */
  media?: ResolvedMedia | null;
  /** Link to the initiative's detail page (or external URL). When set the row
   *  becomes clickable; when absent it stays a plain cycle selector. */
  href?: string | null;
};

type Props = {
  heading?: string;
  items: MotionItem[];
  /** Section canvas colour. Defaults to the pale blue. */
  bg?: string;
  /** Ink colour — the active card + accents. Defaults to the brand navy. */
  ink?: string;
  /** "light" (default) = navy text on a pale canvas; "dark" = white text on a
   *  navy canvas. The active row stays a white card either way. */
  tone?: "light" | "dark";
  /** Optional button shown at the top-right of the header. */
  ctaLabel?: string;
  ctaHref?: string;
  /** Optional image for the right column; when set it replaces the graphic. */
  media?: ResolvedMedia | null;
  /** Override the heading's typographic classes (font/size/weight/etc.). */
  headingClassName?: string;
  /** Override each initiative title's typographic classes. When set, the
   *  active/inactive colour switch is dropped in favour of a fixed colour. */
  itemTitleClassName?: string;
  /** Override each initiative body paragraph's typographic classes. */
  itemBodyClassName?: string;
};

/** How long each initiative stays active before advancing, in ms. */
const DWELL = 5200;

/**
 * "In Motion" — a stack of live initiatives on the left whose active row lifts
 * into a white card with a progress ring, auto-cycling through the list; a
 * convergence graphic on the right visualises many efforts flowing to one
 * gateway. Pauses on hover / focus and for reduced-motion users.
 */
export default function MotionSection({
  heading,
  items,
  bg = "#E7F9FF",
  ink = "#000036",
  tone = "light",
  ctaLabel,
  ctaHref,
  media,
  headingClassName = "font-display text-3xl md:text-4xl lg:text-5xl font-bold text-(--fg) leading-tight tracking-[-0.02em]",
  itemTitleClassName,
  itemBodyClassName,
}: Props) {
  // Foreground for text outside the (always-white) active card: navy on the
  // light canvas, white on the dark canvas.
  const fg = tone === "dark" ? "#ffffff" : ink;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const count = items.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Auto-advance. Re-arms on every active change (so a manual click also resets
  // the dwell), and stays parked while paused, reduced-motion, or single-item.
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

  if (count === 0) return null;

  // Right-column media follows the active initiative: use its own media when set,
  // otherwise the shared section media. `activeMediaKey` remounts the panel so it
  // re-animates only when the shown media actually changes (not on every cycle to
  // an item that reuses the section fallback).
  const activeMedia = items[active]?.media ?? media;
  const activeMediaKey = items[active]?.media ? `item-${active}` : "section";

  return (
    <section
      data-nav-theme={tone === "dark" ? "dark" : "light"}
      style={{ backgroundColor: bg, "--ink": ink, "--fg": fg } as CSSProperties}
      className={`px-6 md:px-10 lg:px-14 ${
        tone === "dark"
          ? "py-16 md:py-24 lg:py-28"
          : "pb-16 md:pb-24 lg:pb-28"
      }`}
    >
      <div className="mx-auto max-w-page">
        {heading || ctaLabel ? (
          <Stagger className="flex items-start justify-between gap-4">
            {heading ? (
              <StaggerItem as="h2" className={headingClassName}>
                {heading}
              </StaggerItem>
            ) : (
              <span />
            )}
            {ctaLabel ? (
              <StaggerItem>
                <CtaLink
                  href={ctaHref}
                  className="shrink-0 rounded-round bg-[#ABE8FE] px-6 py-2.5 text-sm font-semibold text-[#0B2F64] transition hover:bg-[#ABE8FE]/90"
                >
                  {ctaLabel}
                </CtaLink>
              </StaggerItem>
            ) : null}
          </Stagger>
        ) : null}

        <div className="mt-10 md:mt-14 lg:mt-16 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          {/* Left — cycling list of initiatives. Rows use a negative inset so
              the copy lines up flush with the heading while the active card's
              fill still breathes past it. */}
          <Stagger
            as="ul"
            className="flex flex-col gap-6 md:gap-8 lg:gap-10"
            onMouseEnter={pause}
            onMouseLeave={resume}
            onFocusCapture={pause}
            onBlurCapture={resume}
          >
            {items.map((item, i) => {
              const isActive = i === active;
              // Colour is tone- and state-aware: on the (white) active card the
              // text is ink; everywhere else it takes --fg (white on a dark/blue
              // canvas, ink on a light one). Kept separate from the caller's
              // typographic overrides so those only dictate font/size/weight.
              const titleColor = isActive ? "text-(--ink)" : "text-(--fg)";
              const bodyColor = itemBodyClassName
                ? isActive
                  ? "text-(--ink)"
                  : "text-(--fg)"
                : isActive
                  ? "text-(--ink)/65"
                  : "text-(--fg)/55";
              // Shared shell + inner content, so a row can render either as a
              // navigating link (when the initiative resolves an href) or a
              // plain cycle-selector button. Hovering promotes the row to the
              // active white card either way.
              const rowClass = `group -mx-5 block w-[calc(100%+2.5rem)] rounded-xl px-5 py-5 text-left transition-colors duration-500 ease-(--ease-premium) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ink)/25 ${
                isActive ? "bg-white" : "bg-transparent"
              }`;
              const rowInner = (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      className={`${
                        itemTitleClassName ??
                        "font-display text-base md:text-lg font-bold leading-snug tracking-[-0.01em]"
                      } ${titleColor}`}
                    >
                      {item.title}
                    </h3>
                    {/* Progress ring — only on the active row; fills over the
                        dwell, or sits full for reduced-motion. */}
                    <span
                      aria-hidden
                      className={`mt-0.5 shrink-0 transition-opacity duration-300 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <ProgressRing
                        active={isActive}
                        paused={paused}
                        reduced={reduced}
                      />
                    </span>
                  </div>
                  <PortableTextBody
                    value={item.body}
                    compact
                    className="mt-2"
                    paragraphClassName={`${
                      itemBodyClassName ?? "text-sm leading-relaxed"
                    } ${bodyColor}`}
                  />
                </>
              );
              return (
                <StaggerItem as="li" key={`${i}-${item.title}`}>
                  {item.href ? (
                    <CtaLink
                      href={item.href}
                      onMouseEnter={() => setActive(i)}
                      className={rowClass}
                    >
                      {rowInner}
                    </CtaLink>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      // Hovering a row promotes it to the active white card, so
                      // the hovered row reads with dark ink while the rest stay
                      // --fg.
                      onMouseEnter={() => setActive(i)}
                      aria-pressed={isActive}
                      className={rowClass}
                    >
                      {rowInner}
                    </button>
                  )}
                </StaggerItem>
              );
            })}
          </Stagger>

          {/* Right — the active initiative's own media when it has one, else
              the section-level media, else the convergence graphic. Re-keyed on
              the active index so it cross-fades as the list cycles. */}
          {activeMedia ? (
            <Reveal
              key={activeMediaKey}
              preset="scale"
              className="relative aspect-4/5 w-full overflow-hidden rounded-xl bg-white/5 lg:ml-auto lg:max-w-md"
            >
              <MediaImage
                media={activeMedia}
                sizes="(min-width: 1024px) 34vw, 100vw"
              />
            </Reveal>
          ) : (
            <Reveal
              preset="scale"
              className="relative aspect-4/5 w-full overflow-hidden rounded-xl lg:ml-auto lg:max-w-md"
              style={{
                background:
                  "linear-gradient(160deg, #1c257f 0%, #141b6a 55%, #0d1256 100%)",
              }}
            >
              <ConvergenceGraphic />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

/** Small circular countdown that fills over the dwell duration. Re-keyed by
 *  `active` so it restarts each time a row becomes active. */
function ProgressRing({
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
          // Remount on (re)activation so the fill animation replays from 0.
          key={reduced ? "static" : "run"}
          cx="12"
          cy="12"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-[#2563eb]"
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
