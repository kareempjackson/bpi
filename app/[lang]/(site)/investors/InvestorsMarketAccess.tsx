import CountUp from "@/app/components/CountUp";
import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type {
  PortableTextBlock,
  ResolvedMedia,
  Stat,
} from "@/sanity/lib/types";

/**
 * "Market Access" — heading pinned left, with the lead, a divided row of
 * markets, and the closing line set in the right column. A full-bleed image
 * closes the section, flush to the edges of the viewport.
 */
export default function InvestorsMarketAccess({
  heading,
  lead,
  stats,
  closing,
  media,
}: {
  heading?: string | null;
  lead?: PortableTextBlock[] | string | null;
  stats?: Stat[] | null;
  closing?: PortableTextBlock[] | string | null;
  media: ResolvedMedia | null;
}) {
  return (
    <section data-nav-theme="light" className="pt-20 md:pt-28 lg:pt-32 pb-16 md:pb-24 lg:pb-28">
      <div className="px-6 md:px-10 lg:px-14">
        <div className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-[0.3fr_0.7fr] gap-6 lg:gap-10">
          {heading ? (
            <Reveal
              as="h2"
              className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
            >
              {heading}
            </Reveal>
          ) : null}

          <div className="flex flex-col gap-10 md:gap-12">
            {lead ? (
              <Reveal className="max-w-3xl">
                <PortableTextBody
                  value={lead}
                  paragraphClassName="font-display text-[36px] font-light leading-[1.52] tracking-normal text-[#6D6D6D]"
                />
              </Reveal>
            ) : null}

            {stats?.length ? (
              <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-y-8 gap-x-6">
                {stats.map((stat, i) => (
                  <StaggerItem
                    key={`${stat.value}-${i}`}
                    className={`flex flex-col gap-2 ${
                      i === 0
                        ? ""
                        : "sm:border-l sm:border-primary-500/20 sm:pl-6"
                    }`}
                  >
                    <CountUp
                      value={stat.value}
                      className="font-display text-[24px] font-semibold leading-[1.52] tracking-normal text-black"
                    />
                    <span className="font-display text-[16px] font-normal leading-[1.52] tracking-normal text-primary-500/70">
                      {stat.description}
                    </span>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : null}

          </div>

          {/* Closing spans the full grid width but its text is indented to line
              up under the lead (right column) and capped so only "New York"
              wraps to the second line. */}
          {closing ? (
            <div className="lg:col-span-2 lg:pl-[32%]">
              <Reveal className="max-w-[54rem]">
                <PortableTextBody
                  value={closing}
                  paragraphClassName="font-display text-[32px] font-light leading-[1.52] tracking-normal text-[#6D6D6D]"
                />
              </Reveal>
            </div>
          ) : null}
        </div>
      </div>

      {media ? (
        <Reveal
          preset="scale"
          className="relative mt-14 md:mt-20 w-full aspect-video sm:aspect-21/9 lg:aspect-3/1 bg-primary-500/5"
        >
          <MediaImage media={media} sizes="100vw" />
        </Reveal>
      ) : null}
    </section>
  );
}
