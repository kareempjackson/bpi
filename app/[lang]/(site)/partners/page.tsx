import type { Metadata } from "next";

import BlogSection, { type BlogSectionPost } from "@/app/components/BlogSection";
import BuildingSection from "@/app/components/BuildingSection";
import CareersSection from "@/app/components/CareersSection";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMedia } from "@/sanity/lib/image";
import {
  HOME_PAGE_QUERY,
  LATEST_POSTS_QUERY,
  PARTNERS_PAGE_QUERY,
} from "@/sanity/lib/queries";
import type {
  BlogPost,
  HomePage,
  PartnersPage,
  ResolvedMedia,
} from "@/sanity/lib/types";

export const revalidate = 3600;

/** Poster/still for a resolved media object (image src, or a video's poster). */
function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}

/** Video src for a resolved media object (undefined for images). */
function mediaVideoSrc(m: ResolvedMedia | null): string | undefined {
  return m?.kind === "video" ? m.src : undefined;
}

// Fallback copy — used until the partnersPage singleton is populated.
const HERO_HEADING = "Partners";
const HERO_BODY =
  "Building the Caribbean's pharmaceutical gateway takes more than one institution. Here's who BPI is building it with.";

// Partner-card tones — matches the shared card palette used across the site.
const PARTNER_TONE_BG: Record<string, string> = {
  white: "#FFFFFF",
  blue: "#CBE7FB",
  green: "#5BDE8C",
};

