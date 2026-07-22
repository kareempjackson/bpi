import CountUp from "@/app/components/CountUp";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { plainText } from "@/app/lib/plainText";
import type { PortableTextBlock, Stat } from "@/sanity/lib/types";

import type { SectionComponentProps } from "./registry";

/**
 * Page-builder renderer for the `statsBlock`. Framed by the Zone. Two on-brand
 * layouts share one content model (heading + lead + stats[]):
 *   • filledCards — each stat in a soft surface card,
 *   • bareColumns — a rule-divided row, no card chrome.
 * Values animate via the shared CountUp component.
 */
export default function StatsBlock({ block }: SectionComponentProps) {
  const heading = (block.heading as string) ?? undefined;
  const lead =
    plainText(block.lead as PortableTextBlock[] | string | null) || undefined;
  // Coerce stat descriptions to plain text — build-safe if switched to WYSIWYG.
  const stats = ((block.stats as Stat[] | null) ?? []).map((s) => ({
    ...s,
    description: plainText(s.description),
  }));
  const variant = block.variant === "bareColumns" ? "bareColumns" : "filledCards";

  if (!stats.length && !heading) return null;

  return (
    <div className="mx-auto max-w-page">
      {heading || lead ? (
        <Reveal className="mb-10 max-w-2xl lg:mb-14">
          {heading ? (
            <h2 className="type-h2 balance-text text-primary-500">{heading}</h2>
          ) : null}
          {lead ? (
            <p className="type-lead mt-4 text-primary-500/70">{lead}</p>
          ) : null}
        </Reveal>
      ) : null}

      {stats.length ? (
        variant === "filledCards" ? (
          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <StaggerItem
                key={`${stat.value}-${i}`}
                preset="scale"
                className="flex flex-col gap-3 rounded-2xl bg-base-white p-6 md:p-7"
              >
                <CountUp
                  value={stat.value}
                  className="type-display text-primary-500"
                />
                <span className="type-body-sm text-primary-500/70">
                  {stat.description}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Stagger className="grid grid-cols-2 gap-y-10 gap-x-6 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <StaggerItem
                key={`${stat.value}-${i}`}
                className={`flex flex-col gap-3 ${
                  i % 2 === 0 ? "" : "border-l border-primary-500/15 pl-6"
                } ${
                  i % 4 === 0
                    ? "lg:border-l-0 lg:pl-0"
                    : "lg:border-l lg:border-primary-500/15 lg:pl-6"
                }`}
              >
                <CountUp
                  value={stat.value}
                  className="type-display text-primary-500"
                />
                <span className="type-body-sm text-primary-500/70">
                  {stat.description}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        )
      ) : null}
    </div>
  );
}
