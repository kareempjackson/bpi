import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import ArrowCircle from "../../components/ArrowCircle";
import Button from "../../components/Button";
import CtaLink from "../../components/CtaLink";
import Logo from "../../components/Logo";
import IncentivesShape, {
  INCENTIVES_NOTCH,
} from "../../components/shapes/IncentivesShape";
import InitiativeLeftShape from "../../components/shapes/InitiativeLeftShape";
import InitiativeRightShape from "../../components/shapes/InitiativeRightShape";
import { client } from "../../../sanity/lib/client";
import { resolveImage } from "../../../sanity/lib/image";
import {
  INITIATIVES_PAGE_QUERY,
  INITIATIVE_POSTS_QUERY,
} from "../../../sanity/lib/queries";
import type {
  Cta,
  FutureStat,
  Initiative,
  InitiativePost,
  InitiativesPage,
} from "../../../sanity/lib/types";

export const revalidate = 60;

const FALLBACK_HERO_IMAGE = "/images/A6701225.jpg";
const FALLBACK_HERO_ALT = "Researcher working in a pharmaceutical laboratory";
const SPOTLIGHT_FALLBACK_IMAGE = "/images/cdc-_N7I1JyPYJw-unsplash.jpg";
const FALLBACK_WORKS_IMAGE =
  "/images/national-cancer-institute-2fyeLhUeYpg-unsplash.jpg";
const FALLBACK_STORY_IMAGE = "/images/cdc-_N7I1JyPYJw-unsplash.jpg";

async function getInitiativesPage(): Promise<InitiativesPage | null> {
  return client.fetch<InitiativesPage | null>(INITIATIVES_PAGE_QUERY);
}

async function getInitiativePosts(limit: number): Promise<InitiativePost[]> {
  if (limit <= 0) return [];
  const data = await client.fetch<InitiativePost[] | null>(
    INITIATIVE_POSTS_QUERY,
    { limit },
  );
  return data ?? [];
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getInitiativesPage();
  return {
    title: page?.seoTitle ?? "Initiatives — BPI",
    description:
      page?.seoDescription ??
      "The deliberate projects building the Caribbean's pharmaceutical gateway. Manufacturing, supply, regulation, and partnership.",
  };
}

export default async function InitiativesPage() {
  const page = await getInitiativesPage();
  const featured = page?.featuredInitiative ?? null;
  const posts = await getInitiativePosts(page?.motionStoriesShowCount ?? 6);

  return (
    <main className="bg-error-25">
      <HeroHeader page={page} />
      <WorkInMotion page={page} />
      <FeaturedSpotlight featured={featured} page={page} />
      <MotionStoriesSection page={page} posts={posts} />
      <OtherWorksSection page={page} />
      <BuildingFutureSection page={page} />
    </main>
  );
}

// ─────────────────────────────────────────────────────────── Hero ──

