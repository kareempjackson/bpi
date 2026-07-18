import Image from "next/image";

import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import { Stagger, StaggerItem } from "@/app/components/motion";

/**
 * Initiative detail-page header, "Type 3" layout: the copy leads — subtitle and
 * button anchored top-left — with an oversized title dropped to the bottom of
 * the column, beside a tall image on the right. The inverse of Type 1, which
 * hangs the title at the top and the copy at the bottom.
 *
 * Full-viewport hero over the page's base colour with the faint rounded-tile
 * grid backdrop (shared with the sector/careers heroes).
 */
type CtaValue = { label: string; href: string };

export default function InitiativeHeaderType3({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  base,
  primaryCta,
  secondaryCta,
}: {
  title: string;
  subtitle?: string | null;
  imageSrc?: string | null;
  imageAlt?: string | null;
  base: string;
  primaryCta: CtaValue;
  secondaryCta?: CtaValue | null;
}) {
  return (
    <section
      data-nav-theme="dark"
      data-cursor="icon"
      className="relative overflow-hidden"
      style={{ backgroundColor: base }}
    >
      <GridHoverBackdrop />
      <div className="relative mx-auto flex max-w-page flex-col justify-center px-6 md:px-10 lg:px-14 pt-24 md:pt-28 lg:pt-24 pb-12 md:pb-16 lg:pb-16 lg:min-h-svh">
        <Stagger className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[0.55fr_0.45fr] lg:gap-16">
          {/* Left — subtitle + button (top), oversized title (bottom). */}
          <div className="order-2 flex flex-col lg:order-1">
            <div className="flex flex-col gap-6">
              {subtitle ? (
                <StaggerItem
                  as="p"
                  className="max-w-md text-base md:text-lg text-white/75 leading-relaxed"
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

            <StaggerItem
              as="h1"
              className="mt-auto pt-16 md:pt-20 lg:pt-24 font-display font-bold text-white leading-[1.02] tracking-[-0.02em] text-6xl md:text-7xl lg:text-8xl"
            >
              {title}
            </StaggerItem>
          </div>

          {/* Right — tall image. */}
          {imageSrc ? (
            <div className="relative order-1 aspect-4/5 w-full self-center overflow-hidden rounded-lg lg:order-2 lg:aspect-auto lg:h-[70vh]">
              <Image
                src={imageSrc}
                alt={imageAlt ?? ""}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
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
