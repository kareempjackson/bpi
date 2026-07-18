import type { CSSProperties, ReactNode } from "react";

import CtaLink from "@/app/components/CtaLink";
import MediaImage from "@/app/components/MediaImage";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import type { ResolvedMedia } from "@/sanity/lib/types";

type CtaValue = { label?: string | null; href?: string | null } | null | undefined;

export type BeingBuiltItem = {
  heading?: string | null;
  subtitle?: string | null;
  body?: string | null;
};

type Props = {
  eyebrow?: string | null;
  items: BeingBuiltItem[];
  media: ResolvedMedia | null;
  primaryCta?: CtaValue;
  secondaryCta?: CtaValue;
  /** Section canvas colour (light). */
  bg: string;
  /** Ink colour for the headings + text (dark). */
  ink: string;
  lang: string;
};

/** A small caption body prefixed with the editorial short-rule accent. */
function RuledBody({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span aria-hidden className="mt-3 h-px w-10 shrink-0 bg-(--ink)/25" />
      <p className="max-w-lg text-sm md:text-base text-(--ink)/55 leading-[1.6]">
        {children}
      </p>
    </div>
  );
}

/**
 * "Being built" — an editorial, staggered pipeline block: an eyebrow, a feature
 * item (big heading + a rule-accented caption), then a photo beside a column
 * carrying the remaining items (a second heading + light subtitle, further
 * rule-accented captions) and the CTAs. Content is fully editor-managed; the
 * layout adapts to however many items are supplied.
 */
export default function SectorBeingBuiltSection({
  eyebrow,
  items,
  media,
  primaryCta,
  secondaryCta,
  bg,
  ink,
  lang,
}: Props) {
  const [feature, ...rest] = items;
  const right1 = rest[0];
  const rightRest = rest.slice(1);
  const hasPrimary = !!primaryCta?.label;
  const hasSecondary = !!secondaryCta?.label;

  const headingClass =
    "font-display text-3xl md:text-4xl lg:text-5xl font-bold text-(--ink) leading-[1.05] tracking-[-0.02em]";

  return (
    <section
      data-nav-theme="light"
      style={{ backgroundColor: bg, "--ink": ink } as CSSProperties}
      // Nav-aligned gutters (match StickyTopNav's px) so the content lines up
      // with the logo on the left and the menu on the right.
      className="px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-page">
        {/* Eyebrow + feature item. */}
        <Stagger className="flex flex-col gap-8 md:gap-10">
          {eyebrow ? (
            <StaggerItem
              as="p"
              className="text-sm font-medium uppercase tracking-[0.12em] text-(--ink)/60"
            >
              {eyebrow}
            </StaggerItem>
          ) : null}
          {feature ? (
            <div className="flex flex-col gap-6">
              {feature.heading ? (
                <StaggerItem as="h2" className={`max-w-4xl ${headingClass}`}>
                  {feature.heading}
                </StaggerItem>
              ) : null}
              {feature.body ? (
                <StaggerItem>
                  <RuledBody>{feature.body}</RuledBody>
                </StaggerItem>
              ) : null}
            </div>
          ) : null}
        </Stagger>

        {/* Image (left) beside the remaining items + CTAs (right). */}
        <div className="mt-14 md:mt-20 grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
          {media ? (
            <Reveal
              preset="scale"
              className="relative order-2 aspect-4/5 w-full max-w-sm overflow-hidden rounded-md lg:order-1 lg:ml-auto lg:mr-0"
            >
              <MediaImage
                media={media}
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </Reveal>
          ) : (
            <span className="hidden lg:block" />
          )}

          <Stagger className="order-1 flex flex-col gap-10 lg:order-2">
            {right1 ? (
              <div className="flex flex-col gap-3">
                {right1.heading ? (
                  <StaggerItem as="h3" className={headingClass}>
                    {right1.heading}
                  </StaggerItem>
                ) : null}
                {right1.subtitle ? (
                  <StaggerItem
                    as="p"
                    className="max-w-xl text-2xl md:text-3xl lg:text-4xl font-normal text-(--ink)/40 leading-tight tracking-[-0.01em]"
                  >
                    {right1.subtitle}
                  </StaggerItem>
                ) : null}
              </div>
            ) : null}

            {rightRest.map((it, i) =>
              it.body ? (
                <StaggerItem key={i}>
                  <RuledBody>{it.body}</RuledBody>
                </StaggerItem>
              ) : null,
            )}

            {hasPrimary || hasSecondary ? (
              <StaggerItem className="flex flex-wrap items-center gap-3 pt-2">
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
              </StaggerItem>
            ) : null}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
