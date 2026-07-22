import Logo from "@/app/components/Logo";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Stagger, StaggerItem } from "@/app/components/motion";
import { plainText } from "@/app/lib/plainText";
import type { InvestorCard, PortableTextBlock } from "@/sanity/lib/types";

import type { SectionComponentProps } from "./registry";

const COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

/**
 * Page-builder renderer for the `cardGridBlock`. Framed by the Zone. A heading +
 * intro over a responsive grid of colour cards (shared `investorCard` model —
 * title top, body bottom, per-card brand background). Column count is editor-set.
 */
export default function CardGridBlock({ block }: SectionComponentProps) {
  const heading = (block.heading as string) ?? undefined;
  const intro =
    plainText(block.intro as PortableTextBlock[] | string | null) || undefined;
  const cards = (block.cards as InvestorCard[] | null) ?? [];
  const columns = block.columns === 2 || block.columns === 4 ? block.columns : 3;

  if (!cards.length && !heading) return null;

  return (
    <div className="mx-auto max-w-page">
      {heading || intro ? (
        <Stagger className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-10">
          {heading ? (
            <StaggerItem as="h2" className="type-h2 balance-text text-primary-500">
              {heading}
            </StaggerItem>
          ) : null}
          {intro ? (
            <StaggerItem as="p" className="type-body max-w-md text-primary-500/75">
              {intro}
            </StaggerItem>
          ) : null}
        </Stagger>
      ) : null}

      {cards.length ? (
        <Stagger
          className={`mt-10 grid grid-cols-1 gap-3 md:mt-14 md:gap-4 ${COLS[columns]}`}
        >
          {cards.map((card, i) => (
            <StaggerItem
              key={`${card.title ?? "card"}-${i}`}
              preset="scale"
              className="relative flex min-h-56 flex-col justify-between gap-10 overflow-hidden rounded-2xl p-6 md:min-h-64 md:p-7"
              style={{ backgroundColor: card.bg || "#FFFFFF" }}
            >
              {card.watermark ? (
                <Logo
                  iconOnly
                  size={260}
                  aria-hidden
                  className="pointer-events-none absolute -top-6 -right-10 text-primary-500/8"
                />
              ) : null}
              {card.title ? (
                <h3 className="type-card-heading relative text-primary-500">
                  {card.title}
                </h3>
              ) : null}
              {card.body ? (
                <PortableTextBody
                  value={card.body}
                  compact
                  paragraphClassName="type-body-sm relative text-primary-500/75"
                />
              ) : null}
            </StaggerItem>
          ))}
        </Stagger>
      ) : null}
    </div>
  );
}