function HeroHeader({ page }: { page: InitiativesPage | null }) {
  const heroImage = resolveImage(page?.heroImage, { width: 1600 });
  const imageSrc = heroImage?.src ?? FALLBACK_HERO_IMAGE;
  const imageAlt = heroImage?.alt ?? FALLBACK_HERO_ALT;
  const headline = page?.heroHeadline ?? "Pushing from investment to impact.";
  const body =
    page?.heroBody ??
    "Each one a real investment, contributing to sector development across BPI's four strategic priorities.";
  const primary = page?.heroPrimaryCta ?? {
    label: "Partner With BPI",
    href: "/contact",
  };
  const secondary = page?.heroSecondaryCta ?? {
    label: "Our Ecosystem",
    href: "/#ecosystem",
  };

  return (
    <section className="px-5 md:px-20 lg:px-32 pt-6 md:pt-10 lg:pt-12 pb-14 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-page">
        <div className="relative">
          <div data-reveal="scale">
            <IncentivesShape
              size={1200}
              imageSrc={imageSrc}
              imageAlt={imageAlt}
              className="w-full h-auto"
            />
          </div>

          {/* Content card docked into the IncentivesShape notch at
              every breakpoint. Type, padding, and CTA sizing scale
              down aggressively at narrow widths so the copy fits the
              notch geometry instead of overflowing it. */}
          <div
            className="absolute"
            style={{
              left: `${INCENTIVES_NOTCH.leftPct}%`,
              top: `${INCENTIVES_NOTCH.topPct}%`,
              right: 0,
              bottom: 0,
            }}
          >
            <div
              data-reveal="fade"
              className="h-full flex flex-col justify-center pl-3 sm:pl-5 md:pl-7 lg:pl-10 xl:pl-12 pr-2 sm:pr-3 md:pr-4 lg:pr-6 py-2 sm:py-3 md:py-5 lg:py-7"
            >
              <h1
                className="hero-anim font-display text-[11px] sm:text-sm md:text-2xl lg:text-display-sm xl:text-display-md font-bold text-primary-500 leading-[1.08] tracking-[-0.015em]"
                style={{ "--anim-delay": "0s" } as CSSProperties}
              >
                {headline}
              </h1>
              {body ? (
                <p
                  className="hero-anim hidden md:block mt-2 md:mt-3 lg:mt-4 text-sm md:text-base lg:text-lg text-primary-500/70 leading-relaxed max-w-md"
                  style={{ "--anim-delay": "0.12s" } as CSSProperties}
                >
                  {body}
                </p>
              ) : null}
              <div
                className="hero-anim mt-1.5 sm:mt-2 md:mt-4 lg:mt-6 flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3"
                style={{ "--anim-delay": "0.24s" } as CSSProperties}
              >
                <CtaPrimary cta={primary} />
                <CtaTertiary cta={secondary} />
              </div>
            </div>
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
  const heading = page?.workInMotionHeading ?? "Work in Motion";
  const body =
    page?.workInMotionBody ??
    "BPI develops catalytic projects across pharmaceutical manufacturing, supply chain, regulatory development, and regional trade. Each project is structured from concept to bankability to execution, with the partnerships, financing, and government alignment to make it last.";
  const bg = page?.workInMotionBg ?? "#CAF1FF";
  const primary = page?.workInMotionPrimaryCta ?? {
    label: "Partner With BPI",
    href: "/contact",
  };
  const secondary = page?.workInMotionSecondaryCta ?? {
    label: "Our Ecosystem",
    href: "/#ecosystem",
  };

  return (
    <section className="px-5 md:px-20 lg:px-32 pb-14 md:pb-20 lg:pb-24">
      <div
        data-reveal-stagger
        className="mx-auto max-w-page rounded-2xl lg:rounded-[1.75rem] px-6 py-10 md:px-12 md:py-14 lg:px-16 lg:py-20"
        style={{ backgroundColor: bg }}
      >
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl md:text-3xl lg:text-display-sm font-bold text-primary-500 leading-[1.1] tracking-[-0.015em]">
            {heading}
          </h2>
          {body ? (
            <p className="mt-4 lg:mt-5 text-sm md:text-base lg:text-lg text-primary-500/75 leading-relaxed">
              {body}
            </p>
          ) : null}
          <div className="mt-6 lg:mt-8 flex flex-wrap items-center gap-2.5 md:gap-3">
            <CtaPrimary cta={primary} />
            <CtaTertiary cta={secondary} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────── Featured spotlight ──

// Background palette + watermark flag cycle through the supporting
// cards by index, so editors only need to pick which initiatives appear
// — the visual rhythm is handled here.
const SUPPORTING_CARD_PALETTE: Array<{ bg: string; watermark: boolean }> = [
  { bg: "#FFFFFF", watermark: false },
  { bg: "#CAF1FF", watermark: false },
  { bg: "#38FE9C", watermark: true },
];

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
  const imageSrc = coverImage?.src ?? SPOTLIGHT_FALLBACK_IMAGE;
  const imageAlt = coverImage?.alt ?? featured?.title ?? "";
  const detailHref = featured
    ? featured.externalLink ?? `/initiatives/${featured.slug}`
    : undefined;

  return (
    <section className="px-5 md:px-20 lg:px-32 pb-14 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-page flex flex-col gap-8 lg:gap-10">
        {featured ? (
          <>
            <div
              data-reveal-stagger
              className="flex flex-col gap-4 lg:gap-5 max-w-3xl"
            >
              <div className="text-xs lg:text-sm font-medium tracking-[0.18em] text-primary-500 uppercase">
                Featured
              </div>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-[1.1] tracking-[-0.01em]">
                {featured.title}
              </h2>
              {featured.excerpt ? (
                <p className="text-sm md:text-base text-primary-500/85 leading-relaxed max-w-2xl">
                  {featured.excerpt}
                </p>
              ) : null}
              <div className="mt-1 flex flex-wrap items-center gap-2.5 md:gap-3">
                {detailHref ? (
                  <CtaLink href={detailHref} className="inline-flex">
                    <Button variant="primary" size="sm">
                      Learn More
                    </Button>
                  </CtaLink>
                ) : null}
                <Link href="/contact" className="inline-flex">
                  <Button variant="tertiary" size="sm">
                    Partner With BPI
                  </Button>
                </Link>
              </div>
            </div>

            <div
              data-reveal="scale"
              className="relative aspect-video md:aspect-2/1 lg:aspect-16/7 rounded-2xl lg:rounded-3xl overflow-hidden bg-primary-500"
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover"
              />
            </div>
          </>
        ) : null}

        {supporting.length > 0 ? (
          <div
            data-reveal-stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
          >
            {supporting.slice(0, 3).map((initiative, idx) => {
              const palette =
                SUPPORTING_CARD_PALETTE[idx] ??
                SUPPORTING_CARD_PALETTE[SUPPORTING_CARD_PALETTE.length - 1];
              return (
                <SupportingInitiativeCard
                  key={initiative._id}
                  initiative={initiative}
                  bg={palette.bg}
                  watermark={palette.watermark}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SupportingInitiativeCard({
  initiative,
  bg,
  watermark,
}: {
  initiative: Initiative;
  bg: string;
  watermark: boolean;
}) {
  const href = initiative.externalLink ?? `/initiatives/${initiative.slug}`;
  const eyebrow = initiative.subtitle ?? "Initiative";
  return (
    <CtaLink
      href={href}
      className="relative overflow-hidden flex flex-col justify-between rounded-2xl lg:rounded-3xl px-5 md:px-6 lg:px-7 py-6 md:py-7 lg:py-8 min-h-65 md:min-h-75 lg:min-h-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
      style={{ backgroundColor: bg }}
    >
      {watermark ? (
        <Logo
          iconOnly
          size={260}
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -right-12 lg:-bottom-16 lg:-right-16 text-primary-500 opacity-[0.08]"
        />
      ) : null}

      <div className="relative flex flex-col gap-3">
        <div className="text-xs font-medium tracking-[0.04em] text-primary-500/70">
          {eyebrow}
        </div>
        <h3 className="font-display text-lg md:text-xl lg:text-2xl font-bold text-primary-500 leading-tight tracking-[-0.01em]">
          {initiative.title}
        </h3>
      </div>
      {initiative.excerpt ? (
        <p className="relative mt-6 text-sm lg:text-base text-primary-500/85 leading-relaxed">
          {initiative.excerpt}
        </p>
      ) : null}
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
              <span className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/viewall:-translate-x-0.5 motion-reduce:transform-none">
                View all
              </span>
              <ArrowCircle
                size={44}
                className="text-primary-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/viewall:translate-x-1 group-hover/viewall:rotate-[8deg] motion-reduce:transform-none"
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
    src: img?.src ?? FALLBACK_STORY_IMAGE,
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
      <Image
        src={img.src}
        alt={img.alt}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
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
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(min-width: 1024px) 24vw, (min-width: 768px) 48vw, 100vw"
          className="object-cover"
        />
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
  const eyebrow = page?.otherWorksEyebrow ?? "Initiatives";
  const heading = page?.otherWorksHeading ?? "Other Works";
  const body =
    page?.otherWorksBody ??
    "Our mission is to create a pharmaceutical ecosystem where every person in the Caribbean has access to healthy, innovative, and affordable medicines while building regional manufacturing excellence.";
  const blueTitle =
    page?.otherWorksBlueTitle ?? "Human Capital Development";
  const blueBody =
    page?.otherWorksBlueBody ??
    "Building world-class pharmaceutical talent through education, training, and skills development programs";
  const blueCta = page?.otherWorksBlueCta ?? {
    label: "Learn More",
    href: "/initiatives/human-capital",
  };
  const blueBg = page?.otherWorksBlueBg ?? "#CFE9FF";
  const greenTitle =
    page?.otherWorksGreenTitle ?? "Human Capital Development";
  const greenBody =
    page?.otherWorksGreenBody ??
    "Building world-class pharmaceutical talent through education, training, and skills development programs";
  const greenBg = page?.otherWorksGreenBg ?? "#A5F9D2";
  const topRight = (page?.otherWorksTopRightImages ?? [])
    .map((img) => resolveImage(img, { width: 800 }))
    .filter((img): img is { src: string; alt: string } => !!img);
  const bottomLeft = resolveImage(page?.otherWorksBottomLeftImage, {
    width: 1200,
  });

  const topRightSrcs =
    topRight.length > 0
      ? topRight
      : [
          { src: FALLBACK_WORKS_IMAGE, alt: "BPI researchers at work" },
          { src: SPOTLIGHT_FALLBACK_IMAGE, alt: "BPI researchers at work" },
        ];
  const bottomLeftSrc = bottomLeft?.src ?? FALLBACK_WORKS_IMAGE;
  const bottomLeftAlt = bottomLeft?.alt ?? "BPI researcher working in the lab";

  return (
    <section className="px-5 md:px-20 lg:px-32 pb-14 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-page">
        <div
          data-reveal-stagger
          className="flex flex-col gap-3 max-w-3xl mb-8 lg:mb-10"
        >
          <div className="text-xs lg:text-sm font-medium tracking-[0.04em] text-primary-500/70">
            {eyebrow}
          </div>
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
          className="relative w-full aspect-1086/615"
        >
          <InitiativeLeftShape
            size={645}
            fill={blueBg}
            className="absolute top-0 left-0 w-[59.4%] h-auto"
          />
          <InitiativeRightShape
            size={645}
            fill={greenBg}
            className="absolute top-0 right-0 w-[59.4%] h-auto translate-x-[2%]"
          />

          <div className="absolute top-0 left-0 w-[40.6%] h-[51.6%] flex flex-col justify-center pl-4 pr-3 md:pl-7 md:pr-4 lg:pl-10 lg:pr-5">
            <h3 className="font-display text-sm md:text-xl lg:text-2xl font-bold text-primary-500 leading-[1.15] tracking-[-0.01em]">
              {blueTitle}
            </h3>
            <p className="mt-1.5 md:mt-2 lg:mt-3 text-[10px] md:text-xs lg:text-sm text-primary-500/80 leading-relaxed">
              {blueBody}
            </p>
            {blueCta ? (
              <div className="mt-2.5 md:mt-3.5 lg:mt-5">
                <CtaLink href={blueCta.href} className="inline-flex">
                  <Button variant="primary" size="sm">
                    {blueCta.label}
                  </Button>
                </CtaLink>
              </div>
            ) : null}
          </div>

          <div className="absolute top-0 right-0 w-[59.4%] h-[48%] grid grid-cols-2 items-center gap-2 md:gap-3 lg:gap-4 px-4 md:px-7 lg:px-10 translate-x-[2%]">
            {topRightSrcs.slice(0, 2).map((img, i) => (
              <div
                key={img.src + i}
                className="relative aspect-4/3 rounded-lg lg:rounded-xl overflow-hidden"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 768px) 24vw, 40vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 w-[59.4%] h-[48.4%] p-2 md:p-3 lg:p-4">
            <div className="relative w-full h-full rounded-lg lg:rounded-xl overflow-hidden">
              <Image
                src={bottomLeftSrc}
                alt={bottomLeftAlt}
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="absolute bottom-0 right-0 w-[40.6%] h-[48.4%] flex flex-col justify-center pl-4 pr-3 md:pl-7 md:pr-4 lg:pl-10 lg:pr-5 translate-x-[2%]">
            <h3 className="font-display text-sm md:text-xl lg:text-2xl font-bold text-primary-500 leading-[1.15] tracking-[-0.01em]">
              {greenTitle}
            </h3>
            <p className="mt-1.5 md:mt-2 lg:mt-3 text-[10px] md:text-xs lg:text-sm text-primary-500/80 leading-relaxed">
              {greenBody}
            </p>
          </div>
        </div>
      </div>
    </section>
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

// ─────────────────────────────────────────────────────────── Utils ──

function CtaPrimary({ cta }: { cta: Cta }) {
  if (!cta) return null;
  return (
    <CtaLink href={cta.href} className="inline-flex">
      <Button variant="primary" size="sm">
        {cta.label}
      </Button>
    </CtaLink>
  );
}

function CtaTertiary({ cta }: { cta: Cta }) {
  if (!cta) return null;
  return (
    <CtaLink href={cta.href} className="inline-flex">
      <Button variant="tertiary" size="sm">
        {cta.label}
      </Button>
    </CtaLink>
  );
}
