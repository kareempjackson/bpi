import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import MediaImage from "@/app/components/MediaImage";
import { MEDIA_OBJECT_POSITION } from "@/app/components/ViewTransitionProvider";
import { Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import type { ResolvedMedia } from "@/sanity/lib/types";

/**
 * Per-sector detail-page header. One of four layouts, chosen by the sector's
 * `headerLayout` field, all sharing the same content (title, subtitle, two
 * CTAs, hero image) and the same colour profile:
 *
 *  - `pageColor`     — the dark section/background colour (also the nav + footer tint).
 *  - `headingColor`  — optional accent for the title + primary button. When unset,
 *                      the title keeps the default mint (`text-error-500`) and the
 *                      primary button is a plain white pill, so existing sectors are
 *                      untouched.
 *
 * Layouts:
 *  - split       — title left, subtitle + buttons right, full-bleed image below.
 *  - centered    — everything centred, full-bleed image below.
 *  - sideBySide  — text column beside a contained (rounded) image, no full bleed.
 *  - overlay     — copy set over the hero image with a dark scrim.
 *  - showcase    — full-height hero: copy anchored bottom-left beside a tall,
 *                  contained image on the right.
 *  - spotlight   — tall contained image on the LEFT, title top-right, and the
 *                  subtitle + buttons anchored bottom-right. The title stays
 *                  white here; the primary button still takes the profile accent.
 *  - masthead    — the title's first word sits top-left above a tall image, the
 *                  rest of the title flows to its right, and the subtitle +
 *                  buttons anchor bottom-right. Title always white.
 *
 * The hero image is always rendered static (no reveal) inside a
 * `[data-sector-hero]` rect with `MEDIA_OBJECT_POSITION` framing — it is the
 * landing target for the home-diagram "dive through the porthole" view
 * transition (see app/components/ViewTransitionProvider.tsx), which needs a
 * stable, fully-formed rect the moment the route commits.
 */
export type SectorHeaderLayout =
  | "split"
  | "centered"
  | "sideBySide"
  | "overlay"
  | "showcase"
  | "spotlight"
  | "masthead";

type CtaValue = { label?: string | null; href?: string | null } | null | undefined;

type Props = {
  title: string;
  subtitle?: string | null;
  primaryCta?: CtaValue;
  secondaryCta?: CtaValue;
  heroMedia: ResolvedMedia | null;
  pageColor: string;
  headingColor?: string | null;
  layout?: SectorHeaderLayout | null;
  lang: string;
};

const CONTAINER = "relative mx-auto max-w-page px-6 md:px-12 lg:px-20 xl:px-28";
// Nav-aligned gutters: match StickyTopNav's px (px-6 md:px-10 lg:px-14) so
// header copy lines up with the logo on the left and the menu on the right.
const NAV_CONTAINER = "relative mx-auto max-w-page px-6 md:px-10 lg:px-14";
const TITLE_BASE =
  "font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-[-0.02em]";
const SUBTITLE_BASE = "text-base md:text-lg text-white/80 leading-relaxed";
const FULL_BLEED_ASPECT = "relative w-full aspect-4/3 sm:aspect-video lg:aspect-2/1";

/** The two header pills. Primary tints to `headingColor` when present. */
function HeaderCtas({
  primaryCta,
  secondaryCta,
  headingColor,
  pageColor,
  lang,
  align,
}: {
  primaryCta?: CtaValue;
  secondaryCta?: CtaValue;
  headingColor?: string | null;
  pageColor: string;
  lang: string;
  align?: "start" | "center";
}) {
  const hasPrimary = !!primaryCta?.label;
  const hasSecondary = !!secondaryCta?.label;
  if (!hasPrimary && !hasSecondary) return null;

  const primaryClass = headingColor
    ? "inline-flex items-center justify-center rounded-round px-6 py-3 text-sm font-semibold transition-opacity duration-300 ease-[var(--ease-premium)] hover:opacity-90"
    : "inline-flex items-center justify-center rounded-round bg-white/95 px-6 py-3 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-[var(--ease-premium)] hover:bg-white";

  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${
        align === "center" ? "justify-center" : ""
      }`}
    >
      {hasPrimary ? (
        <CtaLink
          href={localizedHref(lang, primaryCta!.href)}
          className={primaryClass}
          style={
            headingColor
              ? { backgroundColor: headingColor, color: pageColor }
              : undefined
          }
        >
          {primaryCta!.label}
        </CtaLink>
      ) : null}
      {hasSecondary ? (
        <CtaLink
          href={localizedHref(lang, secondaryCta!.href)}
          className="inline-flex items-center justify-center rounded-round border border-white/50 px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 ease-[var(--ease-premium)] hover:border-white/80 hover:bg-white/10"
        >
          {secondaryCta!.label}
        </CtaLink>
      ) : null}
    </div>
  );
}

/** Static hero image + `[data-sector-hero]` transition target. */
function HeroImage({
  media,
  className,
  sizes = "100vw",
}: {
  media: ResolvedMedia;
  className: string;
  sizes?: string;
}) {
  return (
    <div data-sector-hero className={className}>
      <MediaImage
        media={media}
        sizes={sizes}
        preload
        eager
        objectPositionStyle={MEDIA_OBJECT_POSITION}
      />
    </div>
  );
}

export default function SectorHeader({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  heroMedia,
  pageColor,
  headingColor,
  layout,
  lang,
}: Props) {
  const titleColorClass = headingColor ? "" : "text-error-500";
  const titleStyle = headingColor ? { color: headingColor } : undefined;
  const hasCtas = !!primaryCta?.label || !!secondaryCta?.label;

  const ctas = (
    <HeaderCtas
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      headingColor={headingColor}
      pageColor={pageColor}
      lang={lang}
    />
  );

  const sectionProps = {
    "data-nav-theme": "dark" as const,
    "data-cursor": "icon" as const,
    "data-nav-bg": pageColor,
    style: { backgroundColor: pageColor },
    className: "relative overflow-hidden",
  };

  // ── Overlay: copy set over the hero image ──────────────────────────────────
  if (layout === "overlay") {
    return (
      <section {...sectionProps}>
        {heroMedia ? (
          <div data-sector-hero className="absolute inset-0">
            <MediaImage
              media={heroMedia}
              sizes="100vw"
              preload
              eager
              objectPositionStyle={MEDIA_OBJECT_POSITION}
            />
            {/* Dark scrim so the copy stays legible over any photo. */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/45 to-black/25" />
          </div>
        ) : (
          <GridHoverBackdrop />
        )}
        <div
          className={`${CONTAINER} flex min-h-[68vh] flex-col justify-end pt-40 pb-14 md:pb-16 lg:pb-20`}
        >
          <Stagger className="flex max-w-2xl flex-col gap-6">
            <StaggerItem
              as="h1"
              className={`${TITLE_BASE} ${titleColorClass}`}
              style={titleStyle}
            >
              {title}
            </StaggerItem>
            {subtitle ? (
              <StaggerItem as="p" className={`max-w-xl ${SUBTITLE_BASE}`}>
                {subtitle}
              </StaggerItem>
            ) : null}
            {hasCtas ? <StaggerItem>{ctas}</StaggerItem> : null}
          </Stagger>
        </div>
      </section>
    );
  }

  // ── Showcase: full-height hero, copy bottom-left beside a tall image ───────
  if (layout === "showcase") {
    return (
      <section {...sectionProps}>
        <GridHoverBackdrop />
        <div className="grid grid-cols-1 pt-0 md:pt-3 lg:min-h-svh lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
          {/* Left copy padding matches StickyTopNav's px (px-6 md:px-10 lg:px-14)
              so the text lines up with the left edge of the logo in the nav. */}
          <Stagger className="order-2 flex flex-col justify-end gap-6 px-6 pb-16 md:px-10 lg:order-1 lg:pl-14 lg:pr-0 lg:pb-[20vh]">
            <StaggerItem
              as="h1"
              className={`max-w-xl ${TITLE_BASE}`}
              style={{ color: "#ABE8FE" }}
            >
              {title}
            </StaggerItem>
            {subtitle ? (
              <StaggerItem
                as="p"
                // Header body type per design spec: Avenir Next (via
                // --font-sans) Medium 20px / 176% line-height / 0.48px
                // tracking, pure white.
                className="max-w-4xl align-middle font-sans text-[20px] font-medium leading-[1.76] tracking-[0.48px] text-white/100"
              >
                {subtitle}
              </StaggerItem>
            ) : null}
            {hasCtas ? <StaggerItem>{ctas}</StaggerItem> : null}
          </Stagger>
          {heroMedia ? (
            <HeroImage
              media={heroMedia}
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="relative order-1 mx-6 aspect-3/4 min-h-80 overflow-hidden rounded-md md:mx-12 lg:order-2 lg:mx-0 lg:-mt-1 lg:translate-x-6 lg:aspect-auto lg:h-[80vh] lg:self-start lg:rounded-md"
            />
          ) : null}
        </div>
      </section>
    );
  }

  // ── Side-by-side: text column beside a contained image ─────────────────────
  if (layout === "sideBySide") {
    return (
      <section {...sectionProps}>
        <GridHoverBackdrop />
        <div
          className={`${CONTAINER} pt-24 md:pt-28 lg:pt-28 pb-14 md:pb-20 lg:pb-24`}
        >
          <Stagger className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-8">
              <StaggerItem
                as="h1"
                className={`max-w-xl ${TITLE_BASE} ${titleColorClass}`}
                style={titleStyle}
              >
                {title}
              </StaggerItem>
              {subtitle ? (
                <StaggerItem as="p" className={`max-w-md ${SUBTITLE_BASE}`}>
                  {subtitle}
                </StaggerItem>
              ) : null}
              {hasCtas ? <StaggerItem>{ctas}</StaggerItem> : null}
            </div>
            {heroMedia ? (
              <HeroImage
                media={heroMedia}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="relative aspect-4/3 w-full overflow-hidden rounded-2xl lg:rounded-3xl"
              />
            ) : null}
          </Stagger>
        </div>
      </section>
    );
  }

  // ── Centered: everything centred, full-bleed image below ───────────────────
  if (layout === "centered") {
    return (
      <section {...sectionProps}>
        <GridHoverBackdrop />
        <div
          className={`${CONTAINER} pt-24 md:pt-28 lg:pt-28 pb-10 md:pb-14 lg:pb-16`}
        >
          <Stagger className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
            <StaggerItem
              as="h1"
              className={`${TITLE_BASE} ${titleColorClass}`}
              style={titleStyle}
            >
              {title}
            </StaggerItem>
            {subtitle ? (
              <StaggerItem as="p" className={`max-w-xl ${SUBTITLE_BASE}`}>
                {subtitle}
              </StaggerItem>
            ) : null}
            {hasCtas ? (
              <StaggerItem>
                <HeaderCtas
                  primaryCta={primaryCta}
                  secondaryCta={secondaryCta}
                  headingColor={headingColor}
                  pageColor={pageColor}
                  lang={lang}
                  align="center"
                />
              </StaggerItem>
            ) : null}
          </Stagger>
        </div>
        {heroMedia ? (
          <HeroImage media={heroMedia} className={FULL_BLEED_ASPECT} />
        ) : null}
      </section>
    );
  }

  // ── Masthead: first word top-left over a tall image, rest of the title to
  //    its right, with a portrait pin + copy anchored bottom-right ────────────
  if (layout === "masthead") {
    const words = title.trim().split(/\s+/);
    const first = words[0] ?? title;
    const rest = words.slice(1).join(" ");
    // Hard-break the remainder before each "&" so a title like
    // "Development & Policy" always renders as "Development" / "& Policy"
    // (its own line), regardless of how wide the column is.
    const restLines = rest ? rest.split(/\s+(?=&)/) : [];
    const mastheadTitle =
      "font-display font-bold leading-[1.02] tracking-[-0.02em] text-white text-5xl md:text-6xl lg:text-7xl xl:text-[5.75rem]";

    return (
      <section {...sectionProps}>
        <GridHoverBackdrop />
        <div
          className={`${CONTAINER} flex flex-col justify-start pt-10 md:pt-14 lg:pt-10 pb-10 md:pb-12 lg:pb-14 lg:min-h-svh`}
        >
          <Stagger className="grid grid-cols-1 items-stretch gap-x-10 gap-y-6 lg:grid-cols-[0.3fr_0.7fr]">
            {/* Left — first word on top, tall image below (sized to the viewport). */}
            <div className="flex flex-col gap-4 md:gap-5">
              <StaggerItem as="h1" aria-label={title} className={mastheadTitle}>
                {first}
              </StaggerItem>
              {heroMedia ? (
                <HeroImage
                  media={heroMedia}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="relative aspect-3/4 w-full self-start overflow-hidden rounded-sm lg:aspect-auto lg:h-[68vh]"
                />
              ) : null}
            </div>
            {/* Right — rest of the title (dropped to the image top), then
                subtitle + buttons anchored to the bottom. */}
            <div className="flex flex-col lg:pt-24">
              {restLines.length > 0 ? (
                <StaggerItem
                  as="span"
                  aria-hidden
                  className={`block ${mastheadTitle}`}
                >
                  {restLines.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </StaggerItem>
              ) : null}
              {subtitle || hasCtas ? (
                <div className="mt-auto flex flex-col gap-6 pt-12 md:pt-16">
                  {subtitle ? (
                    <StaggerItem
                      as="p"
                      // Header body type per design spec: Avenir Next (via
                      // --font-sans) Medium 20px / 176% line-height / 0.48px
                      // tracking.
                      className="max-w-4xl align-middle font-sans text-[20px] font-medium leading-[1.76] tracking-[0.48px] text-white/100"
                    >
                      {subtitle}
                    </StaggerItem>
                  ) : null}
                  {hasCtas ? <StaggerItem>{ctas}</StaggerItem> : null}
                </div>
              ) : null}
            </div>
          </Stagger>
        </div>
      </section>
    );
  }

  // ── Spotlight: tall image left, title top-right, copy bottom-right ─────────
  if (layout === "spotlight") {
    return (
      <section {...sectionProps}>
        <GridHoverBackdrop />
        {/* Nav-aligned gutters (match StickyTopNav's px) instead of the shared
            CONTAINER, so the left image lines up with the logo and the
            right-hand copy lines up with the menu icon. */}
        <div
          className={`relative mx-auto flex max-w-page flex-col justify-start px-6 md:px-10 lg:px-14 pt-6 md:pt-10 lg:pt-10 pb-12 md:pb-14 lg:pb-16 lg:min-h-svh`}
        >
          <Stagger className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            {heroMedia ? (
              <HeroImage
                media={heroMedia}
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="relative order-2 aspect-4/5 w-full self-start overflow-hidden rounded-md lg:order-1 lg:aspect-auto lg:h-[82vh]"
              />
            ) : null}
            <div className="order-1 flex flex-col lg:order-2 lg:pl-10">
              <StaggerItem
                as="h1"
                className="max-w-xl font-display font-bold leading-[1.02] tracking-[-0.02em] text-white text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem]"
              >
                {title}
              </StaggerItem>
              {subtitle || hasCtas ? (
                <div className="mt-auto flex flex-col gap-6 pt-12 md:pt-16">
                  {subtitle ? (
                    <StaggerItem
                      as="p"
                      // Header body type per design spec: Avenir Next (via
                      // --font-sans) Medium 20px / 176% line-height / 0.48px
                      // tracking, pure white.
                      className="max-w-4xl align-middle font-sans text-[20px] font-medium leading-[1.76] tracking-[0.48px] text-white/100"
                    >
                      {subtitle}
                    </StaggerItem>
                  ) : null}
                  {hasCtas ? <StaggerItem>{ctas}</StaggerItem> : null}
                </div>
              ) : null}
            </div>
          </Stagger>
        </div>
      </section>
    );
  }

  // ── Split (default): title left, subtitle + buttons right ──────────────────
  return (
    <section {...sectionProps}>
      <GridHoverBackdrop />
      <div
        className={`${NAV_CONTAINER} pt-24 md:pt-28 lg:pt-28 pb-10 md:pb-14 lg:pb-16`}
      >
        <Stagger className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <StaggerItem
            as="h1"
            className={`max-w-2xl ${TITLE_BASE} ${titleColorClass}`}
            style={titleStyle}
          >
            {title}
          </StaggerItem>
          {subtitle || hasCtas ? (
            <StaggerItem className="flex max-w-xl flex-col gap-8 lg:items-start lg:justify-self-end lg:pt-2 lg:text-left">
              {subtitle ? (
                // Header body type per design spec: Albert Sans (via
                // --font-display) Light 300, 20px / 152% line-height, no
                // tracking, pure white. Left-aligned so each line's first
                // letter lines up; `text-balance` splits the near-equal
                // sentence into two balanced lines (breaking after "for").
                <p className="text-balance font-display text-[20px] font-light leading-[1.52] tracking-normal text-white">
                  {subtitle}
                </p>
              ) : null}
              {hasCtas ? ctas : null}
            </StaggerItem>
          ) : null}
        </Stagger>
      </div>
      {heroMedia ? (
        <HeroImage media={heroMedia} className={FULL_BLEED_ASPECT} />
      ) : null}
    </section>
  );
}
