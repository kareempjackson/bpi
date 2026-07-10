import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";

import ArrowCircle from "@/app/components/ArrowCircle";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import Logo from "@/app/components/Logo";
import PageSections from "@/app/components/PageSections";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveImage } from "@/sanity/lib/image";
import {
  INITIATIVES_PAGE_QUERY,
  INITIATIVE_POSTS_QUERY,
} from "@/sanity/lib/queries";
import type {
  FutureStat,
  Initiative,
  InitiativePost,
  InitiativesPage,
} from "@/sanity/lib/types";

export const revalidate = 3600;

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
  const posts = await getInitiativePosts(
    lang,
    page?.motionStoriesShowCount ?? 6,
  );

  return (
    <main className="bg-error-25">
      <HeroHeader page={page} />
      <WorkInMotion page={page} />
      <FeaturedSpotlight featured={featured} page={page} />
      <MotionStoriesSection page={page} posts={posts} />
      <OtherWorksSection page={page} />
      <BuildingFutureSection page={page} />
      <PageSections sections={page?.pageSections} />
    </main>
  );
}

// ─────────────────────────────────────────────────────────── Hero ──

function HeroHeader({ page }: { page: InitiativesPage | null }) {
  const heroImage = resolveImage(page?.heroImage, { width: 1800 });
  const imageSrc = heroImage?.src;
  const imageAlt = heroImage?.alt ?? "";
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
      className="relative overflow-hidden bg-error-950 px-6 md:px-12 lg:px-20 xl:px-28 pt-20 md:pt-24 lg:pt-20 pb-6 md:pb-7 lg:pb-7 lg:h-dvh lg:flex lg:flex-col"
    >
      {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
      <GridHoverBackdrop />

      <div className="relative mx-auto w-full max-w-page lg:flex lg:flex-1 lg:flex-col lg:min-h-0">
        {/* Two-tone headline — first sentence white, remainder green. Width
            capped so it breaks onto two lines. */}
        <h1
          data-reveal-stagger
          className="shrink-0 font-display text-[clamp(2.25rem,4vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.03em] max-w-2xl"
        >
          <span className="text-error-300">{headlineStart}</span>
          {headlineMiddle ? (
            <>
              {" "}
              <span className="text-white">{headlineMiddle}</span>
            </>
          ) : null}
          {headlineEnd ? (
            <>
              {" "}
              <span className="text-error-300">{headlineEnd}</span>
            </>
          ) : null}
        </h1>

        {/* Full-width hero image. Outer wrapper takes ALL the leftover column
            height (flex-1) so the image is as large as possible; inner fills
            it (h-full) with no aspect ratio on desktop. Fixed ratio below lg
            where the page scrolls. */}
        {imageSrc ? (
          <div className="mt-4 md:mt-5 w-full lg:flex-1 lg:min-h-0 lg:max-h-[54dvh]">
            <div
              data-reveal="scale"
              className="relative w-full max-lg:aspect-video lg:h-full overflow-hidden rounded-2xl lg:rounded-3xl bg-white/5"
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        {/* Body (left) + CTAs (right) below the image. */}
        <div
          data-reveal-stagger
          className="shrink-0 mt-7 md:mt-9 lg:mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          {body ? (
            <p className="max-w-lg text-base md:text-lg text-white/70 leading-relaxed">
              {body}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {primary ? (
              <CtaLink
                href={primary.href}
                className="inline-flex w-fit items-center rounded-round bg-error-500 px-5 py-2 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
              >
                {primary.label}
              </CtaLink>
            ) : null}
            {secondary ? (
              <CtaLink
                href={secondary.href}
                className="inline-flex w-fit items-center rounded-round border border-white/60 bg-transparent px-5 py-2 text-sm font-semibold text-white transition-colors duration-300 ease-(--ease-premium) hover:border-white/80 hover:bg-white/10"
              >
                {secondary.label}
              </CtaLink>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────── Work in Motion ──

function WorkInMotion({ page }: { page: InitiativesPage | null }) {
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
      className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28"
      style={{ backgroundColor: bg }}
    >
      <div
        data-reveal-stagger
        className="mx-auto grid max-w-page grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start"
      >
        {/* Left — oversized heading, each line stepped further right. */}
        <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold text-primary-500 leading-[0.98] tracking-[-0.03em]">
          {headingLines.map((line, i) => (
            <span
              key={i}
              className="block"
              style={{ marginLeft: `${i * 2.5}rem` }}
            >
              {line}
            </span>
          ))}
        </h2>

        {/* Right — body + CTAs, dropped toward the lower half. */}
        <div className="flex flex-col gap-8 lg:gap-10 lg:pt-16 xl:pt-24">
          {body ? (
            <p className="text-lg md:text-xl text-primary-500/90 leading-relaxed">
              {body}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            {primary ? (
              <CtaLink
                href={primary.href}
                className="inline-flex w-fit items-center rounded-round bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-(--ease-premium) hover:bg-primary-600"
              >
                {primary.label}
              </CtaLink>
            ) : null}
            {secondary ? (
              <CtaLink
                href={secondary.href}
                className="inline-flex w-fit items-center rounded-round border border-primary-500 bg-transparent px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-primary-500/5"
              >
                {secondary.label}
              </CtaLink>
            ) : null}
          </div>
        </div>
      </div>

      {/* Wide banner image across the bottom of the section. */}
      {bannerImage ? (
        <div
          data-reveal="scale"
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
        </div>
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
}: {
  featured: Initiative | null;
  page: InitiativesPage | null;
}) {
  const supporting = page?.featuredSupportingInitiatives ?? [];
  if (!featured && supporting.length === 0) return null;

  const coverImage = resolveImage(featured?.coverImage, { width: 1600 });
  const imageSrc = coverImage?.src;
  const imageAlt = coverImage?.alt ?? featured?.title ?? "";
  // Featured initiative gets a CTA only when there's somewhere to send the
  // user: externalLink wins; otherwise an internal detail page when the
  // editor hasn't turned the toggle off. Treat absent `hasDetailPage` as
  // true (legacy data).
  const detailHref = featured
    ? featured.externalLink
      ? featured.externalLink
      : featured.hasDetailPage === false
        ? undefined
        : `/initiatives/${featured.slug}`
    : undefined;

  return (
    <section
      data-nav-theme="light"
      className="bg-error-25 px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-page flex flex-col gap-14 lg:gap-20">
        {featured ? (
          <div data-reveal-stagger className="flex flex-col">
            {/* Eyebrow */}
            <div className="text-xs lg:text-sm font-medium tracking-[0.18em] text-primary-500 uppercase">
              Featured
            </div>

            {/* Two-tone headline — the part before the colon stays dark, the
                remainder greys back. */}
            <h2 className="mt-5 lg:mt-7 font-display text-[clamp(1.9rem,3.6vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.02em] max-w-5xl">
              <ColonTwoTone text={featured.title} />
            </h2>

            {/* Editorial body — note + portrait media on the left; statement,
                stat note, and CTAs on the right. */}
            <div className="mt-10 lg:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
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
                      {page.featuredStatBody}
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
                      href="/contact"
                      className="inline-flex w-fit items-center rounded-round border border-primary-500 bg-transparent px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-primary-500/5"
                    >
                      Partner With BPI
                    </CtaLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {supporting.length > 0 ? (
          <div
            data-reveal-stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
          >
            {supporting.slice(0, 3).map((initiative, idx, arr) => (
              <SupportingInitiativeCard
                key={initiative._id}
                initiative={initiative}
                watermark={idx === arr.length - 1}
              />
            ))}
          </div>
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
      <p className="text-sm text-primary-500/65 leading-relaxed">{children}</p>
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
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm transition-transform duration-300 ease-(--ease-premium) group-hover/media:scale-105">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
            className="ml-0.5 size-6 text-primary-500"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
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
  watermark,
}: {
  initiative: Initiative;
  watermark: boolean;
}) {
  // Same href rules as the home page: externalLink wins; otherwise an
  // internal slug page when the detail toggle hasn't been turned off.
  const href = initiative.externalLink
    ? initiative.externalLink
    : initiative.hasDetailPage === false
      ? undefined
      : `/initiatives/${initiative.slug}`;
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
}: {
  page: InitiativesPage | null;
  posts: InitiativePost[];
}) {
  // Editor can hide the whole section via the `showMotionStories`
  // toggle. Defaults to true so existing pages keep rendering.
  if (page && page.showMotionStories === false) return null;
  if (posts.length === 0) return null;
  const heading = page?.motionStoriesHeading ?? "Motion Stories";
  const bg = page?.motionStoriesBg ?? "#CFE9FF";
  const viewAllHref = page?.motionStoriesViewAllHref ?? "/news";

  return (
    <section className="px-5 md:px-20 lg:px-32 pb-14 md:pb-20 lg:pb-24">
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
              href={viewAllHref}
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

        <div
          data-reveal-stagger
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-fr"
        >
          {posts.map((post, idx) => {
            // First tile always renders as full-bleed `large`, regardless
            // of the per-post setting — matches the Motion Stories design.
            // Other tiles follow `initiativeTileSize` from Sanity.
            const isLarge = idx === 0 || post.initiativeTileSize === "large";
            return isLarge ? (
              <LargeStoryTile key={post._id} post={post} />
            ) : (
              <CompactStoryTile key={post._id} post={post} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function postHref(post: InitiativePost): string {
  return post.externalLink ?? `/blog/${post.slug}`;
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

function LargeStoryTile({ post }: { post: InitiativePost }) {
  const img = postImage(post, 1200);
  return (
    <CtaLink
      href={postHref(post)}
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

function CompactStoryTile({ post }: { post: InitiativePost }) {
  const img = postImage(post, 600);
  const bg = post.initiativeTileAccent ? "#38FE9C" : "#FFFFFF";
  return (
    <CtaLink
      href={postHref(post)}
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

function OtherWorksSection({ page }: { page: InitiativesPage | null }) {
  // Editor can hide the whole section via the `showOtherWorks` toggle.
  // Defaults to true so existing pages keep rendering.
  if (page && page.showOtherWorks === false) return null;
  const eyebrow = page?.otherWorksEyebrow ?? "Barbados Pharmaceuticals Inc.";
  const heading =
    page?.otherWorksHeading ?? "Other Initiatives You Should Know at BPI";
  const cards = page?.otherWorksInitiatives ?? [];
  const featuredImg = resolveImage(page?.otherWorksFeaturedImage, {
    width: 1600,
  });
  const featuredTitle = page?.otherWorksFeaturedTitle ?? undefined;
  const featuredHref = page?.otherWorksFeaturedHref ?? undefined;
  const viewMoreHref = page?.otherWorksViewAllHref ?? "/initiatives";

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
      className="bg-error-950 px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20 lg:py-28"
    >
      <div className="mx-auto grid max-w-page grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-14">
        {/* Left — eyebrow + staggered, two-tone heading. Sticks while the
            right-hand grid scrolls past (like the blog sidebar). */}
        <div
          data-reveal-stagger
          className="lg:col-span-1 lg:pt-4 lg:sticky lg:top-24 lg:self-start"
        >
          <div className="text-sm text-white/55">{eyebrow}</div>
          <h2 className="mt-6 font-display text-[clamp(2rem,3.2vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em]">
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
          </h2>
        </div>

        {/* Right — mint card masonry + featured tile + View More. */}
        <div
          data-reveal-stagger
          className="lg:col-span-2 flex flex-col gap-6 lg:gap-7"
        >
          {cards.length > 0 ? (
            <div className="columns-1 md:columns-2 gap-5 lg:gap-6">
              {cards.map((initiative, idx) => (
                <OtherWorkCard
                  key={initiative._id}
                  initiative={initiative}
                  // Every 5th card is the larger "feature" layout.
                  variant={(idx + 1) % 5 === 0 ? "feature" : "compact"}
                />
              ))}
            </div>
          ) : null}

          {featuredImg ? (
            <OtherWorksFeaturedTile
              src={featuredImg.src}
              alt={featuredImg.alt}
              title={featuredTitle}
              href={featuredHref}
            />
          ) : null}

          {viewMoreHref ? (
            <div className="flex justify-end">
              <CtaLink
                href={viewMoreHref}
                className="inline-flex w-fit items-center rounded-round border border-white/50 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-(--ease-premium) hover:border-white/80 hover:bg-white/10"
              >
                View More
              </CtaLink>
            </div>
          ) : null}
        </div>
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
  variant,
}: {
  initiative: Initiative;
  variant: "compact" | "feature";
}) {
  const href = initiative.externalLink
    ? initiative.externalLink
    : initiative.hasDetailPage === false
      ? undefined
      : `/initiatives/${initiative.slug}`;
  const img = resolveImage(initiative.coverImage, {
    width: variant === "feature" ? 1600 : 700,
  });
  const tag = initiative.tag ?? "Initiative";

  // Full-width dark media tile (spans all masonry columns).
  if (variant === "feature") {
    const featCls =
      "[column-span:all] mb-5 lg:mb-6 group/feat relative block overflow-hidden rounded-2xl lg:rounded-3xl aspect-video lg:aspect-2/1 bg-primary-500";
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

  // Compact mint card.
  const cls =
    "flex flex-col break-inside-avoid mb-5 lg:mb-6 rounded-2xl lg:rounded-3xl p-6 lg:p-7 min-h-96 lg:min-h-112";
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
    <section className="px-5 md:px-20 lg:px-32 pb-14 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-page">
        <div
          data-reveal-stagger
          className="flex flex-col gap-3 max-w-3xl mb-8 lg:mb-10"
        >
          <h2 className="font-display text-2xl md:text-3xl lg:text-display-sm font-bold text-primary-500 leading-[1.1] tracking-[-0.015em]">
            {heading}
          </h2>
          {body ? (
            <p className="text-sm md:text-base text-primary-500/75 leading-relaxed max-w-2xl">
              {body}
            </p>
          ) : null}
        </div>

        <div
          data-reveal-stagger
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5"
        >
          {stats.map((stat, idx) => (
            <FutureStatCard key={idx} stat={stat} bg={statBg} />
          ))}
        </div>
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

