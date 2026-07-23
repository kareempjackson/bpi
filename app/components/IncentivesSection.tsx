import type { CSSProperties } from "react";

import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type {
  InvestorNote,
  PortableTextBlock,
  ResolvedMedia,
} from "@/sanity/lib/types";

/**
 * "Investment Incentives" — a wide image (or video), then the heading over a
 * grey lead, closing on a three-across grid of incentive paragraphs.
 *
 * Shared by the Investors page and any Priority that opts the section in. Pass
 * `bg`/`ink` to sit the block on a coloured canvas (priorities do this so the
 * navy text stays legible over the page's own background).
 */
export default function IncentivesSection({
  media,
  heading,
  lead,
  items,
  bg,
  ink = "#0B2F64",
}: {
  media: ResolvedMedia | null;
  heading?: string | null;
  lead?: PortableTextBlock[] | string | null;
  items?: InvestorNote[] | null;
  /** Optional section canvas colour. When unset the section is transparent. */
  bg?: string;
  /** Ink colour for the heading/lead/items. Defaults to the brand navy. */
  ink?: string;
}) {
  return (
    <section
      data-nav-theme="light"
      style={{ backgroundColor: bg, "--ink": ink } as CSSProperties}
      className={`px-6 md:px-10 lg:px-14 ${
        bg ? "py-16 md:py-24 lg:py-28" : "pb-16 md:pb-24 lg:pb-28"
      }`}
    >
      <div className="mx-auto w-full max-w-page">
        {media ? (
          <Reveal
            preset="scale"
            className="relative w-full aspect-4/3 sm:aspect-video lg:aspect-21/9 overflow-hidden rounded-2xl bg-(--ink)/5"
          >
            <MediaImage media={media} sizes="100vw" />
          </Reveal>
        ) : null}

        <Stagger className={`flex flex-col gap-5 ${media ? "mt-14 md:mt-20" : ""}`}>
          {heading ? (
            <StaggerItem
              as="h2"
              className="font-display text-2xl md:text-3xl font-bold text-(--ink) leading-tight tracking-[-0.02em]"
            >
              {heading}
            </StaggerItem>
          ) : null}
          {lead ? (
            <StaggerItem className="max-w-xl">
              <PortableTextBody
                value={lead}
                paragraphClassName="font-display text-xl md:text-2xl lg:text-3xl text-(--ink)/40 leading-[1.35] tracking-[-0.01em]"
              />
            </StaggerItem>
          ) : null}
        </Stagger>

        {items?.length ? (
          <Stagger className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10 md:gap-y-14">
            {items.map((item, i) => (
              <StaggerItem key={`note-${i}`} as="div">
                <PortableTextBody
                  value={item.body}
                  compact
                  paragraphClassName="font-display text-[18px] font-light leading-[1.5] tracking-normal text-(--ink)/70"
                />
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}
      </div>
    </section>
  );
}
