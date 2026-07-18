"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import ArrowRight from "@/app/components/ArrowRight";

type Props = {
  children: ReactNode;
};

export default function MissionCarousel({ children }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [progress, setProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0.33);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const items = Children.toArray(children);

  const stepDistance = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const firstCard = cardRefs.current[0];
    const cardWidth =
      firstCard?.getBoundingClientRect().width ?? el.clientWidth * 0.7;
    const track = el.firstElementChild as HTMLElement | null;
    const gapPx = track ? parseFloat(getComputedStyle(track).columnGap) || 0 : 0;
    return cardWidth + gapPx;
  }, []);

  const scrollByStep = useCallback(
    (direction: 1 | -1) => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollBy({ left: stepDistance() * direction, behavior: "smooth" });
    },
    [stepDistance]
  );

  const seekToClientX = useCallback((clientX: number) => {
    const el = scrollerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const max = el.scrollWidth - el.clientWidth;
    el.scrollLeft = ratio * max;
  }, []);

  const onTrackPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      if (!track) return;
      track.setPointerCapture(e.pointerId);
      seekToClientX(e.clientX);
      const onMove = (ev: PointerEvent) => seekToClientX(ev.clientX);
      const onUp = (ev: PointerEvent) => {
        try {
          track.releasePointerCapture(ev.pointerId);
        } catch {}
        track.removeEventListener("pointermove", onMove);
        track.removeEventListener("pointerup", onUp);
        track.removeEventListener("pointercancel", onUp);
      };
      track.addEventListener("pointermove", onMove);
      track.addEventListener("pointerup", onUp);
      track.addEventListener("pointercancel", onUp);
    },
    [seekToClientX]
  );

  const onKeyNav = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const el = scrollerRef.current;
      if (!el) return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          scrollByStep(1);
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          scrollByStep(-1);
          break;
        case "Home":
          e.preventDefault();
          el.scrollTo({ left: 0, behavior: "smooth" });
          break;
        case "End":
          e.preventDefault();
          el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
          break;
      }
    },
    [scrollByStep]
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf = 0;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const ratio = max > 0 ? el.scrollLeft / max : 0;
      setProgress(ratio);
      const visible = el.clientWidth / el.scrollWidth;
      setThumbWidth(Math.min(1, Math.max(0.15, visible)));
      setCanPrev(el.scrollLeft > 1);
      setCanNext(el.scrollLeft < max - 1);

      if (reducedMotion) return;

      const MIN_SCALE = 0.78;
      const MIN_OPACITY = 0.55;
      const scrollerRect = el.getBoundingClientRect();
      const padLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const firstCard = cardRefs.current[0];
      const cardWidth = firstCard?.getBoundingClientRect().width ?? 0;
      const activeAnchor = scrollerRect.left + padLeft + cardWidth / 2;
      const fadeRange = scrollerRect.width * 0.6;

      cardRefs.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cardCentre = rect.left + rect.width / 2;
        const distance = Math.abs(cardCentre - activeAnchor);
        const t = Math.min(1, distance / fadeRange);
        const scale = 1 - (1 - MIN_SCALE) * t;
        const opacity = 1 - (1 - MIN_OPACITY) * t;
        const pushDirection = cardCentre < activeAnchor ? -1 : 1;
        const pull = t * rect.width * 0.08 * pushDirection;
        card.style.transform = `translateX(${pull.toFixed(
          2
        )}px) scale(${scale.toFixed(3)})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.zIndex = String(Math.round(10 - t * 9));
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [items.length]);

  const trackTravel = 1 - thumbWidth;
  const thumbLeft = trackTravel * progress;

  const navButtonClass =
    "inline-flex items-center justify-center size-10 lg:size-11 rounded-round border border-primary-500/45 text-primary-500 transition-all duration-300 ease-[var(--ease-premium)] hover:border-primary-500/70 hover:bg-primary-500/5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-primary-500/45 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Mission cards"
      className="relative"
    >
      {/* Top-right nav — lifted into the section heading row via negative
          top offset so it visually pairs with the section title rather than
          floating above the cards. Hidden on mobile, where the section
          description wraps to multiple lines and would collide with the
          arrows; mobile gets a duplicate pair inline with the progress
          bar below the cards. */}
      <div className="hidden md:flex absolute right-0 md:-top-20 lg:-top-24 z-10 items-center md:gap-2.5">
        <button
          type="button"
          onClick={() => scrollByStep(-1)}
          disabled={!canPrev}
          aria-label="Previous mission card"
          className={navButtonClass}
        >
          <ArrowRight className="rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => scrollByStep(1)}
          disabled={!canNext}
          aria-label="Next mission card"
          className={navButtonClass}
        >
          <ArrowRight />
        </button>
      </div>

      <div
        ref={scrollerRef}
        tabIndex={0}
        onKeyDown={onKeyNav}
        aria-label="Mission cards scroller. Use arrow keys to navigate."
        className="no-scrollbar overflow-x-auto -mx-6 md:-mx-10 lg:-mx-14 px-6 md:px-10 lg:px-14 scroll-pl-6 md:scroll-pl-10 lg:scroll-pl-14 pb-1 snap-x snap-mandatory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-4 focus-visible:ring-offset-error-25 rounded-lg"
      >
        <div className="flex gap-2 lg:gap-3 min-w-max items-center pr-[22vw]">
          {items.map((child, i) => (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="relative will-change-transform origin-left snap-start transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 lg:mt-8 flex items-center gap-4">
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          onKeyDown={onKeyNav}
          onPointerDown={onTrackPointerDown}
          aria-label="Mission carousel position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="group/track relative h-1.5 flex-1 max-w-md bg-primary-500/10 rounded-full cursor-pointer touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-4 focus-visible:ring-offset-error-25"
        >
          <div
            className="absolute top-0 h-full bg-error-500 rounded-full transition-[left] duration-150 group-hover/track:bg-error-400"
            style={{
              width: `${thumbWidth * 100}%`,
              left: `${thumbLeft * 100}%`,
            }}
          />
        </div>

        {/* Mobile-only nav — sits next to the progress bar so the
            arrows stay visible without colliding with the heading
            description. The md+ pair lives in the top-right above. */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => scrollByStep(-1)}
            disabled={!canPrev}
            aria-label="Previous mission card"
            className={navButtonClass}
          >
            <ArrowRight className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => scrollByStep(1)}
            disabled={!canNext}
            aria-label="Next mission card"
            className={navButtonClass}
          >
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
