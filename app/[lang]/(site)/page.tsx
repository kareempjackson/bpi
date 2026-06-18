import type { Metadata } from "next";

// Time-based backstop only. Reads are tag-cached and busted instantly on
// publish via the `/api/revalidate` webhook, so this hour-long window just
// guards against a missed webhook rather than driving normal freshness.
export const revalidate = 3600;

import ArchitectureOfCareSection from "@/app/components/ArchitectureOfCareSection";
import BlogSection, { type BlogSectionPost } from "@/app/components/BlogSection";
import SectorsSection from "@/app/components/SectorsSection";
import HeroSection, {
  type HeroSlide,
  type HeroFeature,
} from "@/app/components/HeroSection";
import InitiativesSection from "@/app/components/InitiativesSection";
import LeaderSection from "@/app/components/LeaderSection";
import PageSections from "@/app/components/PageSections";
import StackCard from "@/app/components/StackCard";
import WhyBpiSection from "@/app/components/WhyBpiSection";
import { resolveImage, resolveMedia } from "@/sanity/lib/image";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMenuConfig } from "@/sanity/lib/menu";
import {
  HOME_PAGE_QUERY,
  FEATURED_INITIATIVES_QUERY,
  LATEST_POSTS_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import type {
  BlogPost,
  HomePage,
  Initiative,
  ResolvedMedia,
  SiteSettings,
} from "@/sanity/lib/types";

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
    labelLeftPct: -16,
    labelTopPct: 30,
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
    labelLeftPct: 26,
    labelTopPct: 46,
  },
  // 04 — Innovation & Technology: bottom-right medium
  "innovation-technology": {
    cx: 886.678,
    cy: 608.904,
    r: 88.642,
    labelLeftPct: 86,
    labelTopPct: 81,
  },
  // 05 — Regulatory Development & Policy: far-right big terminus
  "regulatory-policy": {
    cx: 1043.13,
    cy: 219.292,
    r: 145.927,
    labelLeftPct: 102,
    labelTopPct: 33,
  },
  // 06 — Investment & Financing: top-center small (chain end)
  "investment-financing": {
    cx: 618.8,
    cy: 149.734,
    r: 84.336,
    labelLeftPct: 59,
    labelTopPct: 3,
  },
};

async function getHomePage(lang: string): Promise<HomePage | null> {
  return loadQuery<HomePage | null>(HOME_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.homePage],
  });
}

async function getLatestPosts(
  lang: string,
  limit: number,
): Promise<BlogPost[]> {
  if (limit <= 0) return [];
  const data = await loadQuery<BlogPost[] | null>(LATEST_POSTS_QUERY, {
    params: { lang, limit },
    tags: [TAG.post],
  });
  return data ?? [];
}

async function getSiteSettings(lang: string): Promise<SiteSettings | null> {
  return loadQuery<SiteSettings | null>(SITE_SETTINGS_QUERY, {
    params: { lang },
    tags: [TAG.siteSettings],
  });
}

