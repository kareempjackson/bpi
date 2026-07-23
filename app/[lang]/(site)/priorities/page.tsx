import type { Metadata } from "next";
import Image from "next/image";

import BuildingSection from "@/app/components/BuildingSection";
import CareersSection from "@/app/components/CareersSection";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import Logo from "@/app/components/Logo";
import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import Zone from "@/app/components/sections/Zone";
import type { RenderedBlock } from "@/app/components/sections/registry";
import ArchitectureOfCareSection from "@/app/components/ArchitectureOfCareSection";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref, toLocale } from "@/app/lib/locale";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMedia } from "@/sanity/lib/image";
import {
  ALL_PRIORITIES_QUERY,
  HOME_PAGE_QUERY,
  LATEST_POSTS_QUERY,
  PRIORITIES_PAGE_QUERY,
} from "@/sanity/lib/queries";
import type {
  BlogPost,
  HomePage,
  PrioritiesPage,
  PrioritySummary,
  ResolvedMedia,
} from "@/sanity/lib/types";

// Time-based backstop; busted on publish via the revalidate webhook.
export const revalidate = 3600;

// Poster/still for a resolved media object (image src, or a video's poster).
function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}
function mediaVideoSrc(m: ResolvedMedia | null): string | undefined {
  return m?.kind === "video" ? m.src : undefined;
}

// Editor-managed content for this page. Every field is optional — the page
// falls back to the defaults below so it renders fully before the document is
// authored/published.
async function getPrioritiesPage(
  lang: string,
): Promise<PrioritiesPage | null> {
  return loadQuery<PrioritiesPage | null>(PRIORITIES_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.prioritiesPage],
  });
}

// Careers + footer-CTA copy is authored on the Home document; reuse it so the
// bottom of this page stays in sync with the rest of the site.
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
  const data = await getPrioritiesPage(toLocale(lang));
  return {
    title: data?.seoTitle ?? "Strategic Priorities — BPI",
    description:
      data?.seoDescription ??
      "Our strategic priorities are designed to accelerate industry growth, improve healthcare outcomes, and position Barbados as a leading pharmaceutical hub in the Caribbean.",
  };
}

// Fallback impact stats, used until the document defines its own.
const DEFAULT_STATS: { value: string; label: string }[] = [
  { value: "25+", label: "Strategic Partnerships" },
  { value: "50+", label: "Training & Initiatives" },
  { value: "100+", label: "Professionals Trained" },
  { value: "10+", label: "Innovative Projects" },
  { value: "5+", label: "Market Collaborations" },
];

// Fallback four strategic priorities, shown as a numbered index.
const DEFAULT_PRIORITIES: string[] = [
  "Attract & Facilitate Investment",
  "Build & Incubate Capacity",
  "Strengthen Regional Supply Chains",
  "Build the Ecosystem Foundations",
];

// "Latest from BPI" — one large feature story + N compact cards, built from the
// newest published posts (editors add/remove posts, same as the home bento).
type NewsCard = {
  title: string;
  eyebrow?: string;
  tags: string[];
  href: string;
  imageSrc?: string;
  imageAlt?: string;
};

// Newest posts, driving the "Latest from BPI" section.
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

// Map a post to the card shape used by this page's news layout.
function postToNewsCard(p: BlogPost): NewsCard {
  const m = resolveMedia(p.coverImage, { width: 1200 });
  return {
    title: p.title,
    eyebrow: p.contentType
      ? p.contentType[0].toUpperCase() + p.contentType.slice(1)
      : undefined,
    tags: (p.tags ?? []).map((t) => t.title).slice(0, 2),
    href: p.externalLink ?? `/blog/${p.slug}`,
    imageSrc: mediaImageSrc(m),
    imageAlt: m?.alt,
  };
}

