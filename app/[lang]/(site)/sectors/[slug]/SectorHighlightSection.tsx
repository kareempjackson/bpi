import type { CSSProperties } from "react";

import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type { PortableTextBlock, ResolvedMedia } from "@/sanity/lib/types";

/**
 * "Highlight" — a two-column block that leads with supporting context and lands
 * on a single emphasized (bold + italic) statement, with a wide image beneath.
 *
 * Layout, matching the approved mockup:
 *   heading (left)  │  body paragraph(s), then the emphasized statement (right)
 *                   │  image spanning the right column below
 *
 * It reads as the inverse of the "In practice" block, whose large lead sits on
 * top; here the punchy line comes last, after the setup. Colours follow the
 * sector profile: `bg` is the light canvas, `ink` the dark heading/text colour
 * (usually the sector's `pageColor`).
 */

/**
 * Stack the heading so the final word sits on its own line — e.g.
 * "What This Looks Like In" / "Practice". A single-word heading is unchanged.
 */
function headingLines(heading: string) {
  const words = heading.trim().split(/\s+/);
  if (words.length < 2) return heading;
  const last = words.pop();
  return (
    <>
      <span className="block">{words.join(" ")}</span>
      <span className="block">{last}</span>
    </>
  );
}

type Props = {
  heading?: string | null;
  /** Supporting body prose (Portable Text, or legacy string). Regular weight. */
  body?: PortableTextBlock[] | string | null;
  /** The single emphasized takeaway — rendered bold + italic below the body. */
  statement?: string | null;
  media: ResolvedMedia | null;
  /** Section canvas colour (light). */
  bg: string;
  /** Ink colour for the heading + text (dark). */
  ink: string;
};

export default function SectorHighlightSection({
  heading,
  body,
  statement,
  media,
  bg,
  ink,
}: Props) {
  return (
    <section
      data-nav-theme="light"
      style={{ backgroundColor: bg, "--ink": ink } as CSSProperties}
      className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-page">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* Left — heading. */}
          {heading ? (
            <Stagger>
              <StaggerItem
                as="h2"
                className="font-display text-3xl md:text-4xl font-bold text-(--ink) leading-[1.1] tracking-[-0.02em] text-balance"
              >
                {headingLines(heading)}
              </StaggerItem>
            </Stagger>
          ) : (
            <span />
          )}

          {/* Right — body paragraph(s), emphasized statement, then image. */}
          <Stagger className="flex flex-col gap-8">
            {body ? (
              <StaggerItem as="div">
                <PortableTextBody
                  value={body}
                  paragraphClassName="text-base md:text-lg text-(--ink)/75 leading-[1.75]"
                />
              </StaggerItem>
            ) : null}
            {statement ? (
              <StaggerItem
                as="p"
                className="text-xl md:text-2xl font-bold italic text-(--ink) leading-relaxed tracking-[-0.01em]"
              >
                {statement}
              </StaggerItem>
            ) : null}
            {media ? (
              <Reveal
                preset="scale"
                className="relative mt-4 md:mt-6 w-full aspect-4/3 sm:aspect-video overflow-hidden rounded-2xl lg:rounded-3xl"
              >
                <MediaImage media={media} sizes="(max-width: 1024px) 100vw, 60vw" />
              </Reveal>
            ) : null}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
