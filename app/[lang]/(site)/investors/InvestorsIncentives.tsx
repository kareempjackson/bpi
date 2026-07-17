import MediaImage from "@/app/components/MediaImage";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type { InvestorNote, ResolvedMedia } from "@/sanity/lib/types";

/**
 * "Investment Incentives" — a wide image, then the heading over a grey lead,
 * closing on a three-across grid of incentive paragraphs.
 */
export default function InvestorsIncentives({
  media,
  heading,
  lead,
  items,
}: {
  media: ResolvedMedia | null;
  heading?: string | null;
  lead?: string | null;
  items?: InvestorNote[] | null;
}) {
  return (
    <section
      data-nav-theme="light"
      className="px-6 md:px-12 lg:px-20 xl:px-28 pb-16 md:pb-24 lg:pb-28"
    >
      <div className="mx-auto w-full max-w-page">
        {media ? (
          <Reveal
            preset="scale"
            className="relative w-full aspect-4/3 sm:aspect-video lg:aspect-21/9 overflow-hidden rounded-2xl bg-primary-500/5"
          >
            <MediaImage media={media} sizes="100vw" />
          </Reveal>
        ) : null}

        <Stagger className={`flex flex-col gap-5 ${media ? "mt-14 md:mt-20" : ""}`}>
          {heading ? (
            <StaggerItem
              as="h2"
              className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
            >
              {heading}
            </StaggerItem>
          ) : null}
          {lead ? (
            <StaggerItem
              as="p"
              className="max-w-xl font-display text-xl md:text-2xl lg:text-3xl text-primary-500/40 leading-[1.35] tracking-[-0.01em]"
            >
              {lead}
            </StaggerItem>
          ) : null}
        </Stagger>

        {items?.length ? (
          <Stagger className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10 md:gap-y-14 lg:pl-[4%]">
            {items.map((item, i) => (
              <StaggerItem
                key={`${item.body?.slice(0, 24) ?? "note"}-${i}`}
                as="p"
                className="text-xs md:text-sm text-primary-500/70 leading-relaxed"
              >
                {item.body}
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}
      </div>
    </section>
  );
}