export default async function PrioritiesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = toLocale(raw);

  const contactHref = `/${lang}/contact`;

  const [pageData, homeData, priorityDocs] = await Promise.all([
    getPrioritiesPage(lang),
    getHomePage(lang),
    loadQuery<PrioritySummary[] | null>(ALL_PRIORITIES_QUERY, {
      params: { lang },
      tags: [TAG.priority],
    }),
  ]);
  const careersMedia = resolveMedia(homeData?.careersImage, { width: 1200 });
  const buildingMedia = resolveMedia(homeData?.buildingImage, { width: 1600 });
  // Hero + facility images prefer the page document, then fall back to the
  // Home document's assets so the layout always has real imagery.
  const heroMedia = resolveMedia(
    pageData?.heroImage ?? homeData?.whyImage ?? homeData?.leaderQuoteImage,
    { width: 1400 },
  );
  const prioritiesMedia =
    resolveMedia(pageData?.prioritiesImage, { width: 1600 }) ?? buildingMedia;

  // Resolve every editorial slot with a sensible fallback.
  const heroBody =
    pageData?.heroBody ??
    "BPI is focused on four strategic priorities. Each one a deliberate step toward a Caribbean that manufactures, distributes, and regulates its own medicines.";
  const heroHeadlineLine1 = pageData?.heroHeadlineLine1 ?? "Strategic";
  const heroHeadlineLine2 = pageData?.heroHeadlineLine2 ?? "Priorities";
  const heroCtaLabel = pageData?.heroCta?.label ?? "Partner With BPI";
  const heroCtaHref = pageData?.heroCta?.href
    ? localizedHref(lang, pageData.heroCta.href)
    : contactHref;

  // Impact stats band is hidden by default; an editor opts in via `showStats`.
  const showStats = pageData?.showStats === true;
  const statsIntro =
    pageData?.statsIntro ??
    "Our commitment to excellence is reflected in the impact we continue to create across the pharmaceutical sector.";
  const statsHeading =
    pageData?.statsHeading ?? "Advancing Pharmaceutical Excellence";
  const stats =
    pageData?.stats && pageData.stats.length > 0
      ? pageData.stats.map((s) => ({
          value: s.value ?? "",
          label: s.description ?? "",
        }))
      : DEFAULT_STATS;

  const prioritiesHeading =
    pageData?.prioritiesHeading ?? "Strategic Priorities";
  const prioritiesIntro =
    pageData?.prioritiesIntro ??
    "BPI is focused on four strategic priorities. Each one a deliberate step toward a Caribbean that manufactures, distributes, and regulates its own medicines.";
  // Prefer real Priority documents (each links to a /priorities/[slug] detail
  // page); fall back to the page document's plain labels, then the built-in
  // defaults (both non-linking).
  const priorities: { label: string; href?: string; subtitle?: string | null }[] =
    priorityDocs && priorityDocs.length > 0
      ? priorityDocs.map((p) => ({
          label: p.title,
          href: `/${lang}/priorities/${p.slug}`,
          subtitle: p.subtitle,
        }))
      : (pageData?.priorities && pageData.priorities.length > 0
          ? pageData.priorities
              .map((p) => p.label)
              .filter((l): l is string => !!l)
          : DEFAULT_PRIORITIES
        ).map((label) => ({ label }));
  const prioritiesCtaLabel = pageData?.prioritiesCta?.label ?? "Partner With BPI";
  const prioritiesCtaHref = pageData?.prioritiesCta?.href
    ? localizedHref(lang, pageData.prioritiesCta.href)
    : contactHref;

  // Priority rows rendered exactly like the home page's "How We Work" section
  // (`ArchitectureOfCareSection`): each row expands to reveal its subtitle and
  // the priority's hero media. Falls back to the plain label list (no media /
  // link) when no Priority documents exist yet.
  const priorityItems =
    priorityDocs && priorityDocs.length > 0
      ? priorityDocs.map((p) => {
          const m = resolveMedia(p.heroImage, { width: 700 });
          return {
            title: p.title,
            description: p.subtitle ?? "",
            href: localizedHref(lang, `/priorities/${p.slug}`),
            imageSrc: m ? (m.kind === "image" ? m.src : m.poster ?? "") : "",
            videoSrc: m?.kind === "video" ? m.src : undefined,
            imageAlt: m?.alt,
            color: "#CAF1FF",
          };
        })
      : priorities.map((p) => ({
          title: p.label,
          description: p.subtitle ?? "",
          href: p.href ?? prioritiesCtaHref,
          imageSrc: "",
          color: "#CAF1FF",
        }));

  // The wide facility image anchors the bottom of the section (the section's
  // `feature` slot), mirroring the home page treatment.
  const prioritiesFeature = prioritiesMedia
    ? {
        imageSrc:
          prioritiesMedia.kind === "image"
            ? prioritiesMedia.src
            : prioritiesMedia.poster,
        videoSrc:
          prioritiesMedia.kind === "video" ? prioritiesMedia.src : undefined,
        imageAlt: prioritiesMedia.alt,
      }
    : undefined;

  // Latest from BPI — newest posts (feature + compact cards). Editors control
  // the list by adding/removing posts and tuning `latestShowCount`.
  const latestHeading = pageData?.latestHeading ?? "Latest from BPI";
  const latestPosts = await getLatestPosts(lang, pageData?.latestShowCount ?? 3);
  const newsFeature = latestPosts[0] ? postToNewsCard(latestPosts[0]) : null;
  const newsCards = latestPosts.slice(1).map(postToNewsCard);

  return (
    <main className="relative bg-error-25 overflow-hidden">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        style={{ backgroundColor: "#01190d" }}
        className="relative overflow-hidden px-6 md:px-10 lg:px-14 pt-24 md:pt-28 lg:pt-24 pb-12 md:pb-14 lg:pb-12 lg:min-h-[88vh] lg:flex lg:flex-col"
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
        <GridHoverBackdrop />

        <div className="relative grid w-full grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 lg:flex-1 lg:min-h-0 lg:items-stretch">
          {/* Left — body + CTA at the top, oversized two-tone headline at the
              bottom of the column. */}
          <div className="flex flex-col justify-between gap-12 lg:gap-8 lg:py-2 lg:min-h-0">
            <Stagger className="flex flex-col gap-7 max-w-md">
              <StaggerItem>
                <PortableTextBody
                  value={heroBody}
                  paragraphClassName="text-base md:text-lg text-white/70 leading-relaxed"
                />
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

            <Stagger
              as="h1"
              className="font-display text-[clamp(2.75rem,6vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.03em]"
            >
              <StaggerItem as="span" className="block text-white">
                {heroHeadlineLine1}
              </StaggerItem>
              <StaggerItem as="span" className="block text-error-500 lg:ml-40">
                {heroHeadlineLine2}
              </StaggerItem>
            </Stagger>
          </div>

          {/* Right — team hero image (or branded placeholder). */}
          <Reveal
            preset="scale"
            className="relative w-full max-lg:aspect-4/5 lg:h-full min-h-0 overflow-hidden rounded-md bg-primary-500"
          >
            {heroMedia ? (
              <MediaImage
                media={heroMedia}
                sizes="(min-width: 1024px) 45vw, 100vw"
                preload
                eager
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center"
              >
                <Logo iconOnly size={220} className="text-white/10" />
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── Impact stats (hidden by default; editor opt-in via showStats) ── */}
      {showStats ? (
      <section
        data-nav-theme="light"
        className="bg-error-500 px-6 md:px-10 lg:px-14 py-16 md:py-20 lg:py-24"
      >
        <div className="mx-auto w-full max-w-page">
          <Stagger className="max-w-xl">
            <StaggerItem>
              <PortableTextBody
                value={statsIntro}
                paragraphClassName="text-base md:text-lg text-primary-500/80 leading-relaxed"
              />
            </StaggerItem>
            <StaggerItem
              as="h2"
              className="mt-5 font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
            >
              {statsHeading}
            </StaggerItem>
          </Stagger>

          <Stagger
            as="dl"
            className="mt-14 md:mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-10"
          >
            {stats.map((s, i) => (
              <StaggerItem
                key={`${i}-${s.label}`}
                className={`flex flex-col gap-3 lg:px-8 lg:first:pl-0 ${
                  i > 0 ? "lg:border-l lg:border-primary-500/20" : ""
                }`}
              >
                <dt className="font-display text-4xl lg:text-5xl font-bold text-primary-500 leading-none tracking-[-0.02em]">
                  {s.value}
                </dt>
                <dd className="text-sm md:text-base text-primary-500/70">
                  {s.label}
                </dd>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      ) : null}

      {/* ── Strategic priorities ───────────────────────────────────────
          Rendered with the home page's "How We Work" section so each row
          expands to reveal its subtitle and hero media. */}
      <ArchitectureOfCareSection
        heading={prioritiesHeading}
        description={prioritiesIntro}
        items={priorityItems}
        feature={prioritiesFeature}
      />

      {/* Section CTA (kept from the previous priorities layout). */}
      <section
        data-nav-theme="light"
        className="bg-error-25 px-6 md:px-10 lg:px-14 pb-16 md:pb-24 lg:pb-28"
      >
        <div className="mx-auto w-full max-w-page">
          <CtaLink
            href={prioritiesCtaHref}
            className="inline-flex w-fit items-center rounded-round bg-error-500 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
          >
            {prioritiesCtaLabel}
          </CtaLink>
        </div>
      </section>

      {/* ── Latest from BPI ────────────────────────────────────────── */}
      {newsFeature ? (
        <section
          data-nav-theme="light"
          className="bg-error-25 px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
        >
          <div className="mx-auto w-full max-w-page">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8 md:mb-12">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-[1.05] tracking-[-0.02em]">
                {latestHeading}
              </h2>
              <CtaLink
                href={`/${lang}/blog`}
                className="group inline-flex items-center gap-3 text-sm md:text-base font-medium text-primary-500"
              >
                View all
                <span className="inline-flex size-10 md:size-11 items-center justify-center rounded-full border border-primary-500 transition-colors group-hover:bg-primary-500/5">
                  <NewsArrow className="h-4 w-4" />
                </span>
              </CtaLink>
            </div>

            {/* Grid: large feature (2 cols) + compact cards. */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-5 items-stretch">
              {/* Feature */}
              <CtaLink
                href={localizedHref(lang, newsFeature.href)}
                className="group relative lg:col-span-2 flex flex-col justify-between overflow-hidden rounded-2xl lg:rounded-3xl bg-primary-500 p-6 md:p-7 lg:p-8 min-h-112 lg:min-h-136 focus-visible:outline-none"
              >
                {newsFeature.imageSrc ? (
                  <Image
                    src={newsFeature.imageSrc}
                    alt={newsFeature.imageAlt ?? ""}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : null}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/30"
                />
                <div className="relative flex flex-wrap gap-2">
                  {newsFeature.tags.map((t) => (
                    <NewsTag key={t} label={t} dark />
                  ))}
                </div>
                <div className="relative flex items-end justify-between gap-4">
                  <div className="max-w-md">
                    {newsFeature.eyebrow ? (
                      <div className="text-xs md:text-sm font-bold uppercase tracking-[0.16em] text-white">
                        {newsFeature.eyebrow}
                      </div>
                    ) : null}
                    <p className="mt-3 text-base md:text-lg text-white/90 leading-snug">
                      {newsFeature.title}
                    </p>
                  </div>
                  <NewsCircleArrow />
                </div>
              </CtaLink>

              {/* Compact cards */}
              {newsCards.map((card) => (
                <CtaLink
                  key={card.href}
                  href={localizedHref(lang, card.href)}
                  className="group lg:col-span-1 flex flex-col rounded-2xl lg:rounded-3xl bg-error-50 p-5 md:p-6 focus-visible:outline-none"
                >
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((t) => (
                      <NewsTag key={t} label={t} />
                    ))}
                  </div>
                  <div className="relative mt-5 aspect-square overflow-hidden rounded-xl lg:rounded-2xl bg-primary-500">
                    {card.imageSrc ? (
                      <Image
                        src={card.imageSrc}
                        alt={card.imageAlt ?? ""}
                        fill
                        sizes="(min-width: 1024px) 25vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Logo iconOnly size={90} className="text-white/10" />
                      </div>
                    )}
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <p className="text-base md:text-lg text-primary-500 leading-snug">
                      {card.title}
                    </p>
                    <NewsCircleArrow />
                  </div>
                </CtaLink>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Modular page sections (editor-managed) ─────────────────────
          Editors add / reorder Call-to-action + Careers blocks on the
          Priorities document. Falls back to the Home document's Careers +
          Building CTA until the page defines its own. */}
      {pageData?.pageSections && pageData.pageSections.length > 0 ? (
        <Zone
          blocks={pageData.pageSections as unknown as RenderedBlock[]}
          lang={lang}
        />
      ) : homeData ? (
        <>
          <CareersSection
            tone="mint"
            eyebrow={homeData.careersEyebrow ?? undefined}
            heading={homeData.careersHeading ?? undefined}
            lead={homeData.careersLead ?? undefined}
            body={homeData.careersBody ?? undefined}
            imageSrc={
              mediaImageSrc(careersMedia) ?? mediaImageSrc(buildingMedia)
            }
            videoSrc={mediaVideoSrc(careersMedia)}
            imageAlt={careersMedia?.alt ?? buildingMedia?.alt}
            primaryLabel={homeData.careersPrimaryCta?.label ?? undefined}
            primaryHref={homeData.careersPrimaryCta?.href ?? undefined}
            secondaryLabel={homeData.careersSecondaryCta?.label ?? undefined}
            secondaryHref={homeData.careersSecondaryCta?.href ?? undefined}
          />
          <BuildingSection
            tone="green"
            imageSrc={mediaImageSrc(buildingMedia)}
            imageAlt={buildingMedia?.alt}
            headlineLine1={homeData.buildingHeadlineLine1}
            headlineLine2={homeData.buildingHeadlineLine2}
            primaryLabel={homeData.buildingPrimaryCta?.label ?? undefined}
            primaryHref={homeData.buildingPrimaryCta?.href ?? undefined}
            secondaryLabel={homeData.buildingSecondaryCta?.label ?? undefined}
            secondaryHref={homeData.buildingSecondaryCta?.href ?? undefined}
          />
        </>
      ) : null}
    </main>
  );
}

// Tag pill — outlined; `dark` variant sits on the dark feature card.
function NewsTag({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5 ${
        dark
          ? "border-white/50 text-white"
          : "border-primary-500/40 text-primary-500"
      }`}
    >
      {label}
    </span>
  );
}

// White circular arrow badge tucked into the corner of each news card.
function NewsCircleArrow() {
  return (
    <span className="shrink-0 inline-flex size-11 md:size-12 items-center justify-center rounded-full bg-white text-primary-500 shadow-sm transition-transform duration-300 ease-(--ease-premium) group-hover:translate-x-0.5 motion-reduce:transform-none">
      <NewsArrow className="h-5 w-5" />
    </span>
  );
}

function NewsArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
