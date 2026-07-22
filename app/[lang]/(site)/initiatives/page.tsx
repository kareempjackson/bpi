import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";

import ArrowCircle from "@/app/components/ArrowCircle";
import BuildingSection from "@/app/components/BuildingSection";
import CareersSection from "@/app/components/CareersSection";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import Logo from "@/app/components/Logo";
import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import Zone from "@/app/components/sections/Zone";
import type { RenderedBlock } from "@/app/components/sections/registry";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveImage, resolveMedia } from "@/sanity/lib/image";
import {
  ALL_INITIATIVES_QUERY,
  HOME_PAGE_QUERY,
  INITIATIVES_PAGE_QUERY,
  INITIATIVE_POSTS_QUERY,
} from "@/sanity/lib/queries";
import type {
  FutureStat,
  HomePage,
  Initiative,
  InitiativePost,
  InitiativesPage,
  ResolvedMedia,
} from "@/sanity/lib/types";

import OtherWorksCards from "./OtherWorksCards";

export const revalidate = 3600;

/**
 * Locale-prefix an optional href. Keeps "unset" as `undefined` so `CtaLink`
 * renders its non-navigating fallback — `localizedHref` turns a null href into
 * `"#"`, which `CtaLink` would treat as external and open in a new tab.
 */
function localCta(
  lang: string,
  href: string | null | undefined,
): string | undefined {
  return href ? localizedHref(lang, href) : undefined;
}

/**
 * Where an initiative card points: `externalLink` wins; otherwise its detail
 * page, unless the editor turned that off. Absent `hasDetailPage` means true
 * (legacy data). Returns `undefined` for display-only initiatives.
 */
function initiativeHref(
  initiative: Initiative,
  lang: string,
): string | undefined {
  if (initiative.externalLink) return initiative.externalLink;
  if (initiative.hasDetailPage === false) return undefined;
  return localizedHref(lang, `/initiatives/${initiative.slug}`);
}

/**
 * Split the hero headline so the first two and last two words render light
 * green and the middle stays white — e.g. "Contributing to | Caribbean |
 * health security". Degrades gracefully for short headlines (≤4 words just
 * colours the ends, no white middle).
 */
function splitHeadlineEnds(headline: string): {
  start: string;
  middle: string;
  end: string;
} {
  const words = headline.trim().split(/\s+/).filter(Boolean);
  const n = words.length;
  const startCount = Math.min(2, n);
  const endCount = Math.min(2, Math.max(0, n - startCount));
  return {
    start: words.slice(0, startCount).join(" "),
    middle: words.slice(startCount, n - endCount).join(" "),
    end: endCount ? words.slice(n - endCount).join(" ") : "",
  };
}

async function getInitiativesPage(lang: string): Promise<InitiativesPage | null> {
  return loadQuery<InitiativesPage | null>(INITIATIVES_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.initiativesPage],
  });
}

async function getInitiativePosts(
  lang: string,
  limit: number,
): Promise<InitiativePost[]> {
  if (limit <= 0) return [];
  const data = await loadQuery<InitiativePost[] | null>(INITIATIVE_POSTS_QUERY, {
    params: { lang, limit },
    tags: [TAG.initiative],
  });
  return data ?? [];
}

async function getAllInitiatives(lang: string): Promise<Initiative[]> {
  const data = await loadQuery<Initiative[] | null>(ALL_INITIATIVES_QUERY, {
    params: { lang },
    tags: [TAG.initiative],
  });
  return data ?? [];
}

// Careers + footer-CTA copy is authored on the Home document; reuse it so the
// bottom of this page stays in sync with the rest of the site.
async function getHomePage(lang: string): Promise<HomePage | null> {
  return loadQuery<HomePage | null>(HOME_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.homePage],
  });
}

// Poster/still for a resolved media object (image src, or a video's poster).
function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}
function mediaVideoSrc(m: ResolvedMedia | null): string | undefined {
  return m?.kind === "video" ? m.src : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const page = await getInitiativesPage(lang);
  return {
    title: page?.seoTitle ?? "Initiatives — BPI",
    description:
      page?.seoDescription ??
      "The deliberate projects building the Caribbean's pharmaceutical gateway. Manufacturing, supply, regulation, and partnership.",
  };
}

