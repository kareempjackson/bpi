import type { Metadata } from "next";

// ISR — re-render at most every 60s; Sanity Live propagates publishes
// faster than that in preview mode anyway.
export const revalidate = 60;

import ArchitectureOfCareSection from "../components/ArchitectureOfCareSection";
import BlogSection, { type BlogSectionPost } from "../components/BlogSection";
import BuildingSection from "../components/BuildingSection";
import SectorsSection from "../components/SectorsSection";
import HeroSection from "../components/HeroSection";
import InitiativesSection from "../components/InitiativesSection";
import LeaderSection from "../components/LeaderSection";
import WhyBpiSection from "../components/WhyBpiSection";
import { resolveImage, resolveMedia } from "../../sanity/lib/image";
import { sanityFetch } from "../../sanity/lib/live";
import { resolveMenuConfig } from "../../sanity/lib/menu";
import {
  HOME_PAGE_QUERY,
  FEATURED_INITIATIVES_QUERY,
  LATEST_POSTS_QUERY,
  SITE_SETTINGS_QUERY,
} from "../../sanity/lib/queries";
import type {
  HomePage,
  Initiative,
  PostSummary,
  ResolvedMedia,
  SiteSettings,
} from "../../sanity/lib/types";

function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}
function mediaVideoSrc(m: ResolvedMedia | null): string | undefined {
  return m?.kind === "video" ? m.src : undefined;
}

// Fixed SVG geometry for the 6 sector nodes. Editors choose which slot a
// node fills via the `nodeId` selector; the position is baked here so the
// molecule layout cannot drift.
const SECTOR_NODE_GEOMETRY: Record<
  HomePage["sectorsNodes"][number]["nodeId"],
  { cx: number; cy: number; r: number; labelLeftPct: number; labelTopPct: number }
> = {
  // 01 — Market Access: far-left big terminus (chain start)
  "market-access": {
    cx: 141.509,
    cy: 141.54,
    r: 140.685,
    labelLeftPct: -4,
    labelTopPct: 42,
  },
  // 02 — Workforce: bottom-left medium, connected down-right from 01
  workforce: {
    cx: 362.982,
    cy: 610.674,
    r: 89.823,
    labelLeftPct: 40,
    labelTopPct: 80,
  },
  // 03 — Research & Development: center small
  "research-development": {
    cx: 618.931,
    cy: 419.507,
    r: 84.336,
    labelLeftPct: 28,
    labelTopPct: 45,
  },
  // 04 — Innovation & Technology: bottom-right medium
  "innovation-technology": {
    cx: 886.678,
    cy: 608.904,
    r: 88.642,
    labelLeftPct: 85,
    labelTopPct: 84,
  },
  // 05 — Regulatory Development & Policy: far-right big terminus
  "regulatory-policy": {
    cx: 1043.13,
    cy: 219.292,
    r: 145.927,
    labelLeftPct: 86,
    labelTopPct: 55,
  },
  // 06 — Investment & Financing: top-center small (chain end)
  "investment-financing": {
    cx: 618.8,
    cy: 149.734,
    r: 84.336,
    labelLeftPct: 60,
    labelTopPct: 5,
  },
};

async function getHomePage(): Promise<HomePage | null> {
  const { data } = await sanityFetch({ query: HOME_PAGE_QUERY });
  return data as HomePage | null;
}

async function getLatestPosts(limit: number): Promise<PostSummary[]> {
  if (limit <= 0) return [];
  const { data } = await sanityFetch({
    query: LATEST_POSTS_QUERY,
    params: { limit },
  });
  return (data as PostSummary[] | null) ?? [];
}

async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data } = await sanityFetch({ query: SITE_SETTINGS_QUERY });
  return data as SiteSettings | null;
}

async function getFeaturedInitiatives(): Promise<Initiative[]> {
  const { data } = await sanityFetch({ query: FEATURED_INITIATIVES_QUERY });
  return (data as Initiative[] | null) ?? [];
}

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await sanityFetch({
    query: HOME_PAGE_QUERY,
    stega: false,
  });
  const doc = data as HomePage | null;
  return {
    title: doc?.seoTitle ?? "Barbados Pharmaceutical Inc",
    description: doc?.seoDescription ?? "Barbados Pharmaceutical Inc",
  };
}

