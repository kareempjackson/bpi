import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal } from "@/app/components/motion";
import { resolveMedia } from "@/sanity/lib/image";
import type { PortableTextBlock } from "@/sanity/lib/types";

import type { SectionComponentProps } from "./registry";

/**
 * Page-builder renderer for the `quoteBlock` — a pull-quote spotlight in its own
 * colour band. Self-framed: it paints the full-bleed band (editor-chosen brand
 * colour, default deep green) so it needs no SectionFrame. Optional portrait
 * sits beside the quote on wide screens.
 */
export default function QuoteBlock({ block }: SectionComponentProps) {
  const eyebrow = (block.eyebrow as string) ?? undefined;
  const quote =
    (block.quote as PortableTextBlock[] | string | null) ?? undefined;
  const name = (block.attributionName as string) ?? undefined;
  const title = (block.attributionTitle as string) ?? undefined;
  const bg = (block.bg as string) ?? "#13362A";
  const portrait = resolveMedia(
    block.portrait as Parameters<typeof resolveMedia>[0],
    { width: 800 },
  );

  if (!quote) return null;

  return (
    <section
      data-surface="dark"
      style={{ backgroundColor: bg }}
      className="w-full py-20 text-base-white md:py-28 lg:py-32"
    >
      <div className="mx-auto grid w-full max-w-page grid-cols-1 items-center gap-10 px-gutter lg:grid-cols-[1fr_auto] lg:gap-16">
        <Reveal className="max-w-3xl">
          {eyebrow ? (
            <span className="type-eyebrow mb-6 block text-base-white/60">
              {eyebrow}
            </span>
          ) : null}
          <PortableTextBody
            value={quote}
            compact
            paragraphClassName="type-quote balance-text text-base-white"
          />
          {name || title ? (
            <footer className="mt-8 flex flex-col gap-0.5">
              {name ? (
                <span className="type-label text-base-white">{name}</span>
              ) : null}
              {title ? (
                <span className="type-body-sm text-base-white/60">{title}</span>
              ) : null}
            </footer>
          ) : null}
        </Reveal>

        {portrait ? (
          <Reveal
            preset="scale"
            className="relative aspect-4/5 w-full max-w-xs overflow-hidden rounded-2xl bg-base-white/5 lg:w-64"
          >
            <MediaImage media={portrait} sizes="(min-width: 1024px) 16rem, 80vw" />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