export default async function InitiativesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const page = await getInitiativesPage(lang);
  const featured = page?.featuredInitiative ?? null;
  const [posts, allInitiatives, homeData] = await Promise.all([
    getInitiativePosts(lang, page?.motionStoriesShowCount ?? 6),
    getAllInitiatives(lang),
    getHomePage(lang),
  ]);
  const careersMedia = resolveMedia(homeData?.careersImage, { width: 1200 });
  const buildingMedia = resolveMedia(homeData?.buildingImage, { width: 1600 });

  return (
    <main className="bg-error-25">
      <HeroHeader page={page} lang={lang} />
      <WorkInMotion page={page} lang={lang} />
      <FeaturedSpotlight featured={featured} page={page} lang={lang} />
      <MotionStoriesSection page={page} posts={posts} lang={lang} />
      <OtherWorksSection
        page={page}
        allInitiatives={allInitiatives}
        lang={lang}
      />
      <BuildingFutureSection page={page} />
      <Zone
        blocks={page?.pageSections as unknown as RenderedBlock[]}
        lang={lang}
      />

      {/* Careers + footer-CTA close the page, reusing the Home document's copy
          so it stays in sync with the rest of the site. */}
      <CareersSection
        tone="mint"
        eyebrow={homeData?.careersEyebrow ?? undefined}
        heading={homeData?.careersHeading ?? undefined}
        lead={homeData?.careersLead ?? undefined}
        body={homeData?.careersBody ?? undefined}
        imageSrc={mediaImageSrc(careersMedia) ?? mediaImageSrc(buildingMedia)}
        videoSrc={mediaVideoSrc(careersMedia)}
        imageAlt={careersMedia?.alt ?? buildingMedia?.alt}
        primaryLabel={homeData?.careersPrimaryCta?.label ?? undefined}
        primaryHref={
          homeData?.careersPrimaryCta?.href
            ? localizedHref(lang, homeData.careersPrimaryCta.href)
            : undefined
        }
        secondaryLabel={homeData?.careersSecondaryCta?.label ?? undefined}
        secondaryHref={
          homeData?.careersSecondaryCta?.href
            ? localizedHref(lang, homeData.careersSecondaryCta.href)
            : undefined
        }
      />
      <BuildingSection
        imageSrc={mediaImageSrc(buildingMedia)}
        imageAlt={buildingMedia?.alt}
        headlineLine1={homeData?.buildingHeadlineLine1}
        headlineLine2={homeData?.buildingHeadlineLine2}
        primaryLabel={homeData?.buildingPrimaryCta?.label ?? undefined}
        primaryHref={homeData?.buildingPrimaryCta?.href ?? undefined}
        secondaryLabel={homeData?.buildingSecondaryCta?.label ?? undefined}
        secondaryHref={homeData?.buildingSecondaryCta?.href ?? undefined}
      />
    </main>
  );
}

// ─────────────────────────────────────────────────────────── Hero ──

