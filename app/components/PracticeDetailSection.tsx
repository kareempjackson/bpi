import type { CSSProperties } from "react";

import type { PortableTextBlock, ResolvedMedia } from "@/sanity/lib/types";
import CtaLink from "./CtaLink";
import MediaImage from "./MediaImage";
import PortableTextBody from "./PortableTextBody";
import { Stagger, StaggerItem } from "./motion";

type Props = {
  heading?: string;
  /** Body prose shown on the right (Portable Text, or legacy string). */
  body?: PortableTextBlock[] | string | null;
  media?: ResolvedMedia | null;
  ctaLabel?: string;
  ctaHref?: string;
  /** Section canvas colour. Defaults to the pale blue. */
  bg?: string;
  /** Ink colour for text. Defaults to the brand navy. */
  ink?: string;
};

/**
 * "What this looks like in practice" — a two-column detail block over a faint
 * grid: a large heading + square image on the left, a stack of body paragraphs
 * and a CTA on the right.
 */
export default function PracticeDetailSection({
  heading,
  body,
  media,
  ctaLabel,
  ctaHref,
  bg = "#E7F9FF",
  ink = "#000036",
}: Props) {
  return (
    <section
      data-nav-theme="light"
      style={{ backgroundColor: bg, "--ink": ink } as CSSProperties}
      className="px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto grid max-w-page grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left — heading + square image. */}
        <Stagger className="flex flex-col gap-10 lg:gap-14">
          {heading ? (
            <StaggerItem
              as="h2"
              className="max-w-md font-display text-4xl md:text-5xl lg:text-6xl font-bold text-(--ink) leading-[1.05] tracking-[-0.02em]"
            >
              {heading}
            </StaggerItem>
          ) : null}
          {media ? (
            <StaggerItem
              preset="scale"
              className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-primary-500/5"
            >
              <MediaImage
                media={media}
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </StaggerItem>
          ) : null}
        </Stagger>

        {/* Right — body prose + CTA. */}
        <Stagger className="flex max-w-xl flex-col gap-10 lg:pt-2">
          {body ? (
            <StaggerItem as="div">
              <PortableTextBody
                value={body}
                paragraphClassName="text-base md:text-lg text-(--ink)/85 leading-relaxed"
              />
            </StaggerItem>
          ) : null}
          {ctaLabel ? (
            <StaggerItem>
              <CtaLink
                href={ctaHref}
                className="inline-flex rounded-round bg-white px-6 py-2.5 text-sm font-semibold text-(--ink) transition hover:bg-white/90"
              >
                {ctaLabel}
              </CtaLink>
            </StaggerItem>
          ) : null}
        </Stagger>
      </div>
    </section>
  );
}
