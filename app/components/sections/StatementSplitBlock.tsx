import CtaLink from "@/app/components/CtaLink";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type { Cta, PortableTextBlock } from "@/sanity/lib/types";

import type { SectionComponentProps } from "./registry";

/**
 * Page-builder renderer for the `statementSplitBlock`. Framed by the Zone. A
 * two-column editorial statement: an eyebrow + heading pinned left, with the
 * rich body, an optional emphasized pull-line, and a button stacked right.
 */
export default function StatementSplitBlock({ block }: SectionComponentProps) {
  const eyebrow = (block.eyebrow as string) ?? undefined;
  const heading = (block.heading as string) ?? undefined;
  const body = (block.body as PortableTextBlock[] | null) ?? null;
  const statement = (block.statement as string) ?? undefined;
  const cta = (block.primaryCta as Cta) ?? null;

  if (!heading && !body?.length && !statement) return null;

  return (
    <div className="mx-auto grid max-w-page grid-cols-1 items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      {/* Left — eyebrow + heading. */}
      <Stagger className="flex flex-col gap-5">
        {eyebrow ? (
          <StaggerItem as="span" className="type-eyebrow text-primary-500/50">
            {eyebrow}
          </StaggerItem>
        ) : null}
        {heading ? (
          <StaggerItem
            as="h2"
            className="type-h2 balance-text text-primary-500"
          >
            {heading}
          </StaggerItem>
        ) : null}
      </Stagger>

      {/* Right — body, emphasized statement, then button. */}
      <Stagger className="flex flex-col gap-8">
        {body?.length ? (
          <StaggerItem>
            <PortableTextBody value={body} className="type-lead text-primary-500/75" compact />
          </StaggerItem>
        ) : null}
        {statement ? (
          <StaggerItem
            as="p"
            className="type-h3 balance-text italic text-primary-500"
          >
            {statement}
          </StaggerItem>
        ) : null}
        {cta && (cta.href || cta.label) ? (
          <Reveal>
            <CtaLink
              href={cta.href}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-500 px-6 py-3 type-label text-base-white transition-opacity hover:opacity-90"
            >
              {cta.label || "Learn more"}
            </CtaLink>
          </Reveal>
        ) : null}
      </Stagger>
    </div>
  );
}
