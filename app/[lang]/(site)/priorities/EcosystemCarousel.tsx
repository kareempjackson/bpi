"use client";

import { useState } from "react";
import Image from "next/image";

import Logo from "@/app/components/Logo";

export type EcosystemItem = {
  title: string;
  body: string;
  /** Optional image; empty renders a branded placeholder. */
  imageSrc?: string;
  imageAlt?: string;
};

/**
 * "Our Ecosystem" carousel — a list of pillars on the right whose active item
 * drives the large image on the left. Prev/next buttons (and clicking a row)
 * change the selection, wrapping around at both ends.
 */
export default function EcosystemCarousel({
  items,
}: {
  items: EcosystemItem[];
}) {
  const [active, setActive] = useState(0);
  const n = items.length;
  if (n === 0) return null;

  const go = (dir: 1 | -1) => setActive((a) => (a + dir + n) % n);
  const current = items[active];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      {/* Left — active item's image (or branded placeholder). */}
      <div className="relative w-full aspect-video overflow-hidden rounded-2xl lg:rounded-3xl bg-primary-500">
        {current.imageSrc ? (
          <Image
            key={active}
            src={current.imageSrc}
            alt={current.imageAlt ?? current.title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
          >
            <Logo iconOnly size={180} className="text-white/10" />
          </div>
        )}
        {/* Cinematic tint to match the screenshot's graded image. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-primary-500/25"
        />
      </div>

      {/* Right — pillar list + prev/next controls. */}
      <div className="flex flex-col">
        <ul className="flex flex-col">
          {items.map((item, i) => {
            const isActive = i === active;
            return (
              <li key={item.title}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={isActive ? "true" : undefined}
                  className={`block w-full text-left py-6 transition-colors focus-visible:outline-none ${
                    i > 0 ? "border-t border-primary-500/15" : ""
                  }`}
                >
                  <h3
                    className={`font-display text-base md:text-lg font-bold tracking-[-0.01em] ${
                      isActive ? "text-warning-500" : "text-warning-500/45"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`mt-1.5 text-base leading-relaxed ${
                      isActive ? "text-primary-500" : "text-primary-500/40"
                    }`}
                  >
                    {item.body}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className="inline-flex h-11 w-14 items-center justify-center rounded-full border border-warning-500 text-warning-500 transition-colors hover:bg-warning-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-500/40"
          >
            <Arrow className="h-4 w-4" direction="prev" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className="inline-flex h-11 w-14 items-center justify-center rounded-full bg-warning-500 text-white transition-colors hover:bg-warning-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-500/40"
          >
            <Arrow className="h-4 w-4" direction="next" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Arrow({
  className,
  direction = "next",
}: {
  className?: string;
  direction?: "next" | "prev";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={direction === "prev" ? { transform: "scaleX(-1)" } : undefined}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
