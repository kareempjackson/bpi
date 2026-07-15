import type { Metadata } from "next";
import { notFound } from "next/navigation";

import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import MediaImage from "@/app/components/MediaImage";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
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
import type { HomePage, SectorDetail, SocialLink } from "@/sanity/lib/types";

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

  // Each section renders only when its toggle is on AND it has content.
  // `showOverview` defaults on (null → shown); the rest default off.
  const overviewParagraphs = (sector.overviewBody ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const showOverview =
    sector.showOverview !== false &&
    !!(sector.overviewHeading || overviewParagraphs.length > 0);

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
          and a light-green accent for the footer headings + Subscribe button. */}
      <style>{`:root{--footer-bg:${pageColor};--brand-accent:#8CF5B8;--brand-accent-strong:#8CF5B8;}`}</style>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        data-nav-bg={pageColor}
        style={{ backgroundColor: pageColor }}
        className="relative overflow-hidden"
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
        <GridHoverBackdrop />

        <div className="relative mx-auto max-w-page px-6 md:px-12 lg:px-20 xl:px-28 pt-24 md:pt-28 lg:pt-28 pb-10 md:pb-14 lg:pb-16">
          <Stagger
            className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12"
          >
            <StaggerItem as="h1" className="max-w-2xl font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-[-0.02em] text-error-500">
              {sector.title}
            </StaggerItem>
            {sector.subtitle ? (
              <StaggerItem as="p" className="max-w-md text-base md:text-lg text-white/80 leading-relaxed lg:justify-self-end lg:pt-2">
                {sector.subtitle}
              </StaggerItem>
            ) : null}
          </Stagger>
        </div>

        {heroMedia ? (
          <Reveal
            preset="scale"
            className="relative w-full aspect-4/3 sm:aspect-video lg:aspect-2/1"
          >
            <MediaImage media={heroMedia} sizes="100vw" preload eager />
          </Reveal>
        ) : null}
      </section>

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

      {/* ── Modular page sections (editor-managed) ─────────────────── */}
      <PageSections sections={sector.pageSections} contained />
    </main>
  );
}
