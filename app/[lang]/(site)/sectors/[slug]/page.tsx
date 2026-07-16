import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Stagger, StaggerItem } from "@/app/components/motion";
import MotionSection from "@/app/components/MotionSection";
import PageSections from "@/app/components/PageSections";
import QuoteSpotlightSection from "@/app/components/QuoteSpotlightSection";
import { client } from "@/sanity/lib/client";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMedia } from "@/sanity/lib/image";
import {
  ALL_SECTOR_SLUGS_QUERY,
  HOME_PAGE_QUERY,
  SECTOR_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";
import type { Cta, HomePage, SectorDetail, SocialLink } from "@/sanity/lib/types";
import SectorHeader from "./SectorHeader";
import SectorHighlightSection from "./SectorHighlightSection";
import SectorPracticeSection from "./SectorPracticeSection";

// Attribution socials fall back to these when the Home leader has none set.
const DEFAULT_SOCIALS: SocialLink[] = [
  { kind: "Website", href: "https://www.barbadospharmainc.org" },
  { kind: "LinkedIn", href: "#" },
  { kind: "X", href: "#" },
  { kind: "Instagram", href: "https://www.instagram.com/barbadospharmainc" },
];

export const revalidate = 3600;

const DEFAULT_PAGE_COLOR = "#01190d";
const DEFAULT_SECTION_BG = "#E9F7EE";

// Per-slug header button defaults, used when the sector document leaves them
// unset. Lets the market-access page render its "Partner With BPI" / "Explore
// Our Impact" pills out of the box while staying overridable from the CMS.
const HERO_CTA_FALLBACKS: Record<
  string,
  { primary: NonNullable<Cta>; secondary: NonNullable<Cta> }
> = {
  "market-access": {
    primary: { label: "Partner With BPI", href: "/contact" },
    secondary: { label: "Explore Our Impact", href: "/impact" },
  },
};

type RouteProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateStaticParams() {
  // Build-time context — can't use loadQuery (it reads draftMode). Tag it so a
  // newly published sector also refreshes the slug list.
  const data = await client.fetch<{ slug: string }[] | null>(
    ALL_SECTOR_SLUGS_QUERY,
    {},
    { next: { tags: [TAG.sector] } },
  );
  return (data ?? []).map((d) => ({ slug: d.slug }));
}

async function getSector(
  lang: string,
  slug: string,
): Promise<SectorDetail | null> {
  return loadQuery<SectorDetail | null>(SECTOR_BY_SLUG_QUERY, {
    params: { lang, slug },
    tags: [TAG.sector],
  });
}

// Fallback imagery + attribution come from the Home document.
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
  const data = await getSector(lang, slug);
  if (!data) return { title: "Sectors — BPI" };
  return {
    title: `${data.title} — BPI Sectors`,
    description: data.subtitle ?? undefined,
  };
}

