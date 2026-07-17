import CountUp from "@/app/components/CountUp";
import MediaImage from "@/app/components/MediaImage";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type { ResolvedMedia, Stat } from "@/sanity/lib/types";

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
  lead?: string | null;
  stats?: Stat[] | null;
  closing?: string | null;
  media: ResolvedMedia | null;
}) {
  return (
    <section data-nav-theme="light" className="pb-16 md:pb-24 lg:pb-28">
      <div className="px-6 md:px-12 lg:px-20 xl:px-28">
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
              <Reveal
                as="p"
                className="max-w-2xl font-display text-xl md:text-2xl lg:text-3xl text-primary-500/40 leading-[1.35] tracking-[-0.01em]"
              >
                {lead}
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
                      className="font-display text-lg md:text-xl font-bold text-primary-500 leading-snug tracking-[-0.01em]"
                    />
                    <span className="text-xs text-primary-500/70 leading-snug">
                      {stat.description}
                    </span>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : null}

            {closing ? (
              <Reveal
                as="p"
                className="max-w-2xl font-display text-xl md:text-2xl lg:text-3xl text-primary-500/40 leading-[1.35] tracking-[-0.01em]"
              >
                {closing}
              </Reveal>
            ) : null}
          </div>
        </div>
      </div>

      {media ? (
        <Reveal
          preset="scale"
          className="relative mt-14 md:mt-20 w-full aspect-4/3 sm:aspect-video lg:aspect-21/9 bg-primary-500/5"
        >
          <MediaImage media={media} sizes="100vw" />
        </Reveal>
      ) : null}
    </section>
  );
}
