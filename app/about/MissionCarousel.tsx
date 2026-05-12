"use client";

import {
  Children,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Props = {
  children: ReactNode;
};

export default function MissionCarousel({ children }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [progress, setProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0.33);

  const items = Children.toArray(children);

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

      if (reducedMotion) return;

      // Zoom-in effect: the card whose centre is closest to the active-card
      // anchor renders at 1.0 with a higher z-index. Adjacent cards scale
      // down toward MIN_SCALE, drop their opacity, and shift to a lower
      // z-index so the active card appears in front and the next card peeks
      // out from behind. Cards snap to `start`, so the active card's left
      // edge aligns with the scroller's content start (matches section
      // padding) — the anchor is computed from there.
      const MIN_SCALE = 0.78;
      const MIN_OPACITY = 0.55;
      const scrollerRect = el.getBoundingClientRect();
      const padLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const firstCard = cardRefs.current[0];
      const cardWidth = firstCard?.getBoundingClientRect().width ?? 0;
      const activeAnchor = scrollerRect.left + padLeft + cardWidth / 2;
      // Distance over which a card fully scales down.
      const fadeRange = scrollerRect.width * 0.6;

      cardRefs.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cardCentre = rect.left + rect.width / 2;
        const distance = Math.abs(cardCentre - activeAnchor);
        const t = Math.min(1, distance / fadeRange);
        const scale = 1 - (1 - MIN_SCALE) * t;
        const opacity = 1 - (1 - MIN_OPACITY) * t;
        // Push adjacent cards horizontally away from the active card so the
        // peeking card sits further out to the side rather than overlapping.
        const pushDirection = cardCentre < activeAnchor ? -1 : 1;
        const pull = t * rect.width * 0.08 * pushDirection;
        card.style.transform = `translateX(${pull.toFixed(
          2
        )}px) scale(${scale.toFixed(3)})`;
        card.style.opacity = opacity.toFixed(3);
        // Active card sits on top (z 10), adjacent cards drop behind (z 1–5).
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

  return (
    <>
      <div
        ref={scrollerRef}
        className="no-scrollbar overflow-x-auto -mx-5 md:-mx-20 lg:-mx-32 px-5 md:px-20 lg:px-32 scroll-pl-5 md:scroll-pl-20 lg:scroll-pl-32 pb-1 snap-x snap-mandatory"
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

      <div className="mt-6 lg:mt-8 relative h-1 w-1/2 bg-primary-500/10 rounded-full overflow-hidden">
        <div
          className="absolute top-0 h-full bg-error-500 rounded-full transition-[left] duration-150"
          style={{
            width: `${thumbWidth * 100}%`,
            left: `${thumbLeft * 100}%`,
          }}
        />
      </div>
    </>
  );
}