export default async function SectorDetailPage({ params }: RouteProps) {
  const { lang, slug } = await params;
  const [sector, homeData] = await Promise.all([
    getSector(lang, slug),
    getHomePage(lang),
  ]);

  if (!sector) notFound();

  const pageColor = sector.pageColor ?? DEFAULT_PAGE_COLOR;
  const sectionBg = sector.sectionBgColor ?? DEFAULT_SECTION_BG;
  // Optional accent for the header title + primary button. Also recolours the
  // footer headings / Subscribe button so the whole page reads as one profile.
  const headingColor = sector.heroHeadingColor ?? null;
  const footerAccent = headingColor ?? "#8CF5B8";

  // Header CTAs — CMS values win, else the per-slug fallback (so market-access
  // ships with its two pills). A CTA renders only when it has a label.
  const ctaFallback = HERO_CTA_FALLBACKS[slug];
  const heroPrimaryCta = sector.heroPrimaryCta ?? ctaFallback?.primary ?? null;
  const heroSecondaryCta =
    sector.heroSecondaryCta ?? ctaFallback?.secondary ?? null;

  // Full-bleed hero image; prefer the sector's own hero, then its card image,
  // then the Home page's photography, so the header never renders bare.
  const heroMedia = resolveMedia(
    sector.heroImage ??
      sector.cardImage ??
      homeData?.buildingImage ??
      homeData?.whyImage ??
      homeData?.leaderQuoteImage,
    { width: 2200 },
  );

  // Small portrait for the "pin" in the spotlight header — the Home leader,
  // falling back to any leader photo. Ignored by every other layout.
  const headerPortrait = resolveMedia(
    homeData?.leaderPortraitImage ?? homeData?.leaderQuoteImage,
    { width: 160 },
  );

  // Each section renders only when its toggle is on AND it has content.
  // `showOverview` defaults on (null → shown); the rest default off.
  const overviewParagraphs = (sector.overviewBody ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const showOverview =
    sector.showOverview !== false &&
    !!(sector.overviewHeading || overviewParagraphs.length > 0);

  // "In practice" — heading + lead + supporting paragraphs, two CTAs, and a
  // full-width image. The image falls back to a Home/sector photo so the
  // section never renders bare before an editor uploads the real shot.
  const practiceParagraphs = (sector.practiceBody ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const showPractice =
    !!sector.showPractice &&
    !!(sector.practiceHeading || sector.practiceLead || practiceParagraphs.length > 0);
  // Bottom slot is either a full-width image or the "What This Creates" block.
  // An explicit image always wins; otherwise fall back to a photo only when
  // there's no closing statement taking that slot.
  const practiceMedia = resolveMedia(
    sector.practiceImage ??
      (sector.practiceCreatesStatement
        ? null
        : (sector.heroImage ??
          homeData?.buildingImage ??
          homeData?.whyImage ??
          homeData?.leaderQuoteImage)),
    { width: 2000 },
  );

  // "Highlight" — supporting paragraph(s) that land on one emphasized
  // statement, with a wide image beneath. The image falls back to a Home/sector
  // photo so the section never renders bare before an editor uploads the shot.
  const highlightParagraphs = (sector.highlightBody ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const showHighlight =
    !!sector.showHighlight &&
    !!(
      sector.highlightHeading ||
      sector.highlightStatement ||
      highlightParagraphs.length > 0
    );
  const highlightMedia = resolveMedia(
    sector.highlightImage ??
      sector.heroImage ??
      homeData?.buildingImage ??
      homeData?.whyImage ??
      homeData?.leaderQuoteImage,
    { width: 2000 },
  );

  const capabilities = (sector.capabilities ?? []).filter(
    (c) => c.title || c.body,
  );
  const showCapabilities = !!sector.showCapabilities && capabilities.length > 0;

  const stats = (sector.stats ?? []).filter((s) => s.value || s.description);
  const showStats = !!sector.showStats && stats.length > 0;

  // Quote spotlight — navy card with a lead, pull-quote, and attribution. The
  // portrait + socials fall back to the Home leader so it never renders bare.
  const showQuote =
    !!sector.showQuote &&
    !!(sector.quoteText || sector.quoteLead || sector.quoteHeading);
  const quotePortrait = resolveMedia(
    sector.quotePortrait ??
      homeData?.leaderPortraitImage ??
      homeData?.leaderQuoteImage,
    { width: 240 },
  );
  const quoteSocials =
    homeData?.leaderSocials && homeData.leaderSocials.length > 0
      ? homeData.leaderSocials
      : DEFAULT_SOCIALS;

  // "In motion" — a cycling list of live initiatives beside a convergence
  // graphic. Renders only when the toggle is on and at least one item has copy.
  const motionItems = (sector.motionItems ?? [])
    .filter((m) => m.title || m.body)
    .map((m) => ({ title: m.title ?? "", body: m.body ?? "" }));
  const showMotion = !!sector.showMotion && motionItems.length > 0;
  const motionDark = sector.motionTone === "dark";
  const motionMedia = resolveMedia(
    sector.motionImage ??
      (motionDark ? (homeData?.leaderQuoteImage ?? homeData?.whyImage) : null),
    { width: 1200 },
  );

  return (
    <main
      className="relative overflow-hidden"
      style={{ backgroundColor: pageColor }}
    >
      {/* Recolour the shared footer to this page: the sector's dark background,
          and the profile accent for the footer headings + Subscribe button. */}
      <style>{`:root{--footer-bg:${pageColor};--brand-accent:${footerAccent};--brand-accent-strong:${footerAccent};}`}</style>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <SectorHeader
        title={sector.title}
        subtitle={sector.subtitle}
        primaryCta={heroPrimaryCta}
        secondaryCta={heroSecondaryCta}
        heroMedia={heroMedia}
        pageColor={pageColor}
        headingColor={headingColor}
        layout={sector.headerLayout}
        portrait={headerPortrait}
        lang={lang}
      />

      {/* ── Overview ───────────────────────────────────────────────── */}
      {showOverview ? (
        <section
          data-nav-theme="light"
          className="bg-error-25 px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28"
        >
          <Stagger
            className="mx-auto grid max-w-page grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16"
          >
            {sector.overviewHeading ? (
              <StaggerItem as="h2" className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-tight tracking-[-0.02em]">
                {sector.overviewHeading}
              </StaggerItem>
            ) : (
              <StaggerItem as="span" />
            )}
            {overviewParagraphs.length > 0 ? (
              <StaggerItem className="flex flex-col gap-6 text-lg md:text-xl text-primary-500/80 leading-relaxed">
                {overviewParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </StaggerItem>
            ) : null}
          </Stagger>
        </section>
      ) : null}

      {/* ── In practice ────────────────────────────────────────────── */}
      {showPractice ? (
        <SectorPracticeSection
          heading={sector.practiceHeading}
          lead={sector.practiceLead}
          paragraphs={practiceParagraphs}
          listHeading={sector.practiceListHeading}
          list={sector.practiceList ?? undefined}
          createsLabel={sector.practiceCreatesLabel}
          createsStatement={sector.practiceCreatesStatement}
          primaryCta={sector.practicePrimaryCta}
          secondaryCta={sector.practiceSecondaryCta}
          media={practiceMedia}
          bg={sectionBg}
          ink={pageColor}
          lang={lang}
        />
      ) : null}

      {/* ── Highlight ──────────────────────────────────────────────── */}
      {showHighlight ? (
        <SectorHighlightSection
          heading={sector.highlightHeading}
          paragraphs={highlightParagraphs}
          statement={sector.highlightStatement}
          media={highlightMedia}
          bg={sectionBg}
          ink={pageColor}
        />
      ) : null}

      {/* ── Capabilities ───────────────────────────────────────────── */}
      {showCapabilities ? (
        <section
          data-nav-theme="light"
          className="bg-error-25 px-6 md:px-12 lg:px-20 xl:px-28 pb-16 md:pb-24 lg:pb-28"
        >
          <div className="mx-auto max-w-page">
            {sector.capabilitiesHeading ? (
              <Stagger
                as="h2"
                className="max-w-2xl font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
              >
                {sector.capabilitiesHeading}
              </Stagger>
            ) : null}
            <Stagger
              className="mt-10 md:mt-14 grid grid-cols-1 gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {capabilities.map((c, i) => (
                <StaggerItem
                  key={`${i}-${c.title ?? ""}`}
                  className="flex flex-col gap-3 rounded-2xl lg:rounded-3xl bg-white p-6 md:p-7 lg:p-8"
                >
                  {c.title ? (
                    <h3 className="font-display text-xl md:text-2xl font-bold text-primary-500 leading-snug tracking-[-0.01em]">
                      {c.title}
                    </h3>
                  ) : null}
                  {c.body ? (
                    <p className="text-sm md:text-base text-primary-500/70 leading-relaxed">
                      {c.body}
                    </p>
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
          className="bg-error-500 px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28"
        >
          <div className="mx-auto w-full max-w-page">
            {sector.statsHeading ? (
              <Stagger
                as="h2"
                className="max-w-xl font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
              >
                {sector.statsHeading}
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

      {/* ── Quote spotlight ────────────────────────────────────────── */}
      {showQuote ? (
        <QuoteSpotlightSection
          eyebrow={sector.quoteEyebrow ?? undefined}
          heading={sector.quoteHeading ?? undefined}
          lead={sector.quoteLead ?? undefined}
          quote={sector.quoteText ?? undefined}
          name={sector.quoteAttribution ?? undefined}
          role={sector.quoteRole ?? undefined}
          portrait={quotePortrait}
          socials={quoteSocials}
          bg={sectionBg}
          cardBg={pageColor}
        />
      ) : null}

      {/* ── In motion ──────────────────────────────────────────────── */}
      {showMotion ? (
        <MotionSection
          heading={sector.motionHeading ?? undefined}
          items={motionItems}
          bg={motionDark ? pageColor : sectionBg}
          ink={pageColor}
          tone={motionDark ? "dark" : "light"}
          ctaLabel={sector.motionCta?.label}
          ctaHref={sector.motionCta?.href}
          media={motionMedia}
        />
      ) : null}

      {/* ── Modular page sections (editor-managed) ─────────────────── */}
      <PageSections sections={sector.pageSections} contained />
    </main>
  );
}
