import CountUp from "@/app/components/CountUp";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type { Stat } from "@/sanity/lib/types";

/**
 * "The Opportunity" — an eyebrow pinned to the left margin, with the heading
 * and body set in a wide right column, closing on a colour card that pairs a
 * lead line with a divided row of counting stats.
 *
 * The body is two-tone: any phrase the editor wraps in **double asterisks**
 * renders bold — the same convention the initiative headers use.
 */
function renderEmphasis(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function InvestorsOpportunity({
  eyebrow,
  heading,
  body,
  cardLead,
  stats,
  cardBg,
}: {
  eyebrow?: string | null;
  heading?: string | null;
  body?: string | null;
  cardLead?: string | null;
  stats?: Stat[] | null;
  cardBg?: string | null;
}) {
  const hasStats = !!stats?.length;
  const hasCard = hasStats || !!cardLead;

  return (
    <section
      data-nav-theme="light"
      className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-[0.24fr_0.76fr] gap-6 lg:gap-10">
        {eyebrow ? (
          <Reveal
            as="span"
            className="text-xs md:text-sm font-bold uppercase tracking-[0.14em] text-primary-500"
          >
            {eyebrow}
          </Reveal>
        ) : null}

        {/* Right column — heading (centred), body, then the stats card. */}
        <div className={eyebrow ? "" : "lg:col-span-2"}>
          <Stagger className="flex flex-col gap-6 md:gap-8">
            {heading ? (
              <StaggerItem
                as="h2"
                className="lg:text-center font-display text-2xl md:text-3xl lg:text-4xl font-medium text-primary-500/40 leading-tight tracking-[-0.02em]"
              >
                {heading}
              </StaggerItem>
            ) : null}
            {body ? (
              <StaggerItem
                as="p"
                className="font-display text-xl md:text-2xl lg:text-3xl font-normal text-primary-500 leading-[1.45] tracking-[-0.01em]"
              >
                {renderEmphasis(body)}
              </StaggerItem>
            ) : null}
          </Stagger>

          {hasCard ? (
            <Reveal
              preset="scale"
              className="mt-10 md:mt-12 rounded-2xl p-6 md:p-8 lg:p-10"
              style={{ backgroundColor: cardBg || "#06FE83" }}
            >
              {cardLead ? (
                <p className="max-w-xl text-sm md:text-base text-primary-500/80 leading-relaxed">
                  {cardLead}
                </p>
              ) : null}

              {hasStats ? (
                <Stagger
                  className={`grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6 ${
                    cardLead ? "mt-8 md:mt-12" : ""
                  }`}
                >
                  {stats!.map((stat, i) => (
                    <StaggerItem
                      key={`${stat.value}-${i}`}
                      // Rules divide the row rather than box each stat: the
                      // first column in each row starts flush, the rest carry
                      // a left border.
                      className={`flex flex-col gap-2 ${
                        i % 2 === 0 ? "" : "border-l border-primary-500/20 pl-6"
                      } ${
                        i % 4 === 0
                          ? "lg:border-l-0 lg:pl-0"
                          : "lg:border-l lg:border-primary-500/20 lg:pl-6"
                      }`}
                    >
                      <CountUp
                        value={stat.value}
                        className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-none tracking-[-0.02em]"
                      />
                      <span className="text-xs md:text-sm text-primary-500/70 leading-snug">
                        {stat.description}
                      </span>
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : null}
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