async function getFeaturedInitiatives(lang: string): Promise<Initiative[]> {
  const data = await loadQuery<Initiative[] | null>(FEATURED_INITIATIVES_QUERY, {
    params: { lang },
    tags: [TAG.initiative],
  });
  return data ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const doc = await loadQuery<HomePage | null>(HOME_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.homePage],
    stega: false,
  });
  return {
    title: doc?.seoTitle ?? "Barbados Pharmaceutical Inc",
    description: doc?.seoDescription ?? "Barbados Pharmaceutical Inc",
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const data = await getHomePage(lang);

  if (!data) {
    return <EmptyState />;
  }

  const showCount = data.blogShowCount ?? 3;
  const [posts, settings, initiatives] = await Promise.all([
    getLatestPosts(lang, showCount),
    getSiteSettings(lang),
    getFeaturedInitiatives(lang),
  ]);

  const blogPosts: BlogSectionPost[] = posts.map((p) => {
    const m = resolveMedia(p.coverImage, { width: 1200 });
    return {
      title: p.title,
      excerpt: p.excerpt,
      // News (and any post with an external link) opens its source; everything
      // else opens its on-site /blog/[slug] page.
      href: p.externalLink ?? `/blog/${p.slug}`,
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

  // Cap the home-page list at the editor-controlled count (default 4).
  // FEATURED_INITIATIVES_QUERY is already ordered featured-first, so the
  // first N are the ones to show.
  const initiativesItems = initiatives
    .slice(0, data.initiativesShowCount ?? 4)
    .map((it) => {
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

        // Featured slides → slider. Each slide resolves its own background
        // and thumbnail; the first slide falls back to the top-level hero
        // copy/background when its own fields are left blank.
        const heroSlides: HeroSlide[] = (data.heroSlides ?? []).map(
          (slide, i) => {
            const sbg = slide.background;
            const slideKind = sbg?.kind === "image" ? "image" : "video";
            const slideImage =
              sbg?.kind === "image"
                ? resolveImage(sbg.image, { width: 2200 })
                : null;
            const thumb = resolveImage(slide.thumbnail, { width: 400 });
            return {
              headline:
                slide.headline || (i === 0 ? data.heroHeadline : slide.headline),
              body: slide.body ?? (i === 0 ? data.heroBody : undefined),
              ctaHref: slide.ctaHref ?? undefined,
              backgroundKind: slideKind,
              videoSrc:
                slideKind === "video"
                  ? sbg?.videoUrl ?? (i === 0 ? heroVideoSrc : undefined)
                  : undefined,
              imageSrc:
                slideKind === "image"
                  ? slideImage?.src ?? (i === 0 ? heroImage?.src : undefined)
                  : undefined,
              imageAlt: slideImage?.alt,
              thumbnailSrc: thumb?.src,
              thumbnailAlt: thumb?.alt,
            };
          },
        );

        // Fixed bottom-right feature card (independent of the slider).
        const featurePoster = resolveImage(data.heroFeature?.poster, {
          width: 400,
        });
        const cmsFeature: HeroFeature | undefined = data.heroFeature?.label
          ? {
              label: data.heroFeature.label,
              eyebrow: data.heroFeature.eyebrow ?? undefined,
              href: data.heroFeature.href ?? undefined,
              videoSrc: data.heroFeature.videoUrl ?? undefined,
              posterSrc: featurePoster?.src,
              posterAlt: featurePoster?.alt,
            }
          : undefined;

        // DEMO content — shown only until real slides / feature are added
        // in Sanity. Reuses media already resolved on the page so the
        // slider and the fixed bottom-right feature card are visible
        // locally. Remove this block (and the `?? demo*` fallbacks below)
        // once real content exists in the CMS.
        const heroThumb =
          heroImage?.src ??
          mediaImageSrc(buildingMedia) ??
          mediaImageSrc(leaderPortraitMedia);
        const demoSlides: HeroSlide[] = [
          {
            headline: data.heroHeadline,
            body: "A manufacturer. A regulator. A regional supply chain. A model for small states.",
            ctaHref: "/about",
            backgroundKind: bg?.kind === "image" ? "image" : "video",
            videoSrc: heroVideoSrc,
            imageSrc: heroImage?.src,
            imageAlt: heroImage?.alt,
            thumbnailSrc: mediaImageSrc(leaderPortraitMedia) ?? heroThumb,
            thumbnailAlt: leaderPortraitMedia?.alt,
          },
          {
            headline: "Programmes advancing the region's health security.",
            body: "From local manufacturing to workforce training — the building blocks of resilience.",
            ctaHref: "/initiatives",
            backgroundKind: "image",
            imageSrc: mediaImageSrc(initiativesDefaultMedia) ?? heroImage?.src,
            videoSrc: mediaImageSrc(initiativesDefaultMedia)
              ? undefined
              : heroVideoSrc,
            imageAlt: initiativesDefaultMedia?.alt,
            thumbnailSrc: mediaImageSrc(initiativesDefaultMedia) ?? heroThumb,
            thumbnailAlt: initiativesDefaultMedia?.alt,
          },
          {
            headline: "Proving small states can shape the systems they depend on.",
            body: "97% of Caribbean medicines are imported. We are building the capacity to change that.",
            ctaHref: "/about",
            backgroundKind: "image",
            imageSrc: mediaImageSrc(whyMedia) ?? heroImage?.src,
            videoSrc: mediaImageSrc(whyMedia) ? undefined : heroVideoSrc,
            imageAlt: whyMedia?.alt,
            thumbnailSrc: mediaImageSrc(buildingMedia) ?? heroThumb,
            thumbnailAlt: buildingMedia?.alt,
          },
        ];

        // DEMO fixed feature card — a single video that does not change
        // with the slider. Reuses the first available video on the page.
        const demoFeature: HeroFeature = {
          eyebrow: "Feature",
          label: "Who we are",
          href: "/about",
          videoSrc:
            mediaVideoSrc(leaderQuoteMedia) ??
            mediaVideoSrc(leaderPortraitMedia) ??
            mediaVideoSrc(buildingMedia) ??
            heroVideoSrc,
          posterSrc:
            mediaImageSrc(leaderPortraitMedia) ??
            mediaImageSrc(buildingMedia) ??
            heroThumb,
          posterAlt: leaderPortraitMedia?.alt,
        };

        return (
          <HeroSection
            headline={data.heroHeadline}
            body={data.heroBody}
            backgroundKind={bg?.kind === "image" ? "image" : "video"}
            videoSrc={heroVideoSrc}
            imageSrc={heroImage?.src}
            imageAlt={heroImage?.alt}
            ctaHref={data.heroCtaHref ?? undefined}
            slides={heroSlides.length > 0 ? heroSlides : demoSlides}
            feature={cmsFeature ?? demoFeature}
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
      {/* Slide-over parallax — on desktop (and only when motion is allowed,
          which mirrors the SectorsSection `pinned` condition exactly), this
          section is pulled up so it slides over the fully-revealed, still-
          pinned sectors diagram and finishes covering it exactly as the
          diagram releases. The pull is -120vh (not -100vh): the diagram
          un-pins one viewport-height before the section's bottom, so a full
          viewport of overlap is needed for the cover to land on the un-pin
          frame — otherwise the last node briefly scrolls up in the top
          sliver before being covered. The upward shadow lifts it off the
          dark stage to sell the depth. On mobile / reduced-motion it flows
          normally. */}
      {/* Card-stack: this wrapper bounds the sticky context (so Why BPI
          un-pins once Initiatives has passed — it never bleeds over the
          sections below). The whole wrapper is pulled up one viewport so
          Why BPI still slides over the molecule above it. No drop-shadow:
          the molecule section is light green here, so a dark shadow read
          as an unwanted dark tint at the color change. */}
      <div className="relative motion-safe:md:z-30 motion-safe:md:mt-[-120vh]">
        {/* Why BPI pins as the base card and recedes (scales back + dims)
            as Initiatives slides up over it. */}
        <StackCard className="relative z-30">
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
        </StackCard>
        {/* Initiatives slides up over the receding Why BPI like a stacked
            card, then pins at the top (sticky). No drop-shadow: every
            section here shares the same light-green background, so the
            section flows seamlessly into "Latest from BPI" below. */}
        <div className="relative z-40 motion-safe:md:sticky motion-safe:md:top-0">
          <InitiativesSection
            eyebrow={data.initiativesEyebrow}
            heading={data.initiativesHeading}
            viewAllHref={data.initiativesViewAllHref ?? undefined}
            imageSrc={mediaImageSrc(initiativesDefaultMedia)}
            videoSrc={mediaVideoSrc(initiativesDefaultMedia)}
            imageAlt={initiativesDefaultMedia?.alt}
            initiatives={initiativesItems}
          />
        </div>
        {/* Scroll room so Initiatives stays stuck at the top for a beat
            before the page continues. Every section here is the same light
            green, so this reads as seamless background, not a gap. */}
        <div
          aria-hidden
          className="motion-safe:md:h-[60vh] motion-safe:md:bg-error-25"
        />
      </div>
      <BlogSection heading={data.blogHeading} posts={blogPosts} />
      <PageSections sections={data.pageSections} />
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
