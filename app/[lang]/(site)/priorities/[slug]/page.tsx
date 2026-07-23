import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";

import BuildingSection from "@/app/components/BuildingSection";
import CareersSection from "@/app/components/CareersSection";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import IncentivesSection from "@/app/components/IncentivesSection";
import MediaImage from "@/app/components/MediaImage";
import MotionSection from "@/app/components/MotionSection";
import PortableTextBody from "@/app/components/PortableTextBody";
import Zone from "@/app/components/sections/Zone";
import type { RenderedBlock } from "@/app/components/sections/registry";
import PracticeDetailSection from "@/app/components/PracticeDetailSection";
import PracticeTabsSection from "@/app/components/PracticeTabsSection";
import QuoteSpotlightSection from "@/app/components/QuoteSpotlightSection";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { client } from "@/sanity/lib/client";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMedia } from "@/sanity/lib/image";
import {
  ALL_PRIORITY_SLUGS_QUERY,
  HOME_PAGE_QUERY,
  PRIORITY_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";
import type {
  HomePage,
  PriorityDetail,
  ResolvedMedia,
  SocialLink,
} from "@/sanity/lib/types";

/** Poster/still for a resolved media object (image src, or a video's poster). */
function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}

/** Video src for a resolved media object (undefined for images). */
function mediaVideoSrc(m: ResolvedMedia | null): string | undefined {
  return m?.kind === "video" ? m.src : undefined;
}

// Attribution socials fall back to these when the Home leader has none set.
const DEFAULT_SOCIALS: SocialLink[] = [
  { kind: "Website", href: "https://www.barbadospharmainc.org" },
  { kind: "LinkedIn", href: "#" },
  { kind: "X", href: "#" },
  { kind: "Instagram", href: "https://www.instagram.com/barbadospharmainc" },
];

export const revalidate = 3600;

const DEFAULT_PAGE_COLOR = "#0B2F64";

type RouteProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateStaticParams() {
  // Build-time context — can't use loadQuery (it reads draftMode). Tag it so a
  // newly published priority also refreshes the slug list.
  const data = await client.fetch<{ slug: string }[] | null>(
    ALL_PRIORITY_SLUGS_QUERY,
    {},
    { next: { tags: [TAG.priority] } },
  );
  return (data ?? []).map((d) => ({ slug: d.slug }));
}

async function getPriority(
  lang: string,
  slug: string,
): Promise<PriorityDetail | null> {
  return loadQuery<PriorityDetail | null>(PRIORITY_BY_SLUG_QUERY, {
    params: { lang, slug },
    tags: [TAG.priority],
  });
}

// Fallback hero image comes from the Home document's narrative image.
async function getHomePage(lang: string): Promise<HomePage | null> {
  return loadQuery<HomePage | null>(HOME_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.homePage],
  });
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const data = await getPriority(lang, slug);
  if (!data) return { title: "Strategic Priorities — BPI" };
  return {
    title: `${data.title} — BPI Strategic Priorities`,
    description: data.subtitle ?? undefined,
  };
}

