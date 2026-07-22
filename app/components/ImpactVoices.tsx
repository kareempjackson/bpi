import CtaLink from "@/app/components/CtaLink";
import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Stagger, StaggerItem } from "@/app/components/motion";
import type { PortableTextBlock, ResolvedMedia } from "@/sanity/lib/types";

/**
 * "Voices from the Ground" (Impact page) — a dark section with an eyebrow over
 * a two-tone split heading (green first line, white indented second line), a
 * row of pull-quote cards on rotating colour blocks, and a trailing CTA.
 *
 * Portraits are resolved to `ResolvedMedia` at the page level so this stays a
 * plain presentational component.
 */
export type ImpactVoice = {
  quote?: PortableTextBlock[] | string | null;
  name?: string | null;
  title?: string | null;
  bg?: string | null;
  portrait: ResolvedMedia | null;
};

// Default card colours when a quote leaves `bg` unset — mint, white, sky,
// butter — cycled by position.
const CARD_PALETTE = ["#A7F3C0", "#FFFFFF", "#CFE8F5", "#FBF1B4"];

export default function ImpactVoices({
  eyebrow,
  heading,
  headingTail,
  quotes,
  cta,
}: {
  eyebrow?: string | null;
  heading?: string | null;
  headingTail?: string | null;
  quotes?: ImpactVoice[] | null;
  cta?: { label: string; href: string } | null;
}) {
  return (
    <section
      data-nav-theme="dark"
      className="bg-primary-500 px-6 md:px-10 lg:px-14 py-20 md:py-28 lg:py-32"
    >
      <Stagger className="flex flex-col gap-4">
        {eyebrow ? (
          <StaggerItem as="span" className="text-xs md:text-sm text-white/60">
            {eyebrow}
          </StaggerItem>
        ) : null}
        {heading || headingTail ? (
          <StaggerItem
            as="h2"
            className="flex flex-col font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.02] tracking-[-0.02em]"
          >
            {heading ? <span className="text-error-500">{heading}</span> : null}
            {headingTail ? (
              <span className="pl-[10%] text-white">{headingTail}</span>
            ) : null}
          </StaggerItem>
        ) : null}
      </Stagger>

      {quotes?.length ? (
        <Stagger className="mt-12 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 md:mt-16 md:gap-4 lg:grid-cols-4">
          {quotes.map((q, i) => (
            <StaggerItem
              key={`${q.name ?? "quote"}-${i}`}
              preset="scale"
              className="flex flex-col justify-between gap-10 rounded-2xl p-6 md:p-7"
              style={{
                backgroundColor:
                  q.bg || CARD_PALETTE[i % CARD_PALETTE.length],
              }}
            >
              <PortableTextBody
                value={q.quote}
                compact
                paragraphClassName="font-display text-[18px] font-light italic leading-snug tracking-normal text-[#242424]"
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
                    <span className="text-xs text-primary-500/60">
                      {q.title}
                    </span>
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

      {cta?.label ? (
        <div className="mt-12 flex justify-end md:mt-16">
          <CtaLink
            href={cta.href}
            className="inline-flex w-fit items-center rounded-round border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
          >
            {cta.label}
          </CtaLink>
        </div>
      ) : null}
    </section>
  );
}