async function getPartnersPage(lang: string): Promise<PartnersPage | null> {
  return loadQuery<PartnersPage | null>(PARTNERS_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.partnersPage],
  });
}

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
  const data = await getPartnersPage(lang);
  return {
    title: data?.seoTitle ?? "Partners — BPI",
    description:
      data?.seoDescription ??
      "Building the Caribbean's pharmaceutical gateway takes more than one institution. Here's who BPI is building it with.",
  };
}

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [data, home, latestPosts] = await Promise.all([
    getPartnersPage(lang),
    getHomePage(lang),
    loadQuery<BlogPost[] | null>(LATEST_POSTS_QUERY, {
      params: { lang, limit: 3 },
      tags: [TAG.post],
    }),
  ]);

  // Bottom closers — reuse the Home document's Careers + CTA copy/photos.
  const careersMedia = resolveMedia(home?.careersImage, { width: 1200 });
  const buildingMedia = resolveMedia(home?.buildingImage, { width: 1600 });
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

  // Centre photo: the partnersPage upload first, then a Home photo so the hero
  // never renders bare before the real shot is uploaded.
  const media = resolveMedia(
    data?.heroImage ?? home?.whyImage ?? home?.leaderQuoteImage,
    { width: 1400 },
  );
  const heroHeading = data?.heroHeading ?? HERO_HEADING;
  const heroBody = data?.heroBody ?? HERO_BODY;
  const heroCtaLabel = data?.heroCta?.label ?? "Partner With BPI";
  const heroCtaHref = data?.heroCta?.href ?? "/contact";

  const partnerGroups = (data?.partnerGroups ?? []).filter(
    (g) => g.headingLead || (g.cards?.length ?? 0) > 0,
  );

  return (
    <main className="relative bg-error-950 overflow-hidden">
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        className="relative flex min-h-svh flex-col overflow-hidden bg-error-950"
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover,
            and the BPI logo mark replaces the cursor across the hero. */}
        <GridHoverBackdrop />

        <div className="relative flex flex-1 flex-col px-6 md:px-10 lg:px-14 pt-28 md:pt-32 lg:pt-32 pb-14 md:pb-16 lg:pb-16">
          <div className="flex w-full flex-1 items-center">
            <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
              {/* Left — display heading. */}
              <Stagger className="lg:col-span-3 lg:self-start lg:pt-8">
                <StaggerItem
                  as="h1"
                  className="font-display text-[clamp(3.5rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-error-500"
                >
                  {heroHeading}
                </StaggerItem>
              </Stagger>

              {/* Center — the partners photo. */}
              {media ? (
                <Reveal
                  preset="scale"
                  className="group relative aspect-square w-full overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 shadow-2xl shadow-black/40 lg:col-span-5"
                >
                  <MediaImage
                    media={media}
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    preload
                    eager
                  />
                </Reveal>
              ) : (
                <Reveal
                  preset="scale"
                  aria-hidden
                  className="aspect-square w-full rounded-3xl bg-white/5 ring-1 ring-white/10 lg:col-span-5"
                />
              )}

              {/* Right — body + CTA, anchored toward the bottom. */}
              <Stagger className="flex flex-col gap-8 lg:col-span-4 lg:justify-end lg:pb-10">
                <StaggerItem>
                  <PortableTextBody
                    value={heroBody}
                    className="max-w-md"
                    paragraphClassName="text-base md:text-lg text-white/75 leading-relaxed"
                  />
                </StaggerItem>
                <StaggerItem>
                  <CtaLink
                    href={localizedHref(lang, heroCtaHref)}
                    className="inline-flex w-fit items-center rounded-round bg-error-500 px-6 py-3 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
                  >
                    {heroCtaLabel}
                  </CtaLink>
                </StaggerItem>
              </Stagger>
            </div>
          </div>
        </div>
      </section>

      {/* Partner-category groups — eyebrow + split heading + a row of tone-
          coloured partner cards. */}
      {partnerGroups.length > 0 ? (
        <>
          {partnerGroups.map((group, gi) => {
            const items = (group.cards ?? []).filter(
              (c) => c.title || c.description,
            );
            const layout = group.layout ?? "cards";

            // ── Panel: dark section, heading + CTAs on top, green column panel ──
            if (layout === "panel") {
              return (
                <section
                  key={gi}
                  data-nav-theme="dark"
                  className="bg-error-950 px-6 md:px-10 lg:px-14 pt-16 md:pt-20 lg:pt-24 pb-16 md:pb-20 lg:pb-24"
                >
                  <div className="mx-auto max-w-page">
                    <Stagger className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      {group.headingLead ? (
                        <StaggerItem
                          as="h2"
                          className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-[-0.02em]"
                        >
                          {group.headingLead}
                          {group.headingTrail ? ` ${group.headingTrail}` : ""}
                        </StaggerItem>
                      ) : (
                        <span />
                      )}
                      {group.cta?.label || group.secondaryCta?.label ? (
                        <StaggerItem className="flex flex-wrap items-center gap-3">
                          {group.cta?.label ? (
                            <CtaLink
                              href={localizedHref(lang, group.cta.href)}
                              className="inline-flex items-center rounded-round bg-error-500 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
                            >
                              {group.cta.label}
                            </CtaLink>
                          ) : null}
                          {group.secondaryCta?.label ? (
                            <CtaLink
                              href={localizedHref(lang, group.secondaryCta.href)}
                              className="inline-flex items-center rounded-round border border-white/50 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-(--ease-premium) hover:border-white/80 hover:bg-white/10"
                            >
                              {group.secondaryCta.label}
                            </CtaLink>
                          ) : null}
                        </StaggerItem>
                      ) : null}
                    </Stagger>

                    {items.length > 0 ? (
                      <Stagger className="mt-10 md:mt-12 rounded-3xl bg-[#5BDE8C] p-8 md:p-11 lg:p-14">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
                          {items.map((card, ci) => (
                            <StaggerItem
                              key={ci}
                              className={`flex flex-col lg:pr-8 ${
                                ci > 0
                                  ? "lg:border-l lg:border-primary-500/25 lg:pl-8"
                                  : ""
                              }`}
                            >
                              {card.title ? (
                                <h3 className="font-display text-xl md:text-2xl font-bold text-primary-500 leading-snug tracking-[-0.01em]">
                                  {card.title}
                                </h3>
                              ) : null}
                              {card.description ? (
                                <p className="mt-10 md:mt-14 text-sm md:text-base text-primary-500/80 leading-relaxed">
                                  {card.description}
                                </p>
                              ) : null}
                            </StaggerItem>
                          ))}
                        </div>
                      </Stagger>
                    ) : null}
                  </div>
                </section>
              );
            }

            // ── Feature: dark section, split heading left, image + caption right ──
            if (layout === "feature") {
              const featureMedia = resolveMedia(
                group.image ?? home?.leaderQuoteImage ?? home?.whyImage,
                { width: 1600 },
              );
              const caption = items[0];
              return (
                <section
                  key={gi}
                  data-nav-theme="dark"
                  className="bg-error-950 px-6 md:px-10 lg:px-14 pt-16 md:pt-20 lg:pt-24 pb-20 md:pb-28 lg:pb-32"
                >
                  <div className="mx-auto max-w-page">
                    <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-2 lg:gap-16">
                      <Stagger className="flex flex-col gap-4">
                        {group.eyebrow ? (
                          <StaggerItem
                            as="p"
                            className="text-sm font-medium tracking-[0.02em] text-white/55"
                          >
                            {group.eyebrow}
                          </StaggerItem>
                        ) : null}
                        {group.headingLead ? (
                          <StaggerItem
                            as="h2"
                            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.02] tracking-[-0.02em]"
                          >
                            {group.headingLead}
                            {group.headingTrail ? (
                              <>
                                <br />
                                <span className="inline-block pl-12 md:pl-16 text-error-500">
                                  {group.headingTrail}
                                </span>
                              </>
                            ) : null}
                          </StaggerItem>
                        ) : null}
                      </Stagger>

                      {featureMedia ? (
                        <Reveal
                          preset="scale"
                          className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-white/5"
                        >
                          <MediaImage
                            media={featureMedia}
                            sizes="(min-width: 1024px) 50vw, 100vw"
                          />
                          {caption ? (
                            <>
                              <div
                                aria-hidden
                                className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent"
                              />
                              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                                {caption.title ? (
                                  <h3 className="font-display text-lg md:text-xl font-bold text-white leading-snug">
                                    {caption.title}
                                  </h3>
                                ) : null}
                                {caption.description ? (
                                  <p className="mt-2 max-w-2xl text-sm md:text-base text-white/85 leading-relaxed">
                                    {caption.description}
                                  </p>
                                ) : null}
                              </div>
                            </>
                          ) : null}
                        </Reveal>
                      ) : null}
                    </div>
                  </div>
                </section>
              );
            }

            // ── Split: light section, heading top, image left, text + CTAs right ──
            if (layout === "split") {
              const splitMedia = resolveMedia(
                group.image ?? home?.leaderQuoteImage ?? home?.whyImage,
                { width: 1400 },
              );
              const lead = items[0];
              return (
                <section
                  key={gi}
                  data-nav-theme="light"
                  className="bg-error-25 px-6 md:px-10 lg:px-14 pt-16 md:pt-20 lg:pt-24 pb-20 md:pb-28 lg:pb-32"
                >
                  <div className="mx-auto max-w-page">
                    {group.headingLead ? (
                      <Stagger>
                        <StaggerItem
                          as="h2"
                          className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-[1.1] tracking-[-0.02em]"
                        >
                          {group.headingLead}
                          {group.headingTrail ? ` ${group.headingTrail}` : ""}
                        </StaggerItem>
                      </Stagger>
                    ) : null}

                    <div className="mt-10 md:mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
                      {splitMedia ? (
                        <Reveal
                          preset="scale"
                          className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-primary-500/5"
                        >
                          <MediaImage
                            media={splitMedia}
                            sizes="(min-width: 1024px) 50vw, 100vw"
                          />
                        </Reveal>
                      ) : null}

                      <Stagger className="flex flex-col gap-8">
                        {lead ? (
                          <StaggerItem
                            as="p"
                            className="max-w-xl text-2xl md:text-3xl text-primary-500 leading-snug tracking-[-0.01em]"
                          >
                            {lead.title ? (
                              <span className="font-bold">{lead.title} </span>
                            ) : null}
                            {lead.description}
                          </StaggerItem>
                        ) : null}
                        {group.cta?.label || group.secondaryCta?.label ? (
                          <StaggerItem className="flex flex-wrap items-center gap-3">
                            {group.cta?.label ? (
                              <CtaLink
                                href={localizedHref(lang, group.cta.href)}
                                className="inline-flex items-center rounded-round bg-error-500 px-6 py-3 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
                              >
                                {group.cta.label}
                              </CtaLink>
                            ) : null}
                            {group.secondaryCta?.label ? (
                              <CtaLink
                                href={localizedHref(lang, group.secondaryCta.href)}
                                className="inline-flex items-center rounded-round border border-primary-500/40 px-6 py-3 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:border-primary-500 hover:bg-primary-500/5"
                              >
                                {group.secondaryCta.label}
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

            const isList = layout === "list";

            // Split heading — shared by the light (cards / list) layouts.
            const heading = group.headingLead ? (
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-[1.1] tracking-[-0.02em]">
                {group.headingLead}
                {group.headingTrail ? (
                  <>
                    <br />
                    <span className="inline-block pl-16 md:pl-24">
                      {group.headingTrail}
                    </span>
                  </>
                ) : null}
              </h2>
            ) : null;

            if (isList) {
              const groupMedia = resolveMedia(
                group.image ?? home?.buildingImage ?? home?.whyImage,
                { width: 2000 },
              );
              return (
                <section
                  key={gi}
                  data-nav-theme="light"
                  className="bg-error-25 px-6 md:px-10 lg:px-14 pt-24 md:pt-32 lg:pt-40 pb-16 md:pb-24 lg:pb-32"
                >
                  <div className="mx-auto max-w-page">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
                      {/* Left — split heading. */}
                      <Stagger>
                        {group.eyebrow ? (
                          <StaggerItem
                            as="p"
                            className="mb-3 text-sm font-medium tracking-[0.02em] text-primary-500/70"
                          >
                            {group.eyebrow}
                          </StaggerItem>
                        ) : null}
                        <StaggerItem>{heading}</StaggerItem>
                      </Stagger>

                      {/* Right — numbered list + button. */}
                      <Stagger className="flex flex-col">
                        <ul className="flex flex-col">
                          {items.map((item, i) => (
                            <StaggerItem
                              as="li"
                              key={i}
                              className="border-t border-primary-500/15 pt-5 pb-5 first:border-t-0 first:pt-0"
                            >
                              <div className="flex items-start justify-between gap-6">
                                <h3 className="font-display text-lg md:text-xl font-bold text-primary-500 leading-snug tracking-[-0.01em]">
                                  {item.title}
                                </h3>
                                <span className="shrink-0 font-display text-sm md:text-base tabular-nums text-primary-500/55">
                                  {String(i + 1).padStart(2, "0")}
                                </span>
                              </div>
                              {item.description ? (
                                <p className="mt-4 max-w-xl text-sm md:text-base text-primary-500/70 leading-relaxed">
                                  {item.description}
                                </p>
                              ) : null}
                            </StaggerItem>
                          ))}
                        </ul>
                        {group.cta?.label ? (
                          <StaggerItem className="mt-10 md:mt-12">
                            <CtaLink
                              href={localizedHref(lang, group.cta.href)}
                              className="inline-flex w-fit items-center rounded-round bg-error-500 px-6 py-3 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
                            >
                              {group.cta.label}
                            </CtaLink>
                          </StaggerItem>
                        ) : null}
                      </Stagger>
                    </div>

                    {/* Full-width image below. */}
                    {groupMedia ? (
                      <Reveal
                        preset="scale"
                        className="relative mt-14 md:mt-20 aspect-video w-full overflow-hidden rounded-lg lg:rounded-xl bg-primary-500/5"
                      >
                        <MediaImage media={groupMedia} sizes="100vw" />
                      </Reveal>
                    ) : null}
                  </div>
                </section>
              );
            }

            // Cards layout (default) — a row of colour-toned partner cards.
            return (
              <section
                key={gi}
                data-nav-theme="light"
                className="bg-error-25 px-6 md:px-10 lg:px-14 pt-16 md:pt-20 lg:pt-24 pb-4 md:pb-6 lg:pb-8"
              >
                <div className="mx-auto max-w-page">
                  <Stagger className="flex flex-col gap-3">
                    {group.eyebrow ? (
                      <StaggerItem
                        as="p"
                        className="text-sm font-medium tracking-[0.02em] text-primary-500/70"
                      >
                        {group.eyebrow}
                      </StaggerItem>
                    ) : null}
                    <StaggerItem>{heading}</StaggerItem>
                  </Stagger>

                  {items.length > 0 ? (
                    <Stagger className="mt-10 md:mt-14 grid grid-cols-1 gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      {items.map((card, ci) => (
                        <StaggerItem
                          key={ci}
                          className="flex min-h-72 flex-col justify-between gap-10 rounded-lg p-7 md:p-8 lg:min-h-88"
                          style={{
                            backgroundColor:
                              PARTNER_TONE_BG[card.tone ?? "white"] ??
                              PARTNER_TONE_BG.white,
                          }}
                        >
                          {card.title ? (
                            <h3 className="font-display text-xl md:text-2xl font-bold text-primary-500 leading-snug tracking-[-0.01em]">
                              {card.title}
                            </h3>
                          ) : null}
                          {card.description ? (
                            <p className="text-sm md:text-base text-primary-500/70 leading-relaxed">
                              {card.description}
                            </p>
                          ) : null}
                        </StaggerItem>
                      ))}
                    </Stagger>
                  ) : null}
                </div>
              </section>
            );
          })}
        </>
      ) : null}

      {/* Latest from BPI — newest posts (hides itself when there are none). */}
      <BlogSection
        heading={home?.blogHeading ?? undefined}
        viewAllHref={localizedHref(lang, "/blog")}
        posts={blogPosts}
      />

      {/* Careers + footer call-to-action — reuse the Home document's copy. */}
      <CareersSection
        tone="mint"
        eyebrow={home?.careersEyebrow ?? undefined}
        heading={home?.careersHeading ?? undefined}
        lead={home?.careersLead ?? undefined}
        body={home?.careersBody ?? undefined}
        imageSrc={mediaImageSrc(careersMedia) ?? mediaImageSrc(buildingMedia)}
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
    </main>
  );
}