export default async function PriorityDetailPage({ params }: RouteProps) {
  const { lang, slug } = await params;
  const [priority, homeData] = await Promise.all([
    getPriority(lang, slug),
    getHomePage(lang),
  ]);

  if (!priority) notFound();

  const pageColor = priority.pageColor ?? DEFAULT_PAGE_COLOR;
  // Light canvas behind the In practice / In motion / Quote sections. Editable
  // per priority; falls back to the pale blue.
  const sectionBg = priority.sectionBgColor ?? "#E7F9FF";
  const heroLayout = priority.heroLayout ?? "imageCard";
  const isFeatureHero = heroLayout === "feature";
  const isCoverHero = heroLayout === "cover";
  const isFeatureSplitHero = heroLayout === "featureSplit";
  const isImageCardHero = heroLayout === "imageCard";
  // Both the feature and cover heroes use a full-bleed image flush to the
  // bottom of the navy band (no section gutter/padding).
  const isFullBleedHero = isFeatureHero || isCoverHero;
  const heroMedia =
    heroLayout === "textOnly"
      ? null
      : resolveMedia(
          priority.heroImage ??
            homeData?.whyImage ??
            homeData?.leaderQuoteImage,
          { width: 1400 },
        );
  // Full-bleed hero image; prefer the priority's own hero image, then the Home
  // page's boardroom/narrative photography.
  const featureMedia = isFullBleedHero
    ? resolveMedia(
        priority.heroImage ??
          homeData?.buildingImage ??
          homeData?.whyImage ??
          homeData?.leaderQuoteImage,
        { width: 2200 },
      )
    : null;

  // Each section renders only when its toggle is on AND it has content.
  // `showOverview` defaults on (null → shown); the rest default off.
  const showOverview =
    priority.showOverview !== false &&
    !!(priority.overviewHeading || priority.overviewBody);
  const points = (priority.points ?? []).filter(
    (p) => p.title || p.body,
  );
  const showPoints = !!priority.showPoints && points.length > 0;
  const stats = (priority.stats ?? []).filter((s) => s.value || s.description);
  const showStats = !!priority.showStats && stats.length > 0;
  // Quote spotlight — navy card with a lead, pull-quote, and attribution. The
  // portrait falls back to the Home leader; socials to the Home leader (then a
  // sensible default) so the attribution never renders bare.
  const showQuote =
    !!priority.showQuote &&
    !!(
      priority.quoteText ||
      priority.quoteLead ||
      priority.quoteHeading
    );
  const quotePortrait = resolveMedia(
    priority.quotePortrait ??
      homeData?.leaderPortraitImage ??
      homeData?.leaderQuoteImage,
    { width: 240 },
  );
  const quoteSocials =
    homeData?.leaderSocials && homeData.leaderSocials.length > 0
      ? homeData.leaderSocials
      : DEFAULT_SOCIALS;

  // "In practice" — a two-tone statement + CTAs + wide image. The image is
  // sourced from the Home page's editor-managed photography (like /impact),
  // so it never depends on a stale one-off upload.
  const practicePrimaryCta = priority.practicePrimaryCta;
  const practiceSecondaryCta = priority.practiceSecondaryCta;
  // The single rich-text statement supersedes the legacy lead/highlight/trail/
  // body fields. When it's set we render only it; otherwise we fall back to the
  // legacy composition so un-migrated priorities still show.
  const hasPracticeStatement = Array.isArray(priority.practiceStatement)
    ? priority.practiceStatement.length > 0
    : !!priority.practiceStatement;
  const showPractice =
    !!priority.showPractice &&
    !!(
      hasPracticeStatement ||
      priority.practiceStatementLead ||
      priority.practiceStatementHighlight ||
      priority.practiceBody
    );
  const practiceMedia = resolveMedia(
    priority.practiceImage ??
      homeData?.buildingImage ??
      homeData?.architectureFeature ??
      homeData?.whyImage,
    { width: 2000 },
  );

  // Closers reuse the Home document's Careers + call-to-action copy/photos so
  // the page ends the same way the home page does.
  const careersMedia = resolveMedia(homeData?.careersImage, { width: 1600 });
  const buildingMedia = resolveMedia(homeData?.buildingImage, { width: 1600 });

  // The Careers + CTA closers below are now the single source of those
  // sections, so drop any legacy careers/cta blocks from the modular zone to
  // avoid rendering them twice. Any other modular blocks still render.
  const modularBlocks = (priority.pageSections ?? []).filter(
    (b) => b._type !== "careersSection" && b._type !== "ctaSection",
  );

  // "Practice detail" — heading + square image on the left, body paragraphs
  // (split on blank lines) + a CTA on the right, over a faint grid.
  const showPracticeDetail =
    !!priority.showPracticeDetail &&
    !!(priority.practiceDetailHeading || priority.practiceDetailBody);
  const practiceDetailMedia = resolveMedia(
    priority.practiceDetailImage ??
      homeData?.whyImage ??
      homeData?.leaderQuoteImage,
    { width: 1200 },
  );

  // "Practice tabs" — heading + lead + statement, then an auto-cycling tabbed
  // panel (each tab has body paragraphs + an optional bullet list).
  const practiceTabsItems = (priority.practiceTabsItems ?? []).filter(
    (t) => t.label || t.body,
  );
  const showPracticeTabs =
    !!priority.showPracticeTabs &&
    (practiceTabsItems.length > 0 ||
      !!priority.practiceTabsStatement ||
      !!priority.practiceTabsLead);

  // "In motion" — a cycling list of live initiatives beside a convergence
  // graphic. Renders only when the toggle is on and at least one item has copy.
  const motionItems = (priority.motionItems ?? [])
    .filter((m) => m.title || m.body)
    .map((m) => ({
      title: m.title ?? "",
      body: m.body ?? "",
      media: resolveMedia(m.media, { width: 1200 }),
      href: m.href ?? undefined,
    }));
  const showMotion = !!priority.showMotion && motionItems.length > 0;
  const motionDark = priority.motionTone === "dark";
  // Right-column image: an explicit upload, or (dark tone) a Home photo. When
  // null the section falls back to the convergence graphic.
  const motionMedia = resolveMedia(
    priority.motionImage ??
      (motionDark
        ? (homeData?.leaderQuoteImage ?? homeData?.whyImage)
        : null),
    { width: 1200 },
  );

  // "Investment incentives" — a wide image/video, a heading over a grey lead,
  // then a three-across grid of incentive paragraphs. Reuses the Investors
  // page's block; can be switched on per priority.
  const incentivesItems = (priority.incentivesItems ?? []).filter(
    (n) => n.body,
  );
  const showIncentives =
    !!priority.showIncentives &&
    !!(
      priority.incentivesHeading ||
      priority.incentivesLead ||
      priority.incentivesImage ||
      incentivesItems.length > 0
    );
  const incentivesMedia = resolveMedia(priority.incentivesImage, {
    width: 2000,
  });

  return (
    <main className="relative overflow-hidden" style={{ backgroundColor: pageColor }}>
      {/* Recolour the shared footer to this page: navy background, and a blue
          accent for the footer headings + Subscribe button (which otherwise
          default to brand green). Falls back to green on every other page. */}
      <style>{`:root{--footer-bg:${pageColor};--brand-accent:#ABE8FE;--brand-accent-strong:#ABE8FE;}`}</style>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        data-nav-bg={pageColor}
        style={{ backgroundColor: pageColor }}
        className={
          isFullBleedHero
            ? "relative overflow-hidden"
            : // Nav-aligned gutters (match StickyTopNav's px) shared by both
              // header variants; only the min-height differs.
              `relative overflow-hidden pb-10 md:pb-12 lg:pb-14 px-6 md:px-10 lg:px-14 ${
                isImageCardHero
                  ? "lg:min-h-svh"
                  : "lg:min-h-[calc(100svh-5rem)]"
              }${isFeatureSplitHero ? " lg:flex lg:flex-col" : ""}`
        }
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
        <GridHoverBackdrop />

        {isFullBleedHero ? (
          <>
            {/* Full-bleed hero — the cover variant (title + subtitle beside it)
                or the feature statement (eyebrow + italic-accented statement),
                then a full-bleed image flush to the bottom of the navy band. */}
            {isCoverHero ? (
              <div className="relative mx-auto max-w-page px-6 md:px-10 lg:px-14 pt-24 md:pt-28 lg:pt-28 pb-10 md:pb-14 lg:pb-16">
                <Stagger className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
                  <StaggerItem
                    as="h1"
                    className="max-w-2xl font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-[-0.02em] text-[#ABE8FE]"
                  >
                    {priority.title}
                  </StaggerItem>
                  {priority.subtitle ? (
                    <StaggerItem
                      as="p"
                      className="max-w-md text-base md:text-lg text-white/80 leading-relaxed lg:justify-self-end lg:pt-2"
                    >
                      {priority.subtitle}
                    </StaggerItem>
                  ) : null}
                </Stagger>
              </div>
            ) : (
              <div className="relative mx-auto max-w-page px-6 md:px-10 lg:px-14 pt-24 md:pt-28 lg:pt-28 pb-10 md:pb-14 lg:pb-16">
                <Stagger className="mx-auto max-w-4xl">
                  <StaggerItem
                    as="p"
                    className="text-base md:text-lg font-semibold tracking-[0.01em] text-[#ABE8FE]/80"
                  >
                    {priority.title}
                  </StaggerItem>
                  <StaggerItem
                    as="h1"
                    className="mt-4 md:mt-5 font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-[-0.02em] text-[#ABE8FE]"
                  >
                    {priority.heroHeadlineLead}
                    {priority.heroHeadlineEmphasis ? (
                      <>
                        {" "}
                        <span className="italic font-medium">
                          {priority.heroHeadlineEmphasis}
                        </span>
                      </>
                    ) : null}
                    {priority.heroHeadlineTrail ? (
                      <> {priority.heroHeadlineTrail}</>
                    ) : null}
                  </StaggerItem>
                </Stagger>
              </div>
            )}

            {featureMedia ? (
              <Reveal
                preset="scale"
                className="relative w-full aspect-4/3 sm:aspect-video lg:aspect-2/1"
              >
                <MediaImage media={featureMedia} sizes="100vw" preload eager />
              </Reveal>
            ) : null}
          </>
        ) : isFeatureSplitHero ? (
          /* Feature split — italic-accented headline + subtitle bottom-left, a
             contained rounded image on the right. */
          <div className="relative mx-auto flex w-full max-w-page flex-1 flex-col">
            <div className="grid grid-cols-1 items-end gap-10 lg:flex-1 lg:grid-cols-2 lg:gap-16">
              <Stagger className="order-2 flex flex-col justify-end gap-6 lg:order-1 lg:pb-8">
                <StaggerItem
                  as="h1"
                  className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-[-0.02em] text-[#ABE8FE]"
                >
                  {priority.heroHeadlineLead}
                  {priority.heroHeadlineEmphasis ? (
                    <>
                      {" "}
                      <span className="italic">
                        {priority.heroHeadlineEmphasis}
                      </span>
                    </>
                  ) : null}
                  {priority.heroHeadlineTrail ? (
                    <> {priority.heroHeadlineTrail}</>
                  ) : null}
                </StaggerItem>
                {priority.subtitle ? (
                  <StaggerItem
                    as="p"
                    className="max-w-xl text-lg md:text-xl text-white/75 leading-relaxed"
                  >
                    {priority.subtitle}
                  </StaggerItem>
                ) : null}
              </Stagger>
              {heroMedia ? (
                <Reveal
                  preset="scale"
                  className="order-1 relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-primary-500/40 lg:order-2 lg:ml-auto lg:max-w-md lg:self-center"
                >
                  <MediaImage
                    media={heroMedia}
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    preload
                    eager
                  />
                </Reveal>
              ) : null}
            </div>
          </div>
        ) : (
        <div className="relative mx-auto max-w-page">
          {heroLayout === "textOnly" ? (
            /* Title only — no image, big headline on the page color. */
            <Stagger className="max-w-4xl lg:pt-8">
              <StaggerItem
                as="h1"
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-none tracking-[-0.03em]"
              >
                {priority.title}
              </StaggerItem>
              {priority.subtitle ? (
                <StaggerItem
                  as="p"
                  className="mt-8 max-w-2xl text-xl md:text-2xl text-white/70 leading-relaxed"
                >
                  {priority.subtitle}
                </StaggerItem>
              ) : null}
            </Stagger>
          ) : heroLayout === "split" ? (
            /* Split — title beside the image. */
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Stagger className="flex flex-col gap-6">
                <StaggerItem
                  as="h1"
                  className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.02] tracking-[-0.02em]"
                >
                  {priority.title}
                </StaggerItem>
                {priority.subtitle ? (
                  <StaggerItem
                    as="p"
                    className="max-w-md text-lg md:text-xl text-white/70 leading-relaxed"
                  >
                    {priority.subtitle}
                  </StaggerItem>
                ) : null}
              </Stagger>
              {heroMedia ? (
                <Reveal
                  preset="scale"
                  className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-primary-500/40"
                >
                  <MediaImage
                    media={heroMedia}
                    sizes="(min-width: 1024px) 48vw, 100vw"
                    preload
                    eager
                  />
                </Reveal>
              ) : null}
            </div>
          ) : (
            /* Image + title card (default). The light-blue card is an L-shape
               (a full top block + a narrow left stem) with a white card
               stepping into the notch. Composed on lg+; stacks on mobile. */
            <div className="relative">
              {/* Team / feature image, top-left. Wide 2:1 crop so it reads big
                  without eating the full viewport height. */}
              {heroMedia ? (
                <Reveal
                  preset="scale"
                  className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-primary-500/40 lg:aspect-2/1 lg:w-[52%]"
                >
                  <MediaImage
                    media={heroMedia}
                    sizes="(min-width: 1024px) 52vw, 100vw"
                    preload
                    eager
                  />
                </Reveal>
              ) : null}

              {/* Light-blue L-shape (drawn as an SVG so the rounded outer
                  corners + rounded concave inner elbow are exact) with the
                  title overlaid and a white card stepping into the notch. */}
              <Stagger className="relative mt-4 lg:mt-5 lg:aspect-794/325 lg:w-[60%]">
                {/* Mobile — a plain rounded card behind the copy. */}
                <StaggerItem
                  aria-hidden
                  className="absolute inset-0 rounded-xl bg-[#ABE8FE] lg:hidden"
                />
                {/* Desktop — the exact L silhouette, scaled a touch shorter than
                    its native aspect so the notch fits the white card snugly. */}
                <StaggerItem
                  as="svg"
                  aria-hidden
                  viewBox="0 0 794 522"
                  preserveAspectRatio="none"
                  className="absolute inset-0 hidden h-full w-full lg:block"
                >
                  <path
                    fill="#ABE8FE"
                    d="M396.902 0.000488281C396.902 0.000757952 396.903 0.000976562 396.903 0.000976562H786C790.418 0.000976562 794 3.5827 794 8.00098V380.143C794 384.561 790.418 388.143 786 388.143H404.902C400.484 388.143 396.902 391.724 396.902 396.143V513.094C396.902 517.512 393.321 521.094 388.902 521.094H8C3.58172 521.094 0 517.512 0 513.094V7.99999C0 3.58171 3.58172 0 8 0H396.902C396.902 0 396.902 0.000218611 396.902 0.000488281Z"
                  />
                </StaggerItem>
                {/* Title + subtitle — in flow on mobile (over the card), an
                    overlay on the SVG on lg. */}
                <StaggerItem className="relative px-8 pt-9 pb-10 md:px-10 md:pt-10 md:pb-12 lg:absolute lg:inset-0 lg:px-14 lg:pt-14">
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-500 leading-[1.03] tracking-[-0.02em] lg:max-w-[12em]">
                    {priority.title}
                  </h1>
                  {priority.subtitle ? (
                    <p className="mt-5 md:mt-6 max-w-lg text-base md:text-lg lg:text-xl text-primary-500/70 leading-relaxed">
                      {priority.subtitle}
                    </p>
                  ) : null}
                </StaggerItem>
                {/* White step card stepping into the notch — its bottom edge
                    aligned with the blue shape's bottom (desktop only). */}
                <StaggerItem className="absolute bottom-0 left-[51%] hidden h-[24%] w-[72%] rounded-md bg-[#E7F9FF] lg:block" />
              </Stagger>
            </div>
          )}
        </div>
        )}
      </section>

      {/* ── Overview ───────────────────────────────────────────────── */}
      {showOverview ? (
        <section
          data-nav-theme="light"
          className="bg-error-25 px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
        >
          <Stagger className="mx-auto grid max-w-page grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            {priority.overviewHeading ? (
              <StaggerItem
                as="h2"
                className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
              >
                {priority.overviewHeading}
              </StaggerItem>
            ) : (
              <StaggerItem as="span" />
            )}
            {priority.overviewBody ? (
              <StaggerItem
                as="div"
                className="text-lg md:text-xl text-primary-500/80 leading-relaxed"
              >
                <PortableTextBody
                  value={priority.overviewBody}
                  paragraphClassName="whitespace-pre-line text-lg md:text-xl text-primary-500/80 leading-relaxed"
                />
              </StaggerItem>
            ) : null}
          </Stagger>
        </section>
      ) : null}

      {/* ── Key points ─────────────────────────────────────────────── */}
      {showPoints ? (
        <section
          data-nav-theme="light"
          className="bg-error-25 px-6 md:px-10 lg:px-14 pb-16 md:pb-24 lg:pb-28"
        >
          <div className="mx-auto max-w-page">
            {priority.pointsHeading ? (
              <Stagger
                as="h2"
                className="max-w-2xl font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
              >
                {priority.pointsHeading}
              </Stagger>
            ) : null}
            <Stagger className="mt-10 md:mt-14 grid grid-cols-1 gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {points.map((pt, i) => (
                <StaggerItem
                  key={`${i}-${pt.title ?? ""}`}
                  className="flex flex-col gap-3 rounded-2xl lg:rounded-3xl bg-white p-6 md:p-7 lg:p-8"
                >
                  {pt.title ? (
                    <h3 className="font-display text-xl md:text-2xl font-bold text-primary-500 leading-snug tracking-[-0.01em]">
                      {pt.title}
                    </h3>
                  ) : null}
                  {pt.body ? (
                    <PortableTextBody
                      value={pt.body}
                      paragraphClassName="text-sm md:text-base text-primary-500/70 leading-relaxed"
                    />
                  ) : null}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* ── Stats ──────────────────────────────────────────────────── */}
      {showStats ? (
        <section
          data-nav-theme="light"
          className="bg-error-500 px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
        >
          <div className="mx-auto w-full max-w-page">
            {priority.statsHeading ? (
              <Stagger
                as="h2"
                className="max-w-xl font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
              >
                {priority.statsHeading}
              </Stagger>
            ) : null}
            <Stagger
              as="dl"
              className="mt-12 md:mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-10"
            >
              {stats.map((s, i) => (
                <StaggerItem
                  key={`${i}-${s.description ?? ""}`}
                  className={`flex flex-col gap-3 lg:px-8 lg:first:pl-0 ${
                    i > 0 ? "lg:border-l lg:border-primary-500/20" : ""
                  }`}
                >
                  <dt className="font-display text-4xl lg:text-5xl font-bold text-primary-500 leading-none tracking-[-0.02em]">
                    {s.value}
                  </dt>
                  <dd className="text-sm md:text-base text-primary-500/70">
                    {s.description}
                  </dd>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* ── In practice ────────────────────────────────────────────── */}
      {showPractice ? (
        <section
          data-nav-theme="light"
          style={{ backgroundColor: sectionBg, "--ink": pageColor } as CSSProperties}
          className="px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
        >
          <div className="mx-auto max-w-page">
            <Stagger className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Eyebrow — top-left column, aligned to the statement's first line */}
              {priority.practiceEyebrow ? (
                <StaggerItem
                  as="p"
                  className="font-display text-lg font-semibold tracking-normal leading-[19.2px] text-(--ink)/60 lg:col-span-3 lg:pt-3"
                >
                  {priority.practiceEyebrow}
                </StaggerItem>
              ) : (
                <StaggerItem as="span" className="hidden lg:col-span-3 lg:block" />
              )}

              {/* Statement + body + CTAs — right column. Both the statement and
                  the body are rich-text (WYSIWYG) fields; the statement falls
                  back to the legacy lead/highlight/trail fields when empty. */}
              <StaggerItem className="flex flex-col gap-10 md:gap-14 lg:col-span-9 lg:gap-20">
                {/* Statement */}
                {hasPracticeStatement ? (
                  <PortableTextBody
                    value={priority.practiceStatement}
                    paragraphClassName="whitespace-pre-line font-display text-xl md:text-2xl lg:text-[24px] font-light leading-[1.4] lg:leading-[38px] tracking-[-1.23px] text-(--ink)/45"
                  />
                ) : (
                  <h2 className="font-display text-xl md:text-2xl lg:text-[24px] font-light leading-[1.4] lg:leading-[38px] tracking-[-1.23px] text-(--ink)/45">
                    {priority.practiceStatementLead}
                    {priority.practiceStatementHighlight ? (
                      <>
                        {" "}
                        <span className="text-[#2563eb]">
                          {priority.practiceStatementHighlight}
                        </span>
                      </>
                    ) : null}
                    {priority.practiceStatementTrail ? (
                      <> {priority.practiceStatementTrail}</>
                    ) : null}
                  </h2>
                )}

                {/* Body */}
                {priority.practiceBody ? (
                  <PortableTextBody
                    value={priority.practiceBody}
                    paragraphClassName="whitespace-pre-line font-display text-[24px] font-normal tracking-normal leading-[1.41] text-black"
                  />
                ) : null}

                {practicePrimaryCta || practiceSecondaryCta ? (
                  <div className="flex flex-wrap gap-3">
                    {practicePrimaryCta ? (
                      <CtaLink
                        href={practicePrimaryCta.href}
                        className="rounded-round bg-(--ink) px-6 py-3 text-sm font-semibold text-white text-center transition hover:opacity-90"
                      >
                        {practicePrimaryCta.label}
                      </CtaLink>
                    ) : null}
                    {practiceSecondaryCta ? (
                      <CtaLink
                        href={practiceSecondaryCta.href}
                        className="rounded-round border border-(--ink) px-6 py-3 text-sm font-semibold text-(--ink) text-center transition hover:bg-(--ink)/5"
                      >
                        {practiceSecondaryCta.label}
                      </CtaLink>
                    ) : null}
                  </div>
                ) : null}
              </StaggerItem>
            </Stagger>

            {/* Feature image — aligned to the right content column (col-span-9),
                so it starts where the statement/body do, not the full grid. */}
            {practiceMedia ? (
              <div className="mt-12 md:mt-16 lg:mt-20 grid grid-cols-1 lg:grid-cols-12 lg:gap-12">
                <div className="hidden lg:col-span-3 lg:block" />
                <Reveal
                  preset="scale"
                  className="relative aspect-16/10 w-full overflow-hidden rounded-lg bg-primary-500/5 sm:aspect-2/1 lg:col-span-9 lg:rounded-xl"
                >
                  <MediaImage
                    media={practiceMedia}
                    sizes="(min-width: 1024px) 68vw, 100vw"
                  />
                </Reveal>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── Practice detail ────────────────────────────────────────── */}
      {showPracticeDetail ? (
        <PracticeDetailSection
          heading={priority.practiceDetailHeading ?? undefined}
          headingStyle={priority.practiceDetailHeadingStyle ?? undefined}
          body={priority.practiceDetailBody}
          wideBody={priority.practiceDetailWideBody ?? undefined}
          media={practiceDetailMedia}
          ctaLabel={priority.practiceDetailCta?.label}
          ctaHref={priority.practiceDetailCta?.href}
          bg={sectionBg}
          ink={pageColor}
        />
      ) : null}

      {/* ── Practice tabs ──────────────────────────────────────────── */}
      {showPracticeTabs ? (
        <PracticeTabsSection
          heading={priority.practiceTabsHeading ?? undefined}
          headingStyle={priority.practiceTabsHeadingStyle ?? undefined}
          lead={priority.practiceTabsLead ?? undefined}
          statement={priority.practiceTabsStatement ?? undefined}
          trail={priority.practiceTabsTrail ?? undefined}
          tabs={practiceTabsItems}
          bg={sectionBg}
          ink={pageColor}
        />
      ) : null}

      {/* ── In motion ──────────────────────────────────────────────── */}
      {showMotion ? (
        <div
          style={{ backgroundColor: motionDark ? pageColor : sectionBg }}
          className="pt-16 md:pt-24 lg:pt-28"
        >
        <MotionSection
          heading={priority.motionHeading ?? undefined}
          headingClassName="font-display text-[36px] font-semibold leading-[46px] tracking-[-1.12px] text-(--fg)"
          itemTitleClassName="font-display text-[18px] font-bold leading-[1.5] tracking-normal"
          itemBodyClassName="font-display text-[16px] font-normal leading-[1.5] tracking-normal"
          items={motionItems}
          bg={motionDark ? pageColor : sectionBg}
          ink={pageColor}
          tone={motionDark ? "dark" : "light"}
          ctaLabel={priority.motionCta?.label}
          ctaHref={priority.motionCta?.href}
          media={motionMedia}
        />
        </div>
      ) : null}

      {/* ── Investment incentives ──────────────────────────────────── */}
      {showIncentives ? (
        <IncentivesSection
          media={incentivesMedia}
          heading={priority.incentivesHeading}
          lead={priority.incentivesLead}
          items={incentivesItems}
          bg={sectionBg}
          ink={pageColor}
        />
      ) : null}

      {/* ── Quote spotlight ────────────────────────────────────────── */}
      {showQuote ? (
        <QuoteSpotlightSection
          eyebrow={priority.quoteEyebrow ?? undefined}
          heading={priority.quoteHeading ?? undefined}
          lead={priority.quoteLead ?? undefined}
          quote={priority.quoteText ?? undefined}
          name={priority.quoteAttribution ?? undefined}
          role={priority.quoteRole ?? undefined}
          portrait={quotePortrait}
          socials={quoteSocials}
          bg={sectionBg}
          cardBg={pageColor}
        />
      ) : null}

      {/* ── Careers closer — reuses the Home document's copy/photos. ── */}
      <CareersSection
        tone="blue"
        eyebrow={homeData?.careersEyebrow ?? undefined}
        heading={homeData?.careersHeading ?? undefined}
        lead={homeData?.careersLead ?? undefined}
        body={homeData?.careersBody ?? undefined}
        imageSrc={mediaImageSrc(careersMedia)}
        videoSrc={mediaVideoSrc(careersMedia)}
        imageAlt={careersMedia?.alt}
        primaryLabel={homeData?.careersPrimaryCta?.label}
        primaryHref={homeData?.careersPrimaryCta?.href}
        secondaryLabel={homeData?.careersSecondaryCta?.label}
        secondaryHref={homeData?.careersSecondaryCta?.href}
      />

      {/* ── Modular page sections (editor-managed) ─────────────────── */}
      {modularBlocks.length > 0 ? (
        <Zone
          blocks={modularBlocks as unknown as RenderedBlock[]}
          lang={lang}
          contained
        />
      ) : null}

      {/* ── Call-to-action closer — reuses the Home document's copy. ── */}
      <BuildingSection
        tone="blue"
        headlineLine1={homeData?.buildingHeadlineLine1}
        headlineLine2={homeData?.buildingHeadlineLine2}
        imageSrc={mediaImageSrc(buildingMedia)}
        videoSrc={mediaVideoSrc(buildingMedia)}
        imageAlt={buildingMedia?.alt}
        primaryLabel={homeData?.buildingPrimaryCta?.label}
        primaryHref={homeData?.buildingPrimaryCta?.href}
        secondaryLabel={homeData?.buildingSecondaryCta?.label}
        secondaryHref={homeData?.buildingSecondaryCta?.href}
      />
    </main>
  );
}
