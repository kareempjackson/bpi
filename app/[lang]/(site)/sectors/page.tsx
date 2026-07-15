import type { Metadata } from "next";

import BlogSection, { type BlogSectionPost } from "@/app/components/BlogSection";
import BuildingSection from "@/app/components/BuildingSection";
import CareersSection from "@/app/components/CareersSection";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import MediaImage from "@/app/components/MediaImage";
import PageSections from "@/app/components/PageSections";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveImage, resolveMedia } from "@/sanity/lib/image";
import {
  ALL_SECTORS_QUERY,
  HOME_PAGE_QUERY,
  LATEST_POSTS_QUERY,
  SECTORS_PAGE_QUERY,
} from "@/sanity/lib/queries";
import type {
  BlogPost,
  HomePage,
  ResolvedMedia,
  SectorNode,
  SectorsPage,
  SectorSummary,
} from "@/sanity/lib/types";
import SectorsStack, { type SectorSlide } from "./SectorsStack";

export const revalidate = 3600;

// Poster/still for a resolved media object (image src, or a video's poster).
function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}

// Video src for a resolved media object (undefined for images).
function mediaVideoSrc(m: ResolvedMedia | null): string | undefined {
  return m?.kind === "video" ? m.src : undefined;
}

// The six sectors are authored on the Home page document (molecule diagram).
// Reuse that data here so the two stay in sync.
async function getHomePage(lang: string): Promise<HomePage | null> {
  return loadQuery<HomePage | null>(HOME_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.homePage],
  });
}

// Still image for a sector node — the uploaded image, or a video's poster.
function sectorStill(node: SectorNode): { src: string; alt: string } | null {
  const poster =
    node.media?.kind === "video" ? node.media.videoPoster : node.media?.image;
  const img = resolveImage(poster ?? null, { width: 800 });
  return img ? { src: img.src, alt: img.alt || node.title } : null;
}

async function getSectorsPage(lang: string): Promise<SectorsPage | null> {
  return loadQuery<SectorsPage | null>(SECTORS_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.sectorsPage],
  });
}

const DEFAULT_HERO_HEADING = "How Health Gets Here";
const DEFAULT_HERO_BODY =
  "Medicine doesn't reach a patient through one decision. It takes six systems working together: trade routes, a trained workforce, research infrastructure, innovation, regulation, and capital. This is where BPI builds each one.";
const DEFAULT_SIX_HEADING = "The Six";
const DEFAULT_SIX_INTRO =
  "BPI works across six sectors to build the systems, routes, and infrastructure that determine whether essential medicines reach the Caribbean reliably and on time.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const page = await getSectorsPage(lang);
  return {
    title: page?.seoTitle ?? "Sectors — BPI",
    description:
      page?.seoDescription ??
      "The six sectors BPI is building across — each a structural component of the Caribbean's pharmaceutical future.",
  };
}

