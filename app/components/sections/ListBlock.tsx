import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type { InvestorRole } from "@/sanity/lib/types";

import type { SectionComponentProps } from "./registry";

type ListVariant = "ruledRows" | "stackedList" | "numberedList";

/**
 * Page-builder renderer for the `listBlock`. Framed by the Zone. Label /
 * description rows from the shared `investorRole` model, in one of three
 * on-brand layouts:
 *   • ruledRows — a two-column table with top-ruled rows,
 *   • stackedList — title over description, stacked,
 *   • numberedList — stacked with an auto 01/02 counter prefix.
 */
export default function ListBlock({ block }: SectionComponentProps) {
  const heading = (block.heading as string) ?? undefined;
  const intro = (block.intro as string) ?? undefined;
  const items = (block.items as InvestorRole[] | null) ?? [];
  const variant = (
    ["ruledRows", "stackedList", "numberedList"].includes(
      block.variant as string,
    )
      ? block.variant
      : "ruledRows"
  ) as ListVariant;

  if (!items.length && !heading) return null;

  return (
    <div className="mx-auto max-w-page">
      {heading || intro ? (
        <Reveal className="mb-10 max-w-2xl lg:mb-14">
          {heading ? (
            <h2 className="type-h2 balance-text text-primary-500">{heading}</h2>
          ) : null}
          {intro ? (
            <p className="type-lead mt-4 text-primary-500/70">{intro}</p>
          ) : null}
        </Reveal>
      ) : null}

      {items.length ? (
        variant === "ruledRows" ? (
          <Stagger className="flex flex-col">
            {items.map((item, i) => (
              <StaggerItem
                key={`${item.label ?? "row"}-${i}`}
                className="grid grid-cols-1 gap-1 border-t border-primary-500/15 py-5 first:border-t-0 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-8 md:py-6"
              >
                <span className="type-card-heading text-primary-500">
                  {item.label}
                </span>
                {item.description ? (
                  <span className="type-body text-primary-500/70">
                    {item.description}
                  </span>
                ) : null}
              </StaggerItem>
            ))}
          </Stagger>
        ) : variant === "stackedList" ? (
          <Stagger className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-3">
            {items.map((item, i) => (
              <StaggerItem
                key={`${item.label ?? "row"}-${i}`}
                className="flex flex-col gap-2"
              >
                <h3 className="type-card-heading text-primary-500">
                  {item.label}
                </h3>
                {item.description ? (
                  <p className="type-body text-primary-500/70">
                    {item.description}
                  </p>
                ) : null}
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Stagger className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-3">
            {items.map((item, i) => (
              <StaggerItem
                key={`${item.label ?? "row"}-${i}`}
                className="flex flex-col gap-3"
              >
                <span className="type-display text-primary-500/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="type-card-heading text-primary-500">
                  {item.label}
                </h3>
                {item.description ? (
                  <p className="type-body text-primary-500/70">
                    {item.description}
                  </p>
                ) : null}
              </StaggerItem>
            ))}
          </Stagger>
        )
      ) : null}
    </div>
  );
}
