import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Stagger, StaggerItem } from "@/app/components/motion";
import type { PortableTextBlock, ResolvedMedia } from "@/sanity/lib/types";

/**
 * "Voices from the Ground" — an eyebrow over a two-tone split heading (first
 * line green, second line indented and dark), then a row of pull-quote cards.
 * Each card sets the quote on a colour block with the speaker's portrait, name,
 * and title anchored to the bottom.
 *
 * Portraits are resolved to `ResolvedMedia` at the page level (the pattern the
 * rest of the page follows), so this stays a plain presentational component.
 */
export type VoiceQuote = {
  quote?: PortableTextBlock[] | string | null;
  name?: string | null;
  title?: string | null;
  bg?: string | null;
  portrait: ResolvedMedia | null;
};

export default function InvestorsVoices({
  eyebrow,
  heading,
  headingTail,
  quotes,
}: {
  eyebrow?: string | null;
  heading?: string | null;
  headingTail?: string | null;
  quotes?: VoiceQuote[] | null;
}) {
  return (
    <section
      data-nav-theme="light"
      className="px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-page">
        <Stagger className="flex flex-col gap-4">
          {eyebrow ? (
            <StaggerItem as="span" className="text-xs md:text-sm text-primary-500/60">
              {eyebrow}
            </StaggerItem>
          ) : null}
          {heading || headingTail ? (
            <StaggerItem
              as="h2"
              className="flex flex-col font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.02] tracking-[-0.02em]"
            >
              {heading ? <span className="text-error-600">{heading}</span> : null}
              {headingTail ? (
                <span className="text-primary-500 pl-[10%]">{headingTail}</span>
              ) : null}
            </StaggerItem>
          ) : null}
        </Stagger>

        {quotes?.length ? (
          <Stagger className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-stretch">
            {quotes.map((q, i) => (
              <StaggerItem
                key={`${q.name ?? "quote"}-${i}`}
                preset="scale"
                className="flex flex-col justify-between gap-10 rounded-2xl p-6 md:p-7"
                style={{ backgroundColor: q.bg || "#FFFFFF" }}
              >
                <PortableTextBody
                  value={q.quote}
                  compact
                  paragraphClassName="font-display text-[18px] font-light italic leading-none tracking-normal text-[#242424]"
                />
                <div className="flex items-center gap-3">
                  {q.portrait ? (
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-primary-500/10">
                      <MediaImage media={q.portrait} sizes="44px" />
                    </span>
                  ) : (
                    <span className="h-11 w-11 shrink-0 rounded-full bg-primary-500/10" />
                  )}
                  <div className="flex flex-col">
                    {q.title ? (
                      <span className="text-xs text-primary-500/60">{q.title}</span>
                    ) : null}
                    {q.name ? (
                      <span className="text-sm font-bold text-primary-500">
                        {q.name}
                      </span>
                    ) : null}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}
      </div>
    </section>
  );
}
