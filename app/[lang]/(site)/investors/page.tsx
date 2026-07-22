import type { Metadata } from "next";

import BlogSection, { type BlogSectionPost } from "@/app/components/BlogSection";
import BuildingSection from "@/app/components/BuildingSection";
import CareersSection from "@/app/components/CareersSection";
import Zone from "@/app/components/sections/Zone";
import type { RenderedBlock } from "@/app/components/sections/registry";
import { localizedHref, toLocale } from "@/app/lib/locale";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMedia } from "@/sanity/lib/image";
import {
  HOME_PAGE_QUERY,
  INVESTORS_PAGE_QUERY,
  LATEST_POSTS_QUERY,
} from "@/sanity/lib/queries";
import type {
  BlogPost,
  HomePage,
  InvestorsPage,
  ResolvedMedia,
} from "@/sanity/lib/types";

import InvestorsBridge from "./InvestorsBridge";
import InvestorsClimate from "./InvestorsClimate";
import InvestorsGoDeeper from "./InvestorsGoDeeper";
import InvestorsHeader from "./InvestorsHeader";
import InvestorsHowItWorks from "./InvestorsHowItWorks";
import InvestorsIncentives from "./InvestorsIncentives";
import InvestorsMarketAccess from "./InvestorsMarketAccess";
import InvestorsOpportunity from "./InvestorsOpportunity";
import InvestorsSites from "./InvestorsSites";
import InvestorsTraction from "./InvestorsTraction";
import InvestorsVoices, { type VoiceQuote } from "./InvestorsVoices";
import InvestorsWhyBarbados from "./InvestorsWhyBarbados";
import InvestorsWhyNow from "./InvestorsWhyNow";

export const revalidate = 3600;

const DEFAULT_SEO_TITLE = "Investors & Partners — BPI";
const DEFAULT_SEO_DESCRIPTION =
  "Back the Caribbean's pharmaceutical gateway. Barbados Pharmaceutical Inc. is building the manufacturing capacity, supply chain, and regulatory infrastructure the region depends on — and we're inviting aligned investors and partners to build it with us.";

function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}

function mediaVideoSrc(m: ResolvedMedia | null): string | undefined {
  return m?.kind === "video" ? m.src : undefined;
}

async function getInvestorsPage(lang: string): Promise<InvestorsPage | null> {
  return loadQuery<InvestorsPage | null>(INVESTORS_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.investorsPage],
  });
}

// The Careers + closing-CTA copy is authored once on the Home document; this
// page falls back to it when no `pageSections` are set, same as /sectors.
async function getHomePage(lang: string): Promise<HomePage | null> {
  return loadQuery<HomePage | null>(HOME_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.homePage],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const data = await getInvestorsPage(toLocale(lang));
  return {
    title: data?.seoTitle ?? DEFAULT_SEO_TITLE,
    description: data?.seoDescription ?? DEFAULT_SEO_DESCRIPTION,
  };
}

