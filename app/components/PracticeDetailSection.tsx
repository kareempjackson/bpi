import type { CSSProperties } from "react";

import type { PortableTextBlock, ResolvedMedia } from "@/sanity/lib/types";
import { hangLastWord } from "@/app/lib/hangLastWord";
import CtaLink from "./CtaLink";
import MediaImage from "./MediaImage";
import PortableTextBody from "./PortableTextBody";
import { Stagger, StaggerItem } from "./motion";

/** Class set for each selectable heading style. */
const HEADING_STYLES = {
  default:
    "font-display font-semibold text-[48px] leading-[110%] tracking-normal text-[#0B2F64]",
  compactBold:
    "font-sans font-bold text-[26px] leading-12 tracking-[0.48px] align-middle text-black",
} as const;

type Props = {
  heading?: string;
  /** Which heading style variant to render. Defaults to the large navy display. */
  headingStyle?: keyof typeof HEADING_STYLES | null;
  /** Body prose shown on the right (Portable Text, or legacy string). */
  body?: PortableTextBlock[] | string | null;
  /** Widen the body/CTA column from ~576px to ~768px. */
  wideBody?: boolean | null;
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
  headingStyle,
  body,
  wideBody,
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
              className={`whitespace-pre-line ${HEADING_STYLES[headingStyle ?? "default"]}`}
            >
              {headingStyle === "compactBold" ? hangLastWord(heading) : heading}
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

        {/* Right — body prose + CTA. Fixed ~576px column, right-aligned within
            its grid cell so its right edge lines up with the right gutter (the
            nav menu). */}
        <Stagger className={`flex w-full flex-col gap-10 lg:ml-auto lg:pt-2 ${wideBody ? "max-w-3xl" : "max-w-[575.92px]"}`}>
          {body ? (
            <StaggerItem as="div">
              <PortableTextBody
                value={body}
                paragraphClassName="whitespace-pre-line font-display text-[18px] font-normal leading-[160%] tracking-[-0.24px] text-black"
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