export default async function Home() {
  const data = await getHomePage();

  if (!data) {
    return <EmptyState />;
  }

  const showCount = data.blogShowCount ?? 3;
  const [posts, settings, initiatives] = await Promise.all([
    getLatestPosts(showCount),
    getSiteSettings(),
    getFeaturedInitiatives(),
  ]);

  const blogPosts: BlogSectionPost[] = posts.map((p) => {
    const m = resolveMedia(p.coverImage, { width: 800 });
    return {
      title: p.title,
      excerpt: p.excerpt,
      href: p.externalLink || `/blog/${p.slug}`,
      publishedAt: p.publishedAt,
      imageSrc: mediaImageSrc(m),
      videoSrc: mediaVideoSrc(m),
      imageAlt: m?.alt,
    };
  });

  const leaderQuoteMedia = resolveMedia(data.leaderQuoteImage, { width: 1400 });
  const leaderPortraitMedia = resolveMedia(data.leaderPortraitImage, {
    width: 900,
  });
  const whyMedia = resolveMedia(data.whyImage, { width: 1000 });
  const initiativesDefaultMedia = resolveMedia(data.initiativesDefaultImage, {
    width: 1000,
  });
  const buildingMedia = resolveMedia(data.buildingImage, { width: 1600 });

  const architectureItems = (data.architectureItems ?? []).flatMap((item) => {
    const m = resolveMedia(item.image, { width: 700 });
    if (!m) return [];
    return [
      {
        title: item.title,
        description: item.description,
        href: item.href,
        imageSrc: mediaImageSrc(m) ?? "",
        videoSrc: mediaVideoSrc(m),
        imageAlt: m.alt,
        color: item.color ?? "#CAF1FF",
      },
    ];
  });

  const sectorsNodes = (data.sectorsNodes ?? []).flatMap((node) => {
    const geo = SECTOR_NODE_GEOMETRY[node.nodeId];
    if (!geo) return [];
    const media = node.media;
    const isVideo = media?.kind === "video";
    // For both kinds we need a still as a fallback / poster. Video nodes
    // use the poster image if uploaded, otherwise just the alt text and
    // no still (browser will hold the first video frame).
    const poster = isVideo ? media?.videoPoster ?? null : media?.image ?? null;
    const stillImg = resolveImage(poster, { width: 600 });
    const videoSrc = isVideo ? media?.videoUrl ?? undefined : undefined;
    if (!isVideo && !stillImg) return [];
    if (isVideo && !videoSrc) return [];
    return [
      {
        id: node.nodeId,
        num: node.num,
        title: node.title,
        description: node.description,
        cx: geo.cx,
        cy: geo.cy,
        r: geo.r,
        imageSrc: stillImg?.src ?? "",
        imageAlt: stillImg?.alt ?? node.title,
        videoSrc,
        labelLeftPct: geo.labelLeftPct,
        labelTopPct: geo.labelTopPct,
        href: node.href ?? undefined,
      },
    ];
  });

  const initiativesItems = initiatives.map((it) => {
    // Render initiatives even if no cover image has been uploaded yet —
    // the section falls back to the panel-level default image so the
    // card list never goes dark on a freshly-featured initiative.
    const m = resolveMedia(it.coverImage, { width: 800 });
    // Link resolution: externalLink wins. Otherwise, if the editor
    // toggled off "Has detail page", the row is display-only (no href).
    // Treat absent `hasDetailPage` as true so legacy data still links.
    const href = it.externalLink
      ? it.externalLink
      : it.hasDetailPage === false
        ? undefined
        : `/initiatives/${it.slug}`;
    return {
      title: it.title,
      description: it.excerpt,
      href,
      featured: it.featured ?? false,
      imageSrc: mediaImageSrc(m),
      videoSrc: mediaVideoSrc(m),
      imageAlt: m?.alt,
    };
  });

  return (
    <main className="bg-error-25">
      {(() => {
        const bg = data.heroBackground;
        const heroImage =
          bg?.kind === "image"
            ? resolveImage(bg.image, { width: 2200 })
            : null;
        const heroVideoSrc =
          bg?.kind === "video" ? bg.videoUrl ?? undefined : undefined;
        return (
          <HeroSection
            headline={data.heroHeadline}
            body={data.heroBody}
            backgroundKind={bg?.kind === "image" ? "image" : "video"}
            videoSrc={heroVideoSrc}
            imageSrc={heroImage?.src}
            imageAlt={heroImage?.alt}
            ctaHref={data.heroCtaHref ?? undefined}
            navLinks={(settings?.navLinks ?? []).map((l) => ({
              label: l.label.toUpperCase(),
              href: l.href,
              disabled: l.disabled ?? false,
            }))}
            menuConfig={resolveMenuConfig(settings)}
          />
        );
      })()}
      <LeaderSection
        quote={data.leaderQuote}
        body={data.leaderBody}
        name={data.leaderName}
        title={data.leaderTitle}
        org={data.leaderOrg}
        quoteImageSrc={mediaImageSrc(leaderQuoteMedia)}
        quoteVideoSrc={mediaVideoSrc(leaderQuoteMedia)}
        quoteImageAlt={leaderQuoteMedia?.alt}
        portraitImageSrc={mediaImageSrc(leaderPortraitMedia)}
        portraitVideoSrc={mediaVideoSrc(leaderPortraitMedia)}
        portraitImageAlt={leaderPortraitMedia?.alt}
        socials={(data.leaderSocials ?? []).map((s) => ({
          kind: s.kind,
          href: s.href,
          label: s.label ?? undefined,
        }))}
      />
      <ArchitectureOfCareSection
        heading={data.architectureHeading}
        description={data.architectureDescription}
        items={architectureItems}
      />
      <SectorsSection
        heading={data.sectorsHeading}
        body={data.sectorsBody}
        nodes={sectorsNodes}
      />
      <WhyBpiSection
        quote={data.whyQuote}
        attribution={data.whyAttribution}
        body={data.whyBody}
        ctaLabel={data.whyCta?.label}
        ctaHref={data.whyCta?.href}
        imageSrc={mediaImageSrc(whyMedia)}
        videoSrc={mediaVideoSrc(whyMedia)}
        imageAlt={whyMedia?.alt}
      />
      <InitiativesSection
        eyebrow={data.initiativesEyebrow}
        heading={data.initiativesHeading}
        viewAllHref={data.initiativesViewAllHref ?? undefined}
        imageSrc={mediaImageSrc(initiativesDefaultMedia)}
        videoSrc={mediaVideoSrc(initiativesDefaultMedia)}
        imageAlt={initiativesDefaultMedia?.alt}
        initiatives={initiativesItems}
      />
      <BlogSection heading={data.blogHeading} posts={blogPosts} />
      <BuildingSection
        imageSrc={mediaImageSrc(buildingMedia)}
        videoSrc={mediaVideoSrc(buildingMedia)}
        imageAlt={buildingMedia?.alt}
        headlineLine1={data.buildingHeadlineLine1}
        headlineLine2={data.buildingHeadlineLine2}
        primaryLabel={data.buildingPrimaryCta?.label}
        primaryHref={data.buildingPrimaryCta?.href}
        secondaryLabel={data.buildingSecondaryCta?.label}
        secondaryHref={data.buildingSecondaryCta?.href}
      />
    </main>
  );
}

function EmptyState() {
  return (
    <main className="bg-error-25 min-h-[60vh] flex items-center justify-center px-5 md:px-20 lg:px-32 py-20">
      <div className="mx-auto max-w-page text-center">
        <h1 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
          Home page not yet configured
        </h1>
        <p className="mt-4 text-base text-primary-500/75 max-w-xl mx-auto leading-relaxed">
          Open Sanity Studio at <code>/studio</code> and create the
          &ldquo;Home page&rdquo; document to populate this page.
        </p>
      </div>
    </main>
  );
}