export default async function SectorsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [data, page, sectors, latestPosts] = await Promise.all([
    getHomePage(lang),
    getSectorsPage(lang),
    loadQuery<SectorSummary[] | null>(ALL_SECTORS_QUERY, {
      params: { lang },
      tags: [TAG.sector],
    }),
    loadQuery<BlogPost[] | null>(LATEST_POSTS_QUERY, {
      params: { lang, limit: 3 },
      tags: [TAG.post],
    }),
  ]);
  const nodes = data?.sectorsNodes ?? [];
  const buildingMedia = resolveMedia(data?.buildingImage, { width: 1600 });
  const careersMedia = resolveMedia(data?.careersImage, { width: 1200 });
  const heroMedia = resolveMedia(
    page?.heroImage ?? data?.whyImage ?? data?.leaderQuoteImage,
    { width: 1400 },
  );

  // Editable page copy — the singleton overrides, then the Home document's
  // sector fields, then a sensible built-in default.
  const heroHeading =
    page?.heroHeading ?? data?.sectorsHeading ?? DEFAULT_HERO_HEADING;
  const heroBody = page?.heroBody ?? data?.sectorsBody ?? DEFAULT_HERO_BODY;
  const heroCtaLabel = page?.heroCta?.label ?? "Explore Sectors";
  const heroCtaHref = page?.heroCta?.href
    ? localizedHref(lang, page.heroCta.href)
    : "#sectors";
  const sixHeading = page?.sixHeading ?? DEFAULT_SIX_HEADING;
  const sixIntro = page?.sixIntro ?? DEFAULT_SIX_INTRO;

  // Still image for each molecule node, keyed by its slot id — used as a
  // fallback so a seeded sector without its own card image still shows the
  // matching diagram photo in the drawer.
  const nodeStillById = new Map<string, ReturnType<typeof sectorStill>>(
    nodes.map((node) => [node.nodeId, sectorStill(node)] as const),
  );

  // Latest from BPI — newest posts, mapped to the shared bento component.
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

  // The drawer stack prefers the dedicated Sector documents (each links to its
  // own /sectors/[slug] detail page). When none are authored yet, it falls back
  // to the six molecule nodes on the Home document so the page is never empty.
  const sectorDocSlides: SectorSlide[] = (sectors ?? []).map((s) => {
    const img = resolveImage(s.cardImage, { width: 800 });
    const still = nodeStillById.get(s.slug) ?? null;
    return {
      nodeId: s.slug,
      title: s.title,
      description: s.subtitle ?? undefined,
      href: localizedHref(lang, `/sectors/${s.slug}`),
      imageSrc: img?.src ?? still?.src,
      imageAlt: img?.alt || still?.alt || s.title,
    };
  });

  const nodeSlides: SectorSlide[] = nodes.map((node) => {
    const still = sectorStill(node);
    return {
      nodeId: node.nodeId,
      title: node.title,
      description: node.description ?? undefined,
      href: node.href
        ? localizedHref(lang, node.href)
        : localizedHref(lang, `/sectors/${node.nodeId}`),
      imageSrc: still?.src,
      imageAlt: still?.alt,
    };
  });

  const sectorSlides: SectorSlide[] =
    sectorDocSlides.length > 0 ? sectorDocSlides : nodeSlides;

  return (
    <main className="bg-error-25">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        style={{ backgroundColor: "#01190d" }}
        className="relative overflow-hidden pt-20 md:pt-24 lg:pt-24"
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
        <GridHoverBackdrop />

        {/* Heading — hugs the left content padding, above the image. */}
        <div className="relative px-6 md:px-12 lg:px-20 xl:px-28">
          <Stagger
            as="h1"
            className="font-display text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-error-500"
          >
            {heroHeading}
          </Stagger>
        </div>

        {/* Row — image bleeds to the left screen edge; body + CTA on the right. */}
        <div className="relative mt-6 md:mt-8 grid grid-cols-1 items-center gap-8 lg:mt-8 lg:grid-cols-[1.9fr_1fr] lg:gap-14">
          {/* Left — team hero image, rounded on the right edge only. */}
          <Reveal
            preset="scale"
            className="relative aspect-4/3 w-full overflow-hidden rounded-r-sm bg-primary-500 lg:aspect-video"
          >
            {heroMedia ? (
              <MediaImage
                media={heroMedia}
                sizes="(min-width: 1024px) 65vw, 100vw"
                preload
                eager
              />
            ) : null}
          </Reveal>

          {/* Right — body + CTA. */}
          <Stagger
            className="flex max-w-md flex-col gap-8 px-6 md:px-12 lg:pl-0 lg:pr-20 xl:pr-28"
          >
            <StaggerItem as="p" className="text-lg md:text-xl text-white/85 leading-relaxed">
              {heroBody}
            </StaggerItem>
            <StaggerItem>
              <CtaLink
                href={heroCtaHref}
                className="inline-flex w-fit items-center rounded-round bg-error-500 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
              >
                {heroCtaLabel}
              </CtaLink>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      {/* The Six — sectors carousel */}
      {sectorSlides.length > 0 ? (
        <section
          id="sectors"
          className="scroll-mt-24 px-6 md:px-12 lg:px-20 xl:px-28 pt-16 md:pt-20 lg:pt-24 pb-16 md:pb-24 lg:pb-32"
        >
          <div className="mx-auto max-w-page">
            <Stagger className="max-w-2xl">
              <StaggerItem as="h2" className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.02em]">
                {sixHeading}
              </StaggerItem>
              <StaggerItem as="p" className="mt-5 text-lg md:text-xl text-primary-500/80 leading-relaxed">
                {sixIntro}
              </StaggerItem>
            </Stagger>

            <Reveal className="mt-10 md:mt-14">
              <SectorsStack slides={sectorSlides} />
            </Reveal>
          </div>
        </section>
      ) : (
        <section className="px-6 md:px-12 lg:px-20 xl:px-28 pb-20">
          <div className="mx-auto max-w-page text-primary-500/60">
            Sectors haven&rsquo;t been configured yet. Add them on the Home page
            document (Sectors group) in Sanity.
          </div>
        </section>
      )}

      {/* Latest from BPI — newest posts (hides itself when there are none). */}
      <BlogSection
        heading={page?.latestHeading ?? data?.blogHeading ?? undefined}
        viewAllHref={localizedHref(lang, "/blog")}
        posts={blogPosts}
      />

      {/* Modular tail — editor-managed blocks on the Sectors page document. When
          none are set, fall back to the Home page's Careers + footer-CTA copy so
          the page never ends abruptly. */}
      {page?.pageSections && page.pageSections.length > 0 ? (
        <PageSections sections={page.pageSections} />
      ) : (
        <>
          <CareersSection
            tone="mint"
            eyebrow={data?.careersEyebrow ?? undefined}
            heading={data?.careersHeading ?? undefined}
            lead={data?.careersLead ?? undefined}
            body={data?.careersBody ?? undefined}
            imageSrc={
              mediaImageSrc(careersMedia) ?? mediaImageSrc(buildingMedia)
            }
            imageAlt={careersMedia?.alt ?? buildingMedia?.alt}
            primaryLabel={data?.careersPrimaryCta?.label ?? undefined}
            primaryHref={
              data?.careersPrimaryCta?.href
                ? localizedHref(lang, data.careersPrimaryCta.href)
                : undefined
            }
            secondaryLabel={data?.careersSecondaryCta?.label ?? undefined}
            secondaryHref={
              data?.careersSecondaryCta?.href
                ? localizedHref(lang, data.careersSecondaryCta.href)
                : undefined
            }
          />
          <BuildingSection
            imageSrc={mediaImageSrc(buildingMedia)}
            imageAlt={buildingMedia?.alt}
            headlineLine1={data?.buildingHeadlineLine1}
            headlineLine2={data?.buildingHeadlineLine2}
            primaryLabel={data?.buildingPrimaryCta?.label ?? undefined}
            primaryHref={data?.buildingPrimaryCta?.href ?? undefined}
            secondaryLabel={data?.buildingSecondaryCta?.label ?? undefined}
            secondaryHref={data?.buildingSecondaryCta?.href ?? undefined}
          />
        </>
      )}
    </main>
  );
}
