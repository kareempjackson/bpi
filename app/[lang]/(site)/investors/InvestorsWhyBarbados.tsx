import Logo from "@/app/components/Logo";
import MediaImage from "@/app/components/MediaImage";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type { InvestorCard, ResolvedMedia } from "@/sanity/lib/types";

/**
 * "Why Barbados, Why Now" — heading left, intro right, a row of colour cards
 * (title pinned top, body anchored bottom), then a closing paragraph and a
 * wide image.
 */
export default function InvestorsWhyBarbados({
  heading,
  intro,
  cards,
  closing,
  media,
}: {
  heading?: string | null;
  intro?: string | null;
  cards?: InvestorCard[] | null;
  closing?: string | null;
  media: ResolvedMedia | null;
}) {
  return (
    <section
      data-nav-theme="light"
      className="px-6 md:px-12 lg:px-20 xl:px-28 pt-24 md:pt-32 lg:pt-40 pb-16 md:pb-24 lg:pb-28"
    >
      <div className="mx-auto w-full max-w-page">
        {heading || intro ? (
          <Stagger className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-10 items-start">
            {heading ? (
              <StaggerItem
                as="h2"
                className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
              >
                {heading}
              </StaggerItem>
            ) : null}
            {intro ? (
              <StaggerItem
                as="p"
                className="max-w-md text-sm md:text-base text-primary-500/75 leading-relaxed"
              >
                {intro}
              </StaggerItem>
            ) : null}
          </Stagger>
        ) : null}

        {cards?.length ? (
          <Stagger className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {cards.map((card, i) => (
              <StaggerItem
                key={`${card.title ?? "card"}-${i}`}
                preset="scale"
                className="relative flex min-h-56 md:min-h-64 lg:min-h-72 flex-col justify-between gap-10 overflow-hidden rounded-2xl p-6 md:p-7"
                style={{ backgroundColor: card.bg || "#FFFFFF" }}
              >
                {card.watermark ? (
                  <Logo
                    iconOnly
                    size={260}
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-6 text-primary-500/8"
                  />
                ) : null}
                <h3 className="relative text-sm md:text-base font-bold text-primary-500 leading-snug">
                  {card.title}
                </h3>
                <p className="relative text-xs md:text-sm text-primary-500/75 leading-relaxed">
                  {card.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}

        {closing ? (
          <Reveal
            as="p"
            // Closing statement per design spec: Albert Sans Light 300, 36px /
            // 52px line-height (ratio 1.444), no tracking, middle-aligned.
            className="mt-12 md:mt-16 lg:max-w-[75%] align-middle font-display text-2xl md:text-3xl lg:text-[36px] font-light text-primary-500 leading-[1.444] tracking-normal"
          >
            {closing}
          </Reveal>
        ) : null}

        {media ? (
          <Reveal
            preset="scale"
            className="relative mt-10 md:mt-14 w-full aspect-4/3 sm:aspect-video lg:aspect-21/9 overflow-hidden rounded-2xl bg-primary-500/5"
          >
            <MediaImage media={media} sizes="100vw" />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
