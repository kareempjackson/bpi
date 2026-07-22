import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type {
  InvestorNote,
  PortableTextBlock,
  ResolvedMedia,
} from "@/sanity/lib/types";

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
  lead?: PortableTextBlock[] | string | null;
  items?: InvestorNote[] | null;
}) {
  return (
    <section
      data-nav-theme="light"
      className="px-6 md:px-10 lg:px-14 pb-16 md:pb-24 lg:pb-28"
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
            <StaggerItem className="max-w-xl">
              <PortableTextBody
                value={lead}
                paragraphClassName="font-display text-xl md:text-2xl lg:text-3xl text-primary-500/40 leading-[1.35] tracking-[-0.01em]"
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
                  paragraphClassName="font-display text-[18px] font-light leading-[1.5] tracking-normal text-primary-500/70"
                />
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}
      </div>
    </section>
  );
}
