import CountUp from "@/app/components/CountUp";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type { PortableTextBlock, Stat } from "@/sanity/lib/types";

/**
 * "The Opportunity" — an eyebrow pinned to the left margin, with the heading
 * and body set in a wide right column, closing on a colour card that pairs a
 * lead line with a divided row of counting stats.
 *
 * The body is two-tone: any phrase the editor wraps in **double asterisks**
 * renders bold — the same convention the initiative headers use (now via
 * PortableTextBody's `strong` mark once migrated to Portable Text).
 */
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
  body?: PortableTextBlock[] | string | null;
  cardLead?: PortableTextBlock[] | string | null;
  stats?: Stat[] | null;
  cardBg?: string | null;
}) {
  const hasStats = !!stats?.length;
  const hasCard = hasStats || !!cardLead;

  return (
    <section
      data-nav-theme="light"
      // Left padding matches StickyTopNav's px (px-6 md:px-10 lg:px-14) so the
      // eyebrow lines up with the logo.
      className="pl-6 md:pl-10 lg:pl-14 pr-6 md:pr-12 lg:pr-20 xl:pr-28 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-[0.24fr_0.76fr] gap-6 lg:gap-10">
        {eyebrow ? (
          <Reveal
            as="span"
            // Eyebrow type per design spec: Albert Sans (via --font-display)
            // SemiBold 600, 18px / 19.2px line-height, no tracking, middle-aligned.
            className="align-middle font-display text-[18px] font-semibold leading-[19.2px] tracking-normal text-primary-500"
          >
            {eyebrow}
          </Reveal>
        ) : null}

        {/* Right column — heading (centred), body, then the stats card. */}
        <div className={eyebrow ? "" : "lg:col-span-2"}>
          <Stagger className="flex flex-col gap-10 md:gap-14 lg:gap-16">
            {heading ? (
              <StaggerItem
                as="h2"
                // Heading per design spec: Albert Sans Medium 500, 48px /
                // 61.44px line-height (ratio 1.28), -1.23px tracking.
                className="lg:text-center align-middle font-display text-2xl md:text-3xl lg:text-[40px] font-medium text-primary-500/40 leading-[1.28] tracking-[-1.23px]"
              >
                {heading}
              </StaggerItem>
            ) : null}
            {body ? (
              <StaggerItem>
                {/* Body per design spec: Albert Sans Light 300, 48px / 77px
                    line-height (ratio 1.604), -1.23px tracking; **bold**
                    phrases render SemiBold via PortableTextBody's strong mark. */}
                <PortableTextBody
                  value={body}
                  paragraphClassName="align-middle font-display text-xl md:text-2xl lg:text-[34px] font-light text-primary-500 leading-[1.604] tracking-[-1.23px]"
                />
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
                <PortableTextBody
                  value={cardLead}
                  paragraphClassName="max-w-3xl align-middle font-display text-[20px] font-light leading-[1.52] tracking-normal text-black"
                />
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
                        className="font-display text-[36px] font-semibold leading-[1.52] tracking-normal text-primary-500"
                      />
                      <span className="font-display text-[14px] font-light leading-[1.52] tracking-normal text-primary-500/70">
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
