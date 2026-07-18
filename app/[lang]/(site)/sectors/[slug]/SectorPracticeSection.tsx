import type { CSSProperties } from "react";

import CtaLink from "@/app/components/CtaLink";
import MediaImage from "@/app/components/MediaImage";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import type { ResolvedMedia } from "@/sanity/lib/types";

/**
 * "What This Looks Like In Practice" — a two-column detail block (heading left;
 * lead + optional supporting paragraphs + optional "programs" list right) over
 * the sector's light canvas. Below the grid it renders whichever of these is
 * supplied: a full-width "What This Creates" statement block, and/or a
 * full-width image.
 *
 * The two CTAs sit in the right column by default, but drop to the bottom
 * (under the "What This Creates" statement) when that block is present — so the
 * buttons always follow the last piece of copy.
 *
 * Colours follow the sector's profile: `bg` is the light section canvas and
 * `ink` the dark heading/text colour (usually the sector's `pageColor`). The
 * primary button fills with `ink`; the secondary is an `ink` outline — the
 * inverse of the header pills, which sit on the dark hero.
 */
type CtaValue = { label?: string | null; href?: string | null } | null | undefined;

type ListItem = { term?: string | null; body?: string | null };

type Card = { title?: string | null; body?: string | null; tone?: string | null };

// Card background per tone. Text stays on the sector ink (navy) in every tone,
// which reads on white, the blue tint, and the green.
const CARD_TONE_BG: Record<string, string> = {
  default: "#FFFFFF",
  blue: "#CBE7FB",
  green: "#5BDE8C",
};

/**
 * Stack the heading so the final word sits on its own line — e.g.
 * "What This Looks Like In" / "Practice". Deterministic regardless of column
 * width; a single-word heading is returned unchanged.
 */
function headingLines(heading: string) {
  const words = heading.trim().split(/\s+/);
  if (words.length < 2) return heading;
  const last = words.pop();
  return (
    <>
      <span className="block">{words.join(" ")}</span>
      <span className="block">{last}</span>
    </>
  );
}

type Props = {
  heading?: string | null;
  lead?: string | null;
  /** Supporting body paragraphs, already split. */
  paragraphs: string[];
  /** Optional "Programs Underway"-style subheading above the bullet list. */
  listHeading?: string | null;
  /** Optional bullet list — bold term + description. */
  list?: ListItem[];
  /** Optional eyebrow above the closing statement (e.g. "What This Creates"). */
  createsLabel?: string | null;
  /** Optional large closing statement, full width below the grid. */
  createsStatement?: string | null;
  primaryCta?: CtaValue;
  secondaryCta?: CtaValue;
  /** Up to three colour-toned cards shown in a row below the buttons. */
  cards?: Card[];
  media: ResolvedMedia | null;
  /** Section canvas colour (light). */
  bg: string;
  /** Ink colour for the heading + text (dark). */
  ink: string;
  lang: string;
  /** When true (default) the heading's last word is pushed onto its own line;
   *  set false to keep short headings (e.g. "Operational Now") on one line. */
  splitHeading?: boolean;
};

