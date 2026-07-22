"use client";

import { useRef } from "react";

import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { resolveMedia } from "@/sanity/lib/image";
import type { CarouselItem, PortableTextBlock } from "@/sanity/lib/types";

import type { SectionComponentProps } from "./registry";

// Matches the `gap-4` (1rem = 16px) between cards, so a nudge advances by
// exactly one card + its gutter.
const CARD_GAP = 16;

/**
 * Page-builder renderer for the `carouselBlock`. Framed by the Zone. A heading
 * + intro over a horizontal CSS scroll-snap track of image cards, with prev/
 * next buttons that scroll by one card width. Client component: uses a ref to
 * the track for `scrollBy`.
 */
export default function CarouselBlock({ block }: SectionComponentProps) {
  const heading = (block.heading as string) ?? undefined;
  const intro =
    (block.intro as PortableTextBlock[] | string | null) ?? undefined;
  const items = (block.slides as CarouselItem[] | null) ?? [];
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const step = (card ? card.clientWidth : track.clientWidth * 0.8) + CARD_GAP;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  if (!items.length && !heading) return null;

  return (
    <div className="mx-auto max-w-page">
      <div className="mb-8 flex items-end justify-between gap-6 lg:mb-10">
        <div className="max-w-2xl">
          {heading ? (
            <h2 className="type-h2 balance-text text-primary-500">{heading}</h2>
          ) : null}
          {intro ? (
            <PortableTextBody
              value={intro}
              compact
              paragraphClassName="type-lead mt-4 text-primary-500/70"
            />
          ) : null}
        </div>

        {items.length > 1 ? (
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scroll(-1)}
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-primary-500/20 text-primary-500 transition-colors hover:bg-primary-500/5"
            >
              <span aria-hidden className="text-lg leading-none">
                &#8249;
              </span>
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => scroll(1)}
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-primary-500/20 text-primary-500 transition-colors hover:bg-primary-500/5"
            >
              <span aria-hidden className="text-lg leading-none">
                &#8250;
              </span>
            </button>
          </div>
        ) : null}
      </div>

      {items.length ? (
        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {items.map((item, i) => {
            const media = resolveMedia(item.image, { width: 800 });
            return (
              <article
                data-card
                key={`${item.title ?? "card"}-${i}`}
                className="flex w-[80%] shrink-0 snap-start flex-col gap-4 sm:w-[46%] lg:w-[31%]"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-primary-500/5">
                  {media ? (
                    <MediaImage
                      media={media}
                      sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 80vw"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  {item.title ? (
                    <h3 className="type-card-heading text-primary-500">
                      {item.title}
                    </h3>
                  ) : null}
                  {item.body ? (
                    <PortableTextBody
                      value={item.body}
                      compact
                      paragraphClassName="type-body-sm text-primary-500/70"
                    />
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