function HeroHeader({
  page,
  lang,
}: {
  page: InitiativesPage | null;
  lang: string;
}) {
  // Resolve as media (not image-only) so an R2 video uploaded to the hero slot
  // plays here too — `resolveImage` silently drops video kinds, which left the
  // hero blank whenever an editor uploaded a video instead of a still.
  const heroMedia = resolveMedia(page?.heroImage, { width: 1800 });
  const headline = page?.heroHeadline ?? "Pushing from investment to impact.";
  const body =
    page?.heroBody ??
    "Each one a real investment, contributing to sector development across BPI's four strategic priorities.";
  const primary = page?.heroPrimaryCta ?? {
    label: "Partner With BPI",
    href: "/contact",
  };
  const secondary = page?.heroSecondaryCta ?? {
    label: "Explore Our Impact",
    href: "/#ecosystem",
  };
  const {
    start: headlineStart,
    middle: headlineMiddle,
    end: headlineEnd,
  } = splitHeadlineEnds(headline);

  return (
    <section
      data-nav-theme="dark"
      data-cursor="icon"
      className="relative overflow-hidden bg-error-950 px-6 md:px-10 lg:px-14 pt-8 md:pt-10 lg:pt-8 pb-6 md:pb-7 lg:pb-8 lg:h-dvh lg:flex lg:flex-col"
    >
      {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
      <GridHoverBackdrop />

      <div className="relative mx-auto w-full max-w-page lg:flex lg:flex-1 lg:flex-col lg:min-h-0">
        {/* Two-tone headline — first sentence white, remainder green. Width
            capped so it breaks onto two lines. */}
        <Stagger
          as="h1"
          immediate
          // Hanging indent (lg+): line 1 stays flush with the logo; the wrapped
          // second line is pushed right so "Caribbean" starts under the "b" of
          // the first line. Widened at lg so the whole "middle + end" phrase
          // (kept together via lg:whitespace-nowrap below) fits on that line.
          // Tune the ch value to shift the second line.
          className="shrink-0 font-display text-[clamp(2.25rem,4vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.03em] max-w-2xl lg:max-w-5xl lg:pl-[6ch] lg:indent-[-6ch]"
        >
          <StaggerItem as="span" className="text-error-300">
            {headlineStart}
          </StaggerItem>
          {headlineMiddle || headlineEnd ? (
            <>
              {" "}
              {/* Keep the remainder ("Caribbean health security") on one line
                  at lg+ so it doesn't break across the indented second line. */}
              <span className="lg:whitespace-nowrap">
                {headlineMiddle ? (
                  <StaggerItem as="span" className="text-white">
                    {headlineMiddle}
                  </StaggerItem>
                ) : null}
                {headlineEnd ? (
                  <>
                    {" "}
                    <StaggerItem as="span" className="text-error-300">
                      {headlineEnd}
                    </StaggerItem>
                  </>
                ) : null}
              </span>
            </>
          ) : null}
        </Stagger>

        {/* Full-width hero image. Outer wrapper takes ALL the leftover column
            height (flex-1) so the image is as large as possible; inner fills
            it (h-full) with no aspect ratio on desktop. Fixed ratio below lg
            where the page scrolls. */}
        {heroMedia ? (
          <div className="mt-4 md:mt-5 w-full lg:flex-1 lg:min-h-0 lg:max-h-[54dvh]">
            <Reveal
              preset="scale"
              immediate
              className="relative w-full max-lg:aspect-video lg:h-full overflow-hidden rounded-md lg:rounded-lg bg-white/5"
            >
              {/* Renders an <Image> for a still or an autoplaying <video> for an
                  R2 upload. `eager` skips the lazy gate for this above-fold hero. */}
              <MediaImage media={heroMedia} sizes="100vw" preload eager />
            </Reveal>
          </div>
        ) : null}

        {/* Body (left) + CTAs (right) below the image. */}
        <Stagger
          immediate
          delayChildren={0.2}
          className="shrink-0 mt-7 md:mt-9 lg:mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          {body ? (
            <StaggerItem className="max-w-3xl">
              {/* Hero body per design spec: Albert Sans (via --font-display)
                  Light 300, 24px / 152% line-height, no tracking, white. */}
              <PortableTextBody
                value={body}
                paragraphClassName="align-middle font-display text-base md:text-lg lg:text-[20px] font-light leading-[1.52] tracking-normal text-white"
              />
            </StaggerItem>
          ) : null}
          <StaggerItem className="flex flex-wrap items-center gap-2.5 shrink-0">
            {primary ? (
              <CtaLink
                href={localCta(lang, primary.href)}
                className="inline-flex w-fit items-center rounded-round bg-error-500 px-5 py-2 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
              >
                {primary.label}
              </CtaLink>
            ) : null}
            {secondary ? (
              <CtaLink
                href={localCta(lang, secondary.href)}
                className="inline-flex w-fit items-center rounded-round border border-white/60 bg-transparent px-5 py-2 text-sm font-semibold text-white transition-colors duration-300 ease-(--ease-premium) hover:border-white/80 hover:bg-white/10"
              >
                {secondary.label}
              </CtaLink>
            ) : null}
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────── Work in Motion ──

function WorkInMotion({
  page,
  lang,
}: {
  page: InitiativesPage | null;
  lang: string;
}) {
  // Editor can hide the whole section via the `showWorkInMotion` toggle.
  // Defaults to true so existing pages keep rendering.
  if (page && page.showWorkInMotion === false) return null;
  const heading = page?.workInMotionHeading ?? "The BPI Work in Motion";
  const body =
    page?.workInMotionBody ??
    "BPI develops catalytic projects across pharmaceutical manufacturing, supply chain, regulatory development, and regional trade. Each project is structured from concept to bankability to execution, with the partnerships, financing, and government alignment to make it last.";
  const bg = page?.workInMotionBg ?? "#38FE9C";
  const primary = page?.workInMotionPrimaryCta ?? {
    label: "Partner With BPI",
    href: "/contact",
  };
  const secondary = page?.workInMotionSecondaryCta ?? {
    label: "Our Ecosystem",
    href: "/#ecosystem",
  };
  const bannerImage = resolveImage(page?.workInMotionImage, { width: 2000 });

  // Break the heading into ~two-word lines so each can be indented a step
  // further than the last — the staggered, stepped treatment from the design.
  const headingLines = heading
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .reduce<string[]>((lines, word, i) => {
      if (i % 2 === 0) lines.push(word);
      else lines[lines.length - 1] += ` ${word}`;
      return lines;
    }, []);

  return (
    <section
      data-nav-theme="light"
      className="px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
      style={{ backgroundColor: bg }}
    >
      <Stagger
        className="mx-auto grid max-w-page grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start"
      >
        {/* Left — oversized heading, each line stepped further right. */}
        <StaggerItem
          as="h2"
          className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold text-primary-500 leading-[0.98] tracking-[-0.03em]"
        >
          {headingLines.map((line, i) => (
            <span
              key={i}
              className="block"
              style={{ marginLeft: `${i * 2.5}rem` }}
            >
              {line}
            </span>
          ))}
        </StaggerItem>

        {/* Right — body + CTAs, dropped toward the lower half. */}
        <StaggerItem className="flex flex-col gap-8 lg:gap-10 lg:pt-16 xl:pt-24">
          {body ? (
            <PortableTextBody
              value={body}
              paragraphClassName="text-lg md:text-xl text-primary-500/90 leading-relaxed"
            />
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            {primary ? (
              <CtaLink
                href={localCta(lang, primary.href)}
                className="inline-flex w-fit items-center rounded-round bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-(--ease-premium) hover:bg-primary-600"
              >
                {primary.label}
              </CtaLink>
            ) : null}
            {secondary ? (
              <CtaLink
                href={localCta(lang, secondary.href)}
                className="inline-flex w-fit items-center rounded-round border border-primary-500 bg-transparent px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-primary-500/5"
              >
                {secondary.label}
              </CtaLink>
            ) : null}
          </div>
        </StaggerItem>
      </Stagger>

      {/* Wide banner image across the bottom of the section. */}
      {bannerImage ? (
        <Reveal
          preset="scale"
          className="mx-auto mt-12 md:mt-16 lg:mt-20 w-full max-w-page overflow-hidden rounded-2xl lg:rounded-3xl bg-primary-500/5"
        >
          <div className="relative aspect-video lg:aspect-2/1">
            <Image
              src={bannerImage.src}
              alt={bannerImage.alt}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      ) : null}
    </section>
  );
}

// ─────────────────────────────────────────────── Featured spotlight ──

// Uniform mint card; only the last of the (max three) supporting cards gets
// the faint molecule watermark.
const SUPPORTING_CARD_BG = "#A5F9D2";

function FeaturedSpotlight({
  featured,
  page,
  lang,
}: {
  featured: Initiative | null;
  page: InitiativesPage | null;
  lang: string;
}) {
  const supporting = page?.featuredSupportingInitiatives ?? [];
  if (!featured && supporting.length === 0) return null;

  const coverImage = resolveImage(featured?.coverImage, { width: 1600 });
  const imageSrc = coverImage?.src;
  const imageAlt = coverImage?.alt ?? featured?.title ?? "";
  // The featured initiative gets a CTA only when there's somewhere to send
  // the user.
  const detailHref = featured ? initiativeHref(featured, lang) : undefined;

  return (
    <section
      data-nav-theme="light"
      className="bg-error-25 px-6 md:px-10 lg:px-14 py-16 md:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-page flex flex-col gap-14 lg:gap-20">
        {featured ? (
          <Stagger className="flex flex-col">
            {/* Eyebrow */}
            <StaggerItem className="text-xs lg:text-sm font-medium tracking-[0.18em] text-primary-500 uppercase">
              Featured
            </StaggerItem>

            {/* Two-tone headline — the part before the colon stays dark, the
                remainder greys back. */}
            <StaggerItem
              as="h2"
              className="mt-5 lg:mt-7 font-display text-[clamp(1.9rem,3.6vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.02em] max-w-5xl"
            >
              <ColonTwoTone text={featured.title} />
            </StaggerItem>

            {/* Editorial body — note + portrait media on the left; statement,
                stat note, and CTAs on the right. */}
            <StaggerItem className="mt-10 lg:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              <div className="flex flex-col gap-8 lg:gap-12">
                {featured.excerpt ? (
                  <RuleNote className="lg:max-w-xs">
                    {featured.excerpt}
                  </RuleNote>
                ) : null}
                {imageSrc ? (
                  <FeaturedMedia
                    src={imageSrc}
                    alt={imageAlt}
                    href={detailHref}
                  />
                ) : null}
              </div>

              <div className="flex flex-col gap-10 lg:justify-between lg:pt-3">
                {featured.subtitle ? (
                  <p className="font-display text-[clamp(1.6rem,2.7vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.01em] max-w-xl">
                    <Emphasis text={featured.subtitle} />
                  </p>
                ) : null}

                <div className="flex flex-col gap-7 lg:gap-9">
                  {page?.featuredStatBody ? (
                    <RuleNote className="lg:max-w-sm">
                      <PortableTextBody
                        value={page.featuredStatBody}
                        compact
                        paragraphClassName="text-sm text-primary-500/65 leading-relaxed"
                      />
                    </RuleNote>
                  ) : null}
                  <div
                    className={`flex flex-wrap items-center gap-3 ${
                      page?.featuredStatBody ? "lg:pl-14" : ""
                    }`}
                  >
                    {detailHref ? (
                      <CtaLink
                        href={detailHref}
                        className="inline-flex w-fit items-center rounded-round bg-error-500 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
                      >
                        Learn More
                      </CtaLink>
                    ) : null}
                    <CtaLink
                      href={localizedHref(lang, "/contact")}
                      className="inline-flex w-fit items-center rounded-round border border-primary-500 bg-transparent px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-primary-500/5"
                    >
                      Partner With BPI
                    </CtaLink>
                  </div>
                </div>
              </div>
            </StaggerItem>
          </Stagger>
        ) : null}

        {supporting.length > 0 ? (
          <Stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
          >
            {supporting.slice(0, 3).map((initiative, idx, arr) => (
              <StaggerItem key={initiative._id}>
                <SupportingInitiativeCard
                  initiative={initiative}
                  lang={lang}
                  watermark={idx === arr.length - 1}
                />
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}
      </div>
    </section>
  );
}

// Headline two-tone: text up to and including the first colon stays dark; the
// remainder greys back. Falls back to all-dark when there's no colon.
function ColonTwoTone({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  const i = text.indexOf(":");
  if (i === -1) return <span className="text-primary-500">{text}</span>;
  return (
    <>
      <span className="text-primary-500">{text.slice(0, i + 1)}</span>
      <span className="text-primary-500/45">{text.slice(i + 1)}</span>
    </>
  );
}

// Statement emphasis: words wrapped in **double asterisks** render bold/dark,
// everything else greys back — lets editors pick the highlighted phrase.
function Emphasis({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-bold text-primary-500">
            {part}
          </span>
        ) : (
          <span key={i} className="text-primary-500/45">
            {part}
          </span>
        ),
      )}
    </>
  );
}

// Small note prefixed by a short horizontal rule — the recurring annotation
// motif beside the featured copy.
function RuleNote({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <span
        aria-hidden
        className="mt-2.5 h-px w-10 shrink-0 bg-primary-500/30"
      />
      <div className="text-sm text-primary-500/65 leading-relaxed">{children}</div>
    </div>
  );
}

// Portrait media tile with a play badge; links to the detail page when set.
function FeaturedMedia({
  src,
  alt,
  href,
}: {
  src: string;
  alt: string;
  href?: string;
}) {
  const cls =
    "group/media relative block w-full max-w-md lg:mx-auto aspect-3/4 overflow-hidden rounded-2xl lg:rounded-3xl bg-primary-500";
  const inner = (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 32vw, 90vw"
        className="object-cover"
      />
    </>
  );
  return href ? (
    <CtaLink href={href} className={cls}>
      {inner}
    </CtaLink>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function SupportingInitiativeCard({
  initiative,
  lang,
  watermark,
}: {
  initiative: Initiative;
  lang: string;
  watermark: boolean;
}) {
  const href = initiativeHref(initiative, lang);
  // Custom per-initiative tag drives the eyebrow ("Initiative", "Partnership",
  // "Research", …). Falls back to a generic label when none is set.
  const eyebrow = initiative.tag ?? "Initiative";
  const bg = SUPPORTING_CARD_BG;
  const className =
    "relative overflow-hidden flex flex-col justify-between rounded-2xl lg:rounded-3xl px-6 md:px-7 lg:px-8 py-7 md:py-8 lg:py-9 min-h-80 md:min-h-96 lg:min-h-112";
  const interactiveClassName = href
    ? " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
    : "";

  const inner = (
    <>
      {watermark ? (
        <Logo
          iconOnly
          size={300}
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -right-10 lg:-bottom-16 lg:-right-12 text-error-600/20"
        />
      ) : null}

      <div className="relative flex flex-col gap-2.5">
        <div className="text-sm font-medium tracking-[0.02em] text-primary-500/55">
          {eyebrow}
        </div>
        <h3 className="font-display text-xl md:text-2xl lg:text-[1.7rem] font-bold text-primary-500 leading-[1.15] tracking-[-0.01em]">
          {initiative.title}
        </h3>
      </div>
      {initiative.excerpt ? (
        <p className="relative mt-6 text-sm lg:text-base text-primary-500/85 leading-relaxed">
          {initiative.excerpt}
        </p>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <div
        className={className + interactiveClassName}
        style={{ backgroundColor: bg }}
      >
        {inner}
      </div>
    );
  }

  return (
    <CtaLink
      href={href}
      className={className + interactiveClassName}
      style={{ backgroundColor: bg }}
    >
      {inner}
    </CtaLink>
  );
}

// ─────────────────────────────────────────────────── Motion Stories ──

function MotionStoriesSection({
  page,
  posts,
  lang,
}: {
  page: InitiativesPage | null;
  posts: InitiativePost[];
  lang: string;
}) {
  // Editor can hide the whole section via the `showMotionStories`
  // toggle. Defaults to true so existing pages keep rendering.
  if (page && page.showMotionStories === false) return null;
  if (posts.length === 0) return null;
  const heading = page?.motionStoriesHeading ?? "Motion Stories";
  const bg = page?.motionStoriesBg ?? "#CFE9FF";
  const viewAllHref = page?.motionStoriesViewAllHref ?? "/news";

  return (
    <section className="px-6 md:px-10 lg:px-14 pb-14 md:pb-20 lg:pb-24">
      <div
        className="mx-auto max-w-page rounded-2xl lg:rounded-[1.75rem] px-5 md:px-10 lg:px-14 py-8 md:py-12 lg:py-16"
        style={{ backgroundColor: bg }}
      >
        <div className="flex items-center justify-between gap-4 mb-7 md:mb-9 lg:mb-11">
          <h2 className="font-display text-2xl md:text-3xl lg:text-display-sm font-bold text-primary-500 leading-[1.1] tracking-[-0.015em]">
            {heading}
          </h2>
          {viewAllHref ? (
            <CtaLink
              href={localCta(lang, viewAllHref)}
              className="group/viewall inline-flex items-center gap-2 md:gap-3 text-sm md:text-base font-medium text-primary-500 focus-visible:outline-none focus-visible:opacity-100"
            >
              <span className="transition-transform duration-300 ease-[var(--ease-premium)] group-hover/viewall:-translate-x-0.5 motion-reduce:transform-none">
                View all
              </span>
              <ArrowCircle
                size={44}
                className="text-primary-500 transition-transform duration-300 ease-[var(--ease-premium)] group-hover/viewall:translate-x-1 group-hover/viewall:rotate-[8deg] motion-reduce:transform-none"
              />
            </CtaLink>
          ) : null}
        </div>

        <Stagger
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-fr"
        >
          {posts.map((post, idx) => {
            // First tile always renders as full-bleed `large`, regardless
            // of the per-post setting — matches the Motion Stories design.
            // Other tiles follow `initiativeTileSize` from Sanity.
            const isLarge = idx === 0 || post.initiativeTileSize === "large";
            return (
              <StaggerItem key={post._id}>
                {isLarge ? (
                  <LargeStoryTile post={post} lang={lang} />
                ) : (
                  <CompactStoryTile post={post} lang={lang} />
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

function postHref(post: InitiativePost, lang: string): string {
  return localizedHref(lang, post.externalLink ?? `/blog/${post.slug}`);
}

function postEyebrow(post: InitiativePost): string {
  return post.initiativeEyebrow ?? "Initiative";
}

function postImage(post: InitiativePost, width: number) {
  const img = resolveImage(post.coverImage, { width });
  return {
    src: img?.src ?? null,
    alt: img?.alt ?? post.title,
  };
}

function LargeStoryTile({
  post,
  lang,
}: {
  post: InitiativePost;
  lang: string;
}) {
  const img = postImage(post, 1200);
  return (
    <CtaLink
      href={postHref(post, lang)}
      className="group/tile relative md:col-span-2 rounded-2xl lg:rounded-3xl overflow-hidden aspect-4/3 md:aspect-2/1 lg:aspect-4/3 bg-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
    >
      {img.src ? (
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      ) : null}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-black/80 via-black/40 to-transparent"
      />
      <div className="absolute left-5 md:left-7 right-16 md:right-20 bottom-5 md:bottom-7 flex flex-col gap-2">
        <div className="text-[11px] md:text-xs font-bold tracking-[0.18em] text-white uppercase">
          {postEyebrow(post)}
        </div>
        <p className="text-sm md:text-base text-white/90 leading-snug max-w-md">
          {post.title}
        </p>
      </div>
      <ArrowCircle
        size={44}
        className="absolute bottom-5 md:bottom-7 right-5 md:right-7 text-white"
      />
    </CtaLink>
  );
}

function CompactStoryTile({
  post,
  lang,
}: {
  post: InitiativePost;
  lang: string;
}) {
  const img = postImage(post, 600);
  const bg = post.initiativeTileAccent ? "#38FE9C" : "#FFFFFF";
  return (
    <CtaLink
      href={postHref(post, lang)}
      className="relative flex flex-col rounded-2xl lg:rounded-3xl p-4 md:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
      style={{ backgroundColor: bg }}
    >
      <div className="px-1 md:px-2 pt-1 md:pt-2">
        <div className="text-[11px] md:text-xs font-bold tracking-[0.18em] text-primary-500 uppercase">
          {postEyebrow(post)}
        </div>
        <p className="mt-2 text-sm md:text-base text-primary-500 leading-snug">
          {post.title}
        </p>
      </div>

      <div className="relative mt-auto aspect-4/3 rounded-xl lg:rounded-2xl overflow-hidden">
        {img.src ? (
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(min-width: 1024px) 24vw, (min-width: 768px) 48vw, 100vw"
            className="object-cover"
          />
        ) : null}
        <ArrowCircle
          size={40}
          className="absolute bottom-3 right-3 text-white"
        />
      </div>
    </CtaLink>
  );
}

// ──────────────────────────────────────────────────── Other Works ──

/** How many more cards each "View More" click reveals. */
const OTHER_WORKS_STEP = 4;

function OtherWorksSection({
  page,
  allInitiatives,
  lang,
}: {
  page: InitiativesPage | null;
  allInitiatives: Initiative[];
  lang: string;
}) {
  // Editor can hide the whole section via the `showOtherWorks` toggle.
  // Defaults to true so existing pages keep rendering.
  if (page && page.showOtherWorks === false) return null;
  const eyebrow = page?.otherWorksEyebrow ?? "Barbados Pharmaceuticals Inc.";
  const heading =
    page?.otherWorksHeading ?? "Other Initiatives You Should Know at BPI";
  const featuredImg = resolveImage(page?.otherWorksFeaturedImage, {
    width: 1600,
  });
  const featuredTitle = page?.otherWorksFeaturedTitle ?? undefined;
  const featuredHref = localCta(lang, page?.otherWorksFeaturedHref);

  // The editor's curated picks open the section, in their order; every other
  // published initiative queues up behind them so "View More" has something
  // left to reveal. Curated stays first so the section still leads with what
  // the editor chose.
  const curated = page?.otherWorksInitiatives ?? [];
  const curatedIds = new Set(curated.map((initiative) => initiative._id));
  const cards = [
    ...curated,
    ...allInitiatives.filter((initiative) => !curatedIds.has(initiative._id)),
  ];
  // Show exactly the curated set up front — an uncurated page still needs a
  // sensible first batch rather than a lone "View More".
  const initialCount = curated.length > 0 ? curated.length : OTHER_WORKS_STEP;

  // Nothing configured yet — skip rather than render an empty dark band.
  if (cards.length === 0 && !featuredImg) return null;

  // Staggered, stepped heading lines; the middle line greens (e.g.
  // "Other Initiatives" / "You Should" / "Know at BPI").
  const lines = heading
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .reduce<string[]>((acc, word, i) => {
      if (i % 2 === 0) acc.push(word);
      else acc[acc.length - 1] += ` ${word}`;
      return acc;
    }, []);
  const midIdx = Math.floor((lines.length - 1) / 2);

  return (
    <section
      data-nav-theme="dark"
      className="bg-error-950 px-6 md:px-10 lg:px-14 py-16 md:py-20 lg:py-28"
    >
      <div className="mx-auto grid max-w-page grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-14">
        {/* Left — eyebrow + staggered, two-tone heading. Sticks while the
            right-hand grid scrolls past (like the blog sidebar). */}
        <Stagger
          className="lg:col-span-1 lg:pt-4 lg:sticky lg:top-24 lg:self-start"
        >
          <StaggerItem className="text-sm text-white/55">{eyebrow}</StaggerItem>
          <StaggerItem
            as="h2"
            className="mt-6 font-display text-[clamp(2rem,3.2vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em]"
          >
            {lines.map((line, i) => (
              <span
                key={i}
                className={`block ${
                  i === midIdx ? "text-error-500" : "text-white"
                }`}
                style={{
                  // Green middle line is flush-left; lines above step in a
                  // little, lines below step out further — the zigzag stagger.
                  marginLeft: `${
                    i === midIdx
                      ? 0
                      : i < midIdx
                        ? (midIdx - i) * 3
                        : (i - midIdx) * 7
                  }rem`,
                }}
              >
                {line}
              </span>
            ))}
          </StaggerItem>
        </Stagger>

        {/* Right — mint card masonry + featured tile + View More. The cards are
            rendered here (server-side) and handed to the client component, which
            only decides how many of them are on screen. */}
        <Stagger
          className="lg:col-span-2 flex flex-col gap-6 lg:gap-7"
        >
          <OtherWorksCards
            initialCount={initialCount}
            step={OTHER_WORKS_STEP}
            cards={cards.map((initiative, idx) => {
              // Every 5th card is the larger "feature" layout. The variant
              // travels alongside the node so the client wrapper can own the
              // masonry class (`column-span:all` must sit on the direct child
              // of the multicol container it animates).
              const variant = (idx + 1) % 5 === 0 ? "feature" : "compact";
              return {
                key: initiative._id,
                variant,
                node: (
                  <OtherWorkCard
                    initiative={initiative}
                    lang={lang}
                    variant={variant}
                  />
                ),
              };
            })}
          >
            {featuredImg ? (
              <StaggerItem>
                <OtherWorksFeaturedTile
                  src={featuredImg.src}
                  alt={featuredImg.alt}
                  title={featuredTitle}
                  href={featuredHref}
                />
              </StaggerItem>
            ) : null}
          </OtherWorksCards>
        </Stagger>
      </div>
    </section>
  );
}

// Masonry card with two layouts:
//   • "compact" — mint card; small square thumbnail tucked top-right beside
//     the title, description anchored to the bottom.
//   • "feature" — full-width dark media tile spanning both columns, with the
//     title overlaid on the cover image (the every-5th break).
function OtherWorkCard({
  initiative,
  lang,
  variant,
}: {
  initiative: Initiative;
  lang: string;
  variant: "compact" | "feature";
}) {
  const href = initiativeHref(initiative, lang);
  const img = resolveImage(initiative.coverImage, {
    width: variant === "feature" ? 1600 : 700,
  });
  const tag = initiative.tag ?? "Initiative";

  // Full-width dark media tile. The `column-span:all` + bottom margin that
  // place it in the masonry live on the wrapper in `OtherWorksCards`.
  if (variant === "feature") {
    const featCls =
      "group/feat relative block overflow-hidden rounded-2xl lg:rounded-3xl aspect-video lg:aspect-2/1 bg-primary-500";
    const featInner = (
      <>
        {img ? (
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"
        />
        <p className="absolute left-6 right-6 bottom-6 md:left-8 md:bottom-8 font-display text-lg md:text-xl lg:text-2xl font-bold text-white leading-snug max-w-md">
          {initiative.title}
        </p>
      </>
    );
    return href ? (
      <CtaLink href={href} className={featCls}>
        {featInner}
      </CtaLink>
    ) : (
      <div className={featCls}>{featInner}</div>
    );
  }

  // Compact mint card. The `break-inside-avoid` + bottom margin that place it
  // in the masonry live on the wrapper in `OtherWorksCards`.
  const cls =
    "flex flex-col h-full rounded-2xl lg:rounded-3xl p-6 lg:p-7 min-h-96 lg:min-h-112";
  const inner = (
    <>
      <div className="flex items-start justify-between gap-5">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium tracking-[0.02em] text-primary-500/55">
            {tag}
          </div>
          <h3 className="font-display text-xl lg:text-2xl font-bold text-primary-500 leading-[1.18] tracking-[-0.01em]">
            {initiative.title}
          </h3>
        </div>
        {img ? (
          <div className="relative shrink-0 w-24 md:w-28 lg:w-36 aspect-square overflow-hidden rounded-xl lg:rounded-2xl bg-primary-500/5">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
      {initiative.excerpt ? (
        <p className="mt-auto pt-12 text-sm lg:text-[15px] text-primary-500/85 leading-relaxed">
          {initiative.excerpt}
        </p>
      ) : null}
    </>
  );

  return href ? (
    <CtaLink
      href={href}
      className={`${cls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30`}
      style={{ backgroundColor: SUPPORTING_CARD_BG }}
    >
      {inner}
    </CtaLink>
  ) : (
    <div className={cls} style={{ backgroundColor: SUPPORTING_CARD_BG }}>
      {inner}
    </div>
  );
}

// Large dark media tile with a title overlay, shown below the cards.
function OtherWorksFeaturedTile({
  src,
  alt,
  title,
  href,
}: {
  src: string;
  alt: string;
  title?: string;
  href?: string;
}) {
  const cls =
    "group/feat relative block overflow-hidden rounded-2xl lg:rounded-3xl aspect-video lg:aspect-2/1 bg-primary-500";
  const inner = (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"
      />
      {title ? (
        <p className="absolute left-6 right-6 bottom-6 md:left-8 md:bottom-8 font-display text-lg md:text-xl lg:text-2xl font-bold text-white leading-snug max-w-md">
          {title}
        </p>
      ) : null}
    </>
  );
  return href ? (
    <CtaLink href={href} className={cls}>
      {inner}
    </CtaLink>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

// ────────────────────────────────────────────── Building the Future ──

function BuildingFutureSection({
  page,
}: {
  page: InitiativesPage | null;
}) {
  const heading =
    page?.buildingFutureHeading ??
    "Building The Future Of Pharmaceutical Access";
  const body =
    page?.buildingFutureBody ??
    "Barbados Pharmaceuticals Inc. was established with a vision to strengthen pharmaceutical capacity within the region while supporting global healthcare advancement. We operate at the intersection of pharmaceutical production, education, research, and strategic healthcare development.";
  const stats = page?.buildingFutureStats ?? [];
  const statBg = page?.buildingFutureStatBg ?? "#A5F9D2";
  if (stats.length === 0) return null;

  return (
    <section className="px-6 md:px-10 lg:px-14 pb-14 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-page">
        <Stagger
          className="flex flex-col gap-3 max-w-3xl mb-8 lg:mb-10"
        >
          <StaggerItem
            as="h2"
            className="font-display text-2xl md:text-3xl lg:text-display-sm font-bold text-primary-500 leading-[1.1] tracking-[-0.015em]"
          >
            {heading}
          </StaggerItem>
          {body ? (
            <StaggerItem className="max-w-2xl">
              <PortableTextBody
                value={body}
                paragraphClassName="text-sm md:text-base text-primary-500/75 leading-relaxed"
              />
            </StaggerItem>
          ) : null}
        </Stagger>

        <Stagger
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5"
        >
          {stats.map((stat, idx) => (
            <StaggerItem key={idx}>
              <FutureStatCard stat={stat} bg={statBg} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function FutureStatCard({ stat, bg }: { stat: FutureStat; bg: string }) {
  return (
    <div
      className="rounded-2xl lg:rounded-3xl px-5 md:px-6 lg:px-7 pt-5 md:pt-6 lg:pt-7 pb-10 md:pb-14 lg:pb-16 min-h-40 md:min-h-50 lg:min-h-60 flex flex-col justify-between"
      style={{ backgroundColor: bg }}
    >
      <div className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-none tracking-[-0.01em]">
        {stat.value}
      </div>
      <p className="text-xs md:text-sm text-primary-500/85 leading-relaxed">
        {stat.body}
      </p>
    </div>
  );
}

