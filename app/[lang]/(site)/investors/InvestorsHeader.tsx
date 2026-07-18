import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import MediaImage from "@/app/components/MediaImage";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import type { Cta, ResolvedMedia } from "@/sanity/lib/types";

/**
 * Investors page header. An oversized green title hangs at the bottom of a
 * narrow left column, beside a right column that stacks an italic tagline and a
 * single button over a wide image. The image bleeds past the page's right
 * padding to the edge of the viewport — the negative right margin cancels the
 * section's padding at each breakpoint, so the two must stay in step.
 *
 * Full-viewport hero over the dark green band with the faint rounded-tile grid
 * backdrop (shared with the about/sector/careers heroes).
 */
export default function InvestorsHeader({
  title,
  tagline,
  cta,
  media,
  lang,
}: {
  title: string;
  tagline?: string | null;
  cta?: Cta;
  media: ResolvedMedia | null;
  lang: string;
}) {
  return (
    <section
      data-nav-theme="dark"
      data-cursor="icon"
      // Left padding matches StickyTopNav's px (px-6 md:px-10 lg:px-14) so the
      // title lines up with the logo. Right padding is kept wider because the
      // image's negative right margin below cancels it to bleed to the edge.
      className="relative flex flex-col overflow-hidden bg-error-950 pl-6 md:pl-10 lg:pl-14 pr-6 md:pr-12 lg:pr-20 xl:pr-28 pt-32 md:pt-36 lg:pt-40 pb-12 md:pb-16 lg:pb-20 lg:min-h-[96dvh]"
    >
      {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
      <GridHoverBackdrop />

      <div className="relative mx-auto grid w-full max-w-page flex-1 grid-cols-1 lg:grid-cols-[0.28fr_0.72fr] gap-10 lg:gap-12 min-h-0 items-stretch">
        {/* Left — oversized title, dropped to the bottom of the column. */}
        <Stagger
          as="h1"
          className="order-2 lg:order-1 flex flex-col lg:mt-auto lg:mb-16 font-display text-[clamp(2.75rem,5.5vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-error-500"
        >
          <StaggerItem as="span">{title}</StaggerItem>
        </Stagger>

        {/* Right — tagline + button (top), image (bottom, bleeding right). */}
        <div className="order-1 lg:order-2 flex flex-col min-h-0">
          <Stagger className="flex flex-col gap-6 md:gap-7">
            {tagline ? (
              <StaggerItem
                as="p"
                className="max-w-md font-display text-2xl md:text-3xl italic text-white leading-[1.3] tracking-[-0.01em]"
              >
                {tagline}
              </StaggerItem>
            ) : null}
            {cta?.label ? (
              <StaggerItem>
                <CtaLink
                  href={localizedHref(lang, cta.href)}
                  className="inline-flex w-fit items-center rounded-round bg-error-500 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
                >
                  {cta.label}
                </CtaLink>
              </StaggerItem>
            ) : null}
          </Stagger>

          {/* Width is left to `auto` so the negative margin actually widens the
              box — an explicit `w-full` would pin it to the column and the
              bleed would collapse. */}
          {media ? (
            <div className="mt-10 md:mt-12 lg:mt-14 -mr-6 md:-mr-12 lg:-mr-20 xl:-mr-28 lg:flex-1 lg:min-h-0">
              <Reveal
                preset="scale"
                className="relative aspect-4/3 sm:aspect-video lg:aspect-auto lg:h-full overflow-hidden rounded-l-2xl bg-white/5"
              >
                <MediaImage
                  media={media}
                  sizes="(min-width: 1024px) 72vw, 100vw"
                  preload
                  eager
                />
              </Reveal>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
