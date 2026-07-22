import Logo from "@/app/components/Logo";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type { InvestorCard } from "@/sanity/lib/types";

/**
 * "Barbados Investment Climate" — a heading over a row of colour cards. Same
 * card treatment as "Why Barbados" (title top, body bottom, per-card colour),
 * but the cards here carry longer descriptive copy.
 */
export default function InvestorsClimate({
  heading,
  cards,
}: {
  heading?: string | null;
  cards?: InvestorCard[] | null;
}) {
  return (
    <section
      data-nav-theme="light"
      className="px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-page">
        {heading ? (
          <Reveal
            as="h2"
            className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
          >
            {heading}
          </Reveal>
        ) : null}

        {cards?.length ? (
          <Stagger className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-stretch">
            {cards.map((card, i) => (
              <StaggerItem
                key={`${card.title ?? "card"}-${i}`}
                preset="scale"
                className="relative flex flex-col gap-4 overflow-hidden rounded-2xl p-6 md:p-7"
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
                <h3 className="relative font-display text-[24px] font-semibold leading-[1.5] tracking-normal text-primary-500">
                  {card.title}
                </h3>
                <PortableTextBody
                  value={card.body}
                  compact
                  paragraphClassName="relative font-display text-[16px] font-light leading-[1.5] tracking-normal text-primary-500/70"
                />
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}
      </div>
    </section>
  );
}