export default async function InvestorsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = toLocale(raw);
  const [data, home, latestPosts] = await Promise.all([
    getInvestorsPage(lang),
    getHomePage(lang),
    loadQuery<BlogPost[] | null>(LATEST_POSTS_QUERY, {
      params: { lang, limit: 3 },
      tags: [TAG.post],
    }),
  ]);

  const careersMedia = resolveMedia(home?.careersImage, { width: 1200 });
  const buildingMedia = resolveMedia(home?.buildingImage, { width: 1600 });

  // Resolve each voice's portrait here so the Voices component stays a plain
  // presentational block (the pattern the rest of the page follows).
  const voiceQuotes: VoiceQuote[] = (data?.voicesQuotes ?? []).map((q) => ({
    quote: q.quote,
    name: q.name,
    title: q.title,
    bg: q.bg,
    portrait: resolveMedia(q.image, { width: 200 }),
  }));

  const blogPosts: BlogSectionPost[] = (latestPosts ?? []).map((p) => {
    const m = resolveMedia(p.coverImage, { width: 1200 });
    return {
      title: p.title,
      excerpt: p.excerpt,
      href: localizedHref(lang, p.externalLink ?? `/blog/${p.slug}`),
      publishedAt: p.publishedAt,
      imageSrc: mediaImageSrc(m),
      videoSrc: mediaVideoSrc(m),
      imageAlt: m?.alt,
      tags: (p.tags ?? []).map((t) => t.title).slice(0, 2),
      category: p.contentType
        ? p.contentType[0].toUpperCase() + p.contentType.slice(1)
        : undefined,
    };
  });

  return (
    <main className="relative bg-error-25 overflow-hidden">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <InvestorsHeader
        title={data?.heroTitle || "Investors"}
        tagline={
          data?.heroTagline ?? "Let's put Barbados on your supply-chain map"
        }
        cta={data?.heroCta ?? { label: "Partner With BPI", href: "/contact" }}
        media={resolveMedia(data?.heroImage, { width: 1800 })}
        lang={lang}
      />

      {/* ── The opportunity ────────────────────────────────────────── */}
      <InvestorsOpportunity
        eyebrow={data?.opportunityEyebrow}
        heading={data?.opportunityHeading}
        body={data?.opportunityBody}
        cardLead={data?.opportunityCardLead}
        stats={data?.opportunityStats}
        cardBg={data?.opportunityCardBg}
      />

      {/* ── Why Barbados, why now ──────────────────────────────────── */}
      <InvestorsWhyBarbados
        heading={data?.whyHeading}
        intro={data?.whyIntro}
        cards={data?.whyCards}
        closing={data?.whyClosing}
        media={resolveMedia(
          data?.whyImage ?? home?.buildingImage ?? home?.whyImage,
          { width: 2000 },
        )}
      />

      {/* ── How BPI works ──────────────────────────────────────────── */}
      <InvestorsHowItWorks
        heading={data?.howHeading}
        intro={data?.howIntro}
        roles={data?.howRoles}
        media={resolveMedia(data?.howImage, { width: 800 })}
        body={data?.howBody}
        bg={data?.howBg}
      />

      {/* ── Available manufacturing sites ──────────────────────────── */}
      <InvestorsSites
        heading={data?.sitesHeading}
        body={data?.sitesBody}
        sites={data?.sitesList}
        note={data?.sitesNote}
        media={resolveMedia(
          data?.sitesImage ?? home?.buildingImage ?? home?.whyImage,
          { width: 2000 },
        )}
      />

      {/* ── Investment incentives ──────────────────────────────────── */}
      <InvestorsIncentives
        media={resolveMedia(data?.incentivesImage, { width: 2000 })}
        heading={data?.incentivesHeading}
        lead={data?.incentivesLead}
        items={data?.incentivesItems}
      />

      {/* ── A bridge to European capital ───────────────────────────── */}
      <InvestorsBridge
        eyebrow={data?.bridgeEyebrow}
        title={data?.bridgeTitle}
        titleTail={data?.bridgeTitleTail}
        body={data?.bridgeBody}
        cta={data?.bridgeCta}
        bg={data?.bridgeBg}
        lang={lang}
      />

      {/* ── Market access ──────────────────────────────────────────── */}
      <InvestorsMarketAccess
        heading={data?.marketHeading}
        lead={data?.marketLead}
        stats={data?.marketStats}
        closing={data?.marketClosing}
        media={resolveMedia(
          data?.marketImage ?? home?.buildingImage ?? home?.whyImage,
          { width: 2000 },
        )}
      />

      {/* ── Traction ───────────────────────────────────────────────── */}
      <InvestorsTraction
        eyebrow={data?.tractionEyebrow}
        heading={data?.tractionHeading}
        items={data?.tractionItems}
      />

      {/* ── Why now ────────────────────────────────────────────────── */}
      <InvestorsWhyNow
        heading={data?.whyNowHeading}
        body={data?.whyNowBody}
        primaryCta={data?.whyNowPrimaryCta}
        secondaryCta={data?.whyNowSecondaryCta}
        media={resolveMedia(
          data?.whyNowImage ?? home?.buildingImage ?? home?.whyImage,
          { width: 2000 },
        )}
        bg={data?.whyNowBg}
        lang={lang}
      />

      {/* ── Barbados investment climate ────────────────────────────── */}
      <InvestorsClimate
        heading={data?.climateHeading}
        cards={data?.climateCards}
      />

      {/* ── Voices from the ground ─────────────────────────────────── */}
      <InvestorsVoices
        eyebrow={data?.voicesEyebrow}
        heading={data?.voicesHeading}
        headingTail={data?.voicesHeadingTail}
        quotes={voiceQuotes}
      />

      {/* ── Go deeper + timeline ───────────────────────────────────── */}
      <InvestorsGoDeeper
        heading={data?.deeperHeading}
        body={data?.deeperBody}
        media={resolveMedia(
          data?.deeperImage ?? home?.buildingImage ?? home?.whyImage,
          { width: 1400 },
        )}
        timelineHeading={data?.timelineHeading}
        steps={data?.timelineItems}
        primaryCta={data?.deeperPrimaryCta}
        secondaryCta={data?.deeperSecondaryCta}
        lang={lang}
      />

      {/* ── Latest from BPI — newest posts (hides itself when none). ─ */}
      <BlogSection
        heading={data?.blogHeading ?? home?.blogHeading ?? undefined}
        viewAllHref={localizedHref(lang, "/blog")}
        posts={blogPosts}
      />

      {/* ── Modular tail — editor-managed blocks, else the Home page's
             Careers + closing-CTA copy so the page never ends abruptly. ── */}
      {data?.pageSections && data.pageSections.length > 0 ? (
        <Zone
          blocks={data.pageSections as unknown as RenderedBlock[]}
          lang={lang}
        />
      ) : (
        <>
          <CareersSection
            tone="mint"
            eyebrow={home?.careersEyebrow ?? undefined}
            heading={home?.careersHeading ?? undefined}
            lead={home?.careersLead ?? undefined}
            body={home?.careersBody ?? undefined}
            imageSrc={
              mediaImageSrc(careersMedia) ?? mediaImageSrc(buildingMedia)
            }
            imageAlt={careersMedia?.alt ?? buildingMedia?.alt}
            primaryLabel={home?.careersPrimaryCta?.label ?? undefined}
            primaryHref={
              home?.careersPrimaryCta?.href
                ? localizedHref(lang, home.careersPrimaryCta.href)
                : undefined
            }
            secondaryLabel={home?.careersSecondaryCta?.label ?? undefined}
            secondaryHref={
              home?.careersSecondaryCta?.href
                ? localizedHref(lang, home.careersSecondaryCta.href)
                : undefined
            }
          />
          <BuildingSection
            imageSrc={mediaImageSrc(buildingMedia)}
            imageAlt={buildingMedia?.alt}
            headlineLine1={home?.buildingHeadlineLine1}
            headlineLine2={home?.buildingHeadlineLine2}
            primaryLabel={home?.buildingPrimaryCta?.label ?? undefined}
            primaryHref={home?.buildingPrimaryCta?.href ?? undefined}
            secondaryLabel={home?.buildingSecondaryCta?.label ?? undefined}
            secondaryHref={home?.buildingSecondaryCta?.href ?? undefined}
          />
        </>
      )}
    </main>
  );
}
