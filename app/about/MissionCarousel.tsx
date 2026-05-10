"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function MissionCarousel({ children }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0.33);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const ratio = max > 0 ? el.scrollLeft / max : 0;
      setProgress(ratio);
      const visible = el.clientWidth / el.scrollWidth;
      setThumbWidth(Math.min(1, Math.max(0.15, visible)));
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const trackTravel = 1 - thumbWidth;
  const thumbLeft = trackTravel * progress;

  return (
    <>
      <div
        ref={scrollerRef}
        className="no-scrollbar overflow-x-auto -mx-12 md:-mx-20 lg:-mx-32 px-12 md:px-20 lg:px-32 pb-1"
      >
        <div className="flex gap-4 lg:gap-5 min-w-max">{children}</div>
      </div>

      <div className="mt-6 lg:mt-8 relative h-1 bg-primary-500/10 rounded-full overflow-hidden">
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
