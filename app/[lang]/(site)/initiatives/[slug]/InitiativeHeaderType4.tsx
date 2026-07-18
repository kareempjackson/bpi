import Image from "next/image";

import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";

/**
 * Initiative detail-page header, "Type 4": a small eyebrow over a large
 * two-tone headline, both indented into the right ~70% of the page, with a
 * full-bleed image flush to the bottom of the colour band. No buttons — the
 * headline carries the whole hero.
 *
 * The headline is two-tone: it renders in the page accent, and any phrase the
 * editor wraps in **double asterisks** flips to white — the same convention the
 * pull-quote section uses.
 */
function renderHeadline(text: string, accent: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="text-white">
        {part}
      </span>
    ) : (
      <span key={i} style={{ color: accent }}>
        {part}
      </span>
    ),
  );
}

export default function InitiativeHeaderType4({
  eyebrow,
  headline,
  imageSrc,
  imageAlt,
  base,
  accent,
}: {
  eyebrow?: string | null;
  headline: string;
  imageSrc?: string | null;
  imageAlt?: string | null;
  base: string;
  /** Page accent — the headline's default colour. */
  accent: string;
}) {
  return (
    <section
      data-nav-theme="dark"
      data-cursor="icon"
      className="relative overflow-hidden"
      style={{ backgroundColor: base }}
    >
      <GridHoverBackdrop />
      <div className="relative px-6 md:px-10 lg:px-14 pt-24 md:pt-28 lg:pt-28 pb-10 md:pb-14 lg:pb-16">
        <div className="mx-auto w-full max-w-page">
          {/* Copy sits in the right ~70% — the empty left column is the design. */}
          <Stagger className="flex flex-col gap-3 lg:gap-4 lg:pl-[28%]">
            {eyebrow ? (
              <StaggerItem
                as="p"
                className="text-sm md:text-base text-white/85 leading-snug"
              >
                {eyebrow}
              </StaggerItem>
            ) : null}
            <StaggerItem
              as="h1"
              className="max-w-3xl font-display text-3xl md:text-4xl lg:text-[2.6rem] font-bold leading-[1.2] tracking-[-0.02em]"
            >
              {renderHeadline(headline, accent)}
            </StaggerItem>
          </Stagger>
        </div>
      </div>

      {/* Full-bleed image flush to the bottom of the colour band. */}
      {imageSrc ? (
        <Reveal
          preset="scale"
          className="relative w-full aspect-4/3 sm:aspect-video lg:aspect-2/1"
        >
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            fill
            sizes="100vw"
            className="object-cover"
            preload
            quality={90}
          />
        </Reveal>
      ) : null}
    </section>
  );
}
