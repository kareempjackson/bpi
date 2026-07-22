import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type { ContactRow } from "@/sanity/lib/types";

import type { SectionComponentProps } from "./registry";

/**
 * Page-builder renderer for the `contactRowsBlock`. Framed by the Zone. A clean
 * label | value grid from the shared `contactRow` model. Static — the copy-to-
 * clipboard button on the contact page is client-only, so values render plainly
 * here.
 */
export default function ContactRowsBlock({ block }: SectionComponentProps) {
  const heading = (block.heading as string) ?? undefined;
  const rows = (block.rows as ContactRow[] | null) ?? [];

  if (!rows.length && !heading) return null;

  return (
    <div className="mx-auto max-w-page">
      {heading ? (
        <Reveal className="mb-10 max-w-2xl lg:mb-14">
          <h2 className="type-h2 balance-text text-primary-500">{heading}</h2>
        </Reveal>
      ) : null}

      {rows.length ? (
        <Stagger className="flex flex-col">
          {rows.map((row, i) => (
            <StaggerItem
              key={`${row.label ?? "row"}-${i}`}
              className="grid grid-cols-1 gap-1 border-t border-primary-500/15 py-5 first:border-t-0 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8 md:py-6"
            >
              <span className="type-card-heading text-primary-500">
                {row.label}
              </span>
              {row.value ? (
                <span className="type-body text-primary-500/80">
                  {row.value}
                </span>
              ) : null}
            </StaggerItem>
          ))}
        </Stagger>
      ) : null}
    </div>
  );
}