export default function SectorPracticeSection({
  heading,
  lead,
  paragraphs,
  listHeading,
  list,
  createsLabel,
  createsStatement,
  primaryCta,
  secondaryCta,
  cards,
  media,
  bg,
  ink,
  lang,
  splitHeading = true,
}: Props) {
  const hasPrimary = !!primaryCta?.label;
  const hasSecondary = !!secondaryCta?.label;
  const listItems = (list ?? []).filter((it) => it.term || it.body);
  const hasList = !!listHeading || listItems.length > 0;
  const hasCreates = !!createsLabel || !!createsStatement;
  const cardItems = (cards ?? []).filter((c) => c.title || c.body);

  // Reused in one of two placements: the right column (default), or under the
  // "What This Creates" statement when that block is present.
  const ctaRow =
    hasPrimary || hasSecondary ? (
      <div className="flex flex-wrap items-center gap-3 pt-3">
        {hasPrimary ? (
          <CtaLink
            href={localizedHref(lang, primaryCta!.href)}
            className="inline-flex items-center justify-center rounded-round bg-(--ink) px-6 py-3 text-sm font-semibold text-white transition-opacity duration-300 ease-[var(--ease-premium)] hover:opacity-90"
          >
            {primaryCta!.label}
          </CtaLink>
        ) : null}
        {hasSecondary ? (
          <CtaLink
            href={localizedHref(lang, secondaryCta!.href)}
            className="inline-flex items-center justify-center rounded-round border border-(--ink)/40 px-6 py-3 text-sm font-semibold text-(--ink) transition-colors duration-300 ease-[var(--ease-premium)] hover:border-(--ink) hover:bg-(--ink)/5"
          >
            {secondaryCta!.label}
          </CtaLink>
        ) : null}
      </div>
    ) : null;

  return (
    <section
      data-nav-theme="light"
      style={{ backgroundColor: bg, "--ink": ink } as CSSProperties}
      // Nav-aligned gutters (match StickyTopNav's px) so the content lines up
      // with the logo on the left and the menu on the right.
      className="px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-page">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* Left — heading. */}
          {heading ? (
            <Stagger>
              <StaggerItem
                as="h2"
                className="font-display text-3xl md:text-4xl font-bold text-(--ink) leading-[1.1] tracking-[-0.02em] text-balance"
              >
                {splitHeading ? headingLines(heading) : heading}
              </StaggerItem>
            </Stagger>
          ) : (
            <span />
          )}

          {/* Right — lead, body, optional programs list, (buttons). */}
          <Stagger className="flex max-w-5xl flex-col gap-7">
            {lead ? (
              <StaggerItem
                as="p"
                className="text-xl md:text-2xl text-(--ink) leading-relaxed tracking-[-0.01em]"
              >
                {lead}
              </StaggerItem>
            ) : null}
            {paragraphs.map((p, i) => (
              <StaggerItem
                as="p"
                key={i}
                className="text-base md:text-lg text-(--ink)/70 leading-[1.75]"
              >
                {p}
              </StaggerItem>
            ))}
            {hasList ? (
              <StaggerItem>
                <div className="flex flex-col gap-5 pt-1">
                  {listHeading ? (
                    <h3 className="font-display text-lg md:text-xl font-bold text-(--ink) tracking-[-0.01em]">
                      {listHeading}
                    </h3>
                  ) : null}
                  {listItems.length > 0 ? (
                    <ul className="flex flex-col gap-4 pl-5 list-disc marker:text-(--ink)/40">
                      {listItems.map((it, i) => (
                        <li
                          key={i}
                          className="pl-1.5 text-base md:text-lg text-(--ink)/70 leading-[1.75]"
                        >
                          {it.term ? (
                            <span className="font-semibold text-(--ink)">
                              {it.term}
                            </span>
                          ) : null}
                          {it.term && it.body ? " – " : null}
                          {it.body}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </StaggerItem>
            ) : null}
            {!hasCreates && ctaRow ? <StaggerItem>{ctaRow}</StaggerItem> : null}
          </Stagger>
        </div>

        {/* Full-width "What This Creates" statement + (buttons). */}
        {hasCreates ? (
          <Stagger className="mt-16 md:mt-20 lg:mt-24 flex max-w-4xl flex-col gap-6">
            {createsLabel ? (
              <StaggerItem
                as="p"
                className="text-sm font-medium tracking-[0.02em] text-(--ink)/55"
              >
                {createsLabel}
              </StaggerItem>
            ) : null}
            {createsStatement ? (
              <StaggerItem
                as="p"
                className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-(--ink) leading-tight tracking-[-0.02em]"
              >
                {createsStatement}
              </StaggerItem>
            ) : null}
            {ctaRow ? <StaggerItem>{ctaRow}</StaggerItem> : null}
          </Stagger>
        ) : null}

        {cardItems.length > 0 ? (
          <Stagger className="mt-16 md:mt-20 lg:mt-24 grid grid-cols-1 gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cardItems.map((c, i) => (
              <StaggerItem
                key={i}
                className="flex flex-col gap-5 rounded-2xl lg:rounded-3xl p-7 md:p-8 lg:p-9"
                style={{ backgroundColor: CARD_TONE_BG[c.tone ?? "default"] ?? CARD_TONE_BG.default }}
              >
                {c.title ? (
                  <h3 className="font-display text-xl md:text-2xl font-bold text-(--ink) leading-snug tracking-[-0.01em] md:min-h-15">
                    {c.title}
                  </h3>
                ) : null}
                {c.body ? (
                  <p className="text-sm md:text-base text-(--ink)/75 leading-[1.7]">
                    {c.body}
                  </p>
                ) : null}
              </StaggerItem>
            ))}
          </Stagger>
        ) : media ? (
          <Reveal
            preset="scale"
            className="relative mt-16 md:mt-20 lg:mt-24 w-full aspect-4/3 sm:aspect-video lg:aspect-2/1 overflow-hidden rounded-md"
          >
            <MediaImage media={media} sizes="100vw" />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
