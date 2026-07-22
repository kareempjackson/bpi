"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

import CtaLink from "@/app/components/CtaLink";
import PortableTextBody from "@/app/components/PortableTextBody";
import type { PortableTextBlock } from "@/sanity/lib/types";

export type SectorSlide = {
  nodeId: string;
  title: string;
  description?: PortableTextBlock[] | string | null;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
};

// Card fills cycle white → mint → soft-yellow, matching the reference design.
const TINTS = ["#ffffff", "#cdf6dc", "#e6ee85"];

export default function SectorsCarousel({ slides }: { slides: SectorSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  // Sync the progress bar + slide counter to the current scroll position.
  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);

    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    let idx = 0;
    let best = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - el.scrollLeft);
      if (d < best) {
        best = d;
        idx = i;
      }
    });
    setActive(idx);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    const clamped = Math.max(0, Math.min(cards.length - 1, i));
    const card = cards[clamped];
    if (card) el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  };

  const atStart = active <= 0;
  const atEnd = active >= slides.length - 1;

  return (
    <div>
      {/* Track */}
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <article
            key={s.nodeId}
            data-card
            style={{ backgroundColor: TINTS[i % TINTS.length] }}
            className="flex w-[85%] shrink-0 snap-start flex-col rounded-2xl p-6 sm:w-[58%] lg:w-[31.5%] lg:rounded-3xl lg:p-7"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-500">
              {s.title}
            </p>
            <div className="relative mt-5 aspect-square w-full overflow-hidden rounded-xl bg-primary-500/5">
              {s.imageSrc ? (
                <Image
                  src={s.imageSrc}
                  alt={s.imageAlt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 31vw, 85vw"
                  className="object-cover"
                />
              ) : null}
            </div>
            <PortableTextBody
              value={s.description}
              className="mt-5 flex-1"
              paragraphClassName="text-sm leading-relaxed text-primary-500/80 md:text-base"
            />
            {s.href ? (
              <CtaLink
                href={s.href}
                className="mt-6 inline-flex w-fit items-center rounded-round border border-primary-500 px-4 py-1.5 text-xs font-semibold text-primary-500 transition-colors hover:bg-primary-500/5"
              >
                Learn More
              </CtaLink>
            ) : (
              <span className="mt-6 inline-flex w-fit items-center rounded-round border border-primary-500 px-4 py-1.5 text-xs font-semibold text-primary-500">
                Learn More
              </span>
            )}
          </article>
        ))}
      </div>

      {/* Controls: progress bar (left) + counter & arrows (right). */}
      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="relative h-2 w-full flex-1 overflow-hidden rounded-full bg-error-200 sm:max-w-xl">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-error-700 transition-[width] duration-200 ease-out"
            style={{ width: `${Math.max(6, progress * 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-primary-500/70">
            Slide {active + 1} of {slides.length}
          </span>
          <div className="flex items-center gap-2">
            <NavButton label="First slide" onClick={() => goTo(0)} disabled={atStart}>
              <Chevron double />
            </NavButton>
            <NavButton
              label="Previous slide"
              onClick={() => goTo(active - 1)}
              disabled={atStart}
            >
              <Chevron />
            </NavButton>
            <NavButton
              label="Next slide"
              onClick={() => goTo(active + 1)}
              disabled={atEnd}
            >
              <Chevron flip />
            </NavButton>
            <NavButton
              label="Last slide"
              onClick={() => goTo(slides.length - 1)}
              disabled={atEnd}
            >
              <Chevron double flip />
            </NavButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex size-10 items-center justify-center rounded-lg border border-primary-500/25 bg-white text-primary-500 transition-colors hover:bg-primary-500/5 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

// Single or double chevron; `flip` points it right (default points left).
function Chevron({ double, flip }: { double?: boolean; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-4 w-4 ${flip ? "rotate-180" : ""}`}
    >
      {double ? (
        <>
          <path d="M17 6l-6 6 6 6" />
          <path d="M11 6l-6 6 6 6" />
        </>
      ) : (
        <path d="M15 6l-6 6 6 6" />
      )}
    </svg>
  );
}
