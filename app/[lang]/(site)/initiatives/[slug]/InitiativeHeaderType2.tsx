import Image from "next/image";

import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import { Stagger, StaggerItem } from "@/app/components/motion";

/**
 * Initiative detail-page header, "Type 2" layout: a split title lockup — the
 * first half anchored top-left, the subtitle + button under it, and the second
 * half dropped to the bottom of the same column and pushed to its right edge,
 * so the copy sits inside the title. A near-square image holds the right.
 * Full-viewport hero over the page's base colour with the faint rounded-tile
 * grid backdrop (shared with the sector/careers heroes).
 *
 * The split is authored, not derived: `title` is the top line, `titleTail` the
 * offset one (Studio → Initiative → Header title / Header title — offset line).
 * With no tail this degrades to a plain title + copy column.
 */
type CtaValue = { label: string; href: string };

const TITLE_BASE =
  "font-display font-bold text-white leading-[1.02] tracking-[-0.02em] text-6xl md:text-7xl lg:text-8xl";

export default function InitiativeHeaderType2({
  title,
  titleTail,
  subtitle,
  imageSrc,
  imageAlt,
  base,
  primaryCta,
  secondaryCta,
}: {
  title: string;
  titleTail?: string | null;
  subtitle?: string | null;
  imageSrc?: string | null;
  imageAlt?: string | null;
  base: string;
  primaryCta: CtaValue;
  secondaryCta?: CtaValue | null;
}) {
  const fullTitle = titleTail ? `${title} ${titleTail}` : title;

  return (
    <section
      data-nav-theme="dark"
      data-cursor="icon"
      className="relative overflow-hidden"
      style={{ backgroundColor: base }}
    >
      <GridHoverBackdrop />
      <div className="relative mx-auto flex max-w-page flex-col justify-center px-6 md:px-12 lg:px-20 xl:px-28 pt-24 md:pt-28 lg:pt-24 pb-12 md:pb-16 lg:pb-16 lg:min-h-svh">
        <Stagger className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.62fr_0.38fr] lg:gap-16">
          {/* Left — title head, copy, then the title tail hung right. */}
          <div className="order-2 flex flex-col lg:order-1">
            {/* One h1 for the whole title; the tail is a second block inside it
                so screen readers still read "PAHO Regional Supply Hub". */}
            <StaggerItem as="h1" aria-label={fullTitle} className={TITLE_BASE}>
              <span aria-hidden>{title}</span>
            </StaggerItem>

            <div className="flex flex-col gap-8 pt-8 md:pt-10">
              {subtitle ? (
                <StaggerItem
                  as="p"
                  className="max-w-2xl text-base md:text-lg text-white/75 leading-relaxed"
                >
                  {subtitle}
                </StaggerItem>
              ) : null}
              <StaggerItem className="flex flex-wrap items-center gap-3">
                <CtaLink
                  href={primaryCta.href}
                  className="inline-flex items-center rounded-round bg-warning-25 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-white"
                >
                  {primaryCta.label}
                </CtaLink>
                {secondaryCta ? (
                  <CtaLink
                    href={secondaryCta.href}
                    className="inline-flex items-center rounded-round border border-white/50 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-(--ease-premium) hover:border-white/80 hover:bg-white/10"
                  >
                    {secondaryCta.label}
                  </CtaLink>
                ) : null}
              </StaggerItem>
            </div>

            {titleTail ? (
              <StaggerItem
                aria-hidden
                className={`self-start pt-10 md:pt-12 lg:self-end lg:text-right ${TITLE_BASE}`}
              >
                {titleTail}
              </StaggerItem>
            ) : null}
          </div>

          {/* Right — near-square image. */}
          {imageSrc ? (
            <div className="relative order-1 aspect-4/5 w-full self-center overflow-hidden rounded-lg lg:order-2 lg:aspect-square">
              <Image
                src={imageSrc}
                alt={imageAlt ?? ""}
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
                preload
                quality={90}
              />
            </div>
          ) : null}
        </Stagger>
      </div>
    </section>
  );
}
