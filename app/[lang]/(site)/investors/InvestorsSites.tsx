import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type { PortableTextBlock, ResolvedMedia } from "@/sanity/lib/types";

/**
 * "Available Manufacturing Sites" — heading and body on the left, the numbered
 * estate list and its italic note on the right, with a full-width photo below.
 * Numbers are derived from order (01, 02, 03…), so an editor only ever types
 * the site name.
 */
export default function InvestorsSites({
  heading,
  body,
  sites,
  note,
  media,
}: {
  heading?: string | null;
  body?: PortableTextBlock[] | string | null;
  sites?: string[] | null;
  note?: PortableTextBlock[] | string | null;
  media?: ResolvedMedia | null;
}) {
  return (
    <section
      data-nav-theme="light"
      // Nav-aligned gutters (match StickyTopNav's px) so the left content lines
      // up with the logo and the right content lines up with the menu.
      className="px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left — heading + body. */}
        <Stagger className="flex flex-col gap-5">
          {heading ? (
            <StaggerItem
              as="h2"
              className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
            >
              {heading}
            </StaggerItem>
          ) : null}
          {body ? (
            <StaggerItem className="max-w-xl">
              <PortableTextBody
                value={body}
                paragraphClassName="align-middle font-sans text-[18px] font-normal leading-[39px] tracking-normal text-black/60"
              />
            </StaggerItem>
          ) : null}
        </Stagger>

        {/* Right — numbered list, then the note. Capped and pushed to the
            column's right edge so both line up with the menu on the right. */}
        <div className="flex flex-col gap-10 md:gap-12 w-full max-w-2xl lg:ml-auto">
          {sites?.length ? (
            <Stagger className="flex flex-col">
              {sites.map((site, i) => (
                <StaggerItem
                  key={`${site}-${i}`}
                  className="flex items-center justify-between gap-6 border-t border-primary-500/15 py-3.5 last:border-b"
                >
                  <span className="align-middle font-display text-[14px] font-semibold leading-[21px] tracking-normal text-primary-500">
                    {site}
                  </span>
                  <span className="shrink-0 text-xs md:text-sm tabular-nums text-primary-500/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          ) : null}

          {note ? (
            <Reveal className="max-w-2xl">
              {/* Note per design spec: Avenir (via --font-sans) Book Oblique
                  (italic, 350), 24px / 42px line-height (ratio 1.75), no
                  tracking, middle-aligned. */}
              <PortableTextBody
                value={note}
                paragraphClassName="align-middle font-sans font-[350] italic text-base md:text-lg lg:text-[20px] text-primary-500/70 leading-[1.75] tracking-normal"
              />
            </Reveal>
          ) : null}
        </div>
      </div>

      {/* Full-width photo below the two columns. */}
      {media ? (
        <Reveal
          preset="scale"
          className="relative mt-14 md:mt-20 mx-auto w-full max-w-page aspect-video sm:aspect-21/9 lg:aspect-3/1 overflow-hidden rounded-2xl bg-primary-500/5"
        >
          <MediaImage media={media} sizes="100vw" />
        </Reveal>
      ) : null}
    </section>
  );
}
