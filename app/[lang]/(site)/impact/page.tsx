import type { Metadata } from "next";

import BlogSection, { type BlogSectionPost } from "@/app/components/BlogSection";
import BuildingSection from "@/app/components/BuildingSection";
import CareersSection from "@/app/components/CareersSection";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import ImpactVoices, { type ImpactVoice } from "@/app/components/ImpactVoices";
import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import SocialIcon from "@/app/components/SocialIcon";
import TrajectoryShowcase from "@/app/components/TrajectoryShowcase";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMedia } from "@/sanity/lib/image";
import {
  HOME_PAGE_QUERY,
  IMPACT_PAGE_QUERY,
  LATEST_POSTS_QUERY,
} from "@/sanity/lib/queries";
import type {
  BlogPost,
  HomePage,
  ImpactPage,
  ResolvedMedia,
  SanityImage,
  SocialLink,
} from "@/sanity/lib/types";

export const revalidate = 3600;

// Fallback copy — used only until the impactPage singleton is populated. Once an
// editor fills the fields in Studio → Impact page, the CMS values take over.
const IMPACT_BODY =
  "There is a woman at a polyclinic pharmacy right now, waiting for the metformin that keeps her diabetes manageable and the amlodipine that keeps her blood pressure from killing her. She does not know that every tablet was made thousands of miles away, shipped across an ocean, and could be stopped at any border, at any time.";

const WHY_BODY =
  "Hypertension and diabetes are the largest share of the Barbados Drug Service's prescription mix. She is not a statistic. She is the entire point of what BPI is building.\n\n97% of Caribbean medicines are imported. One conflict. One shipping disruption. One policy shift, and patients go without.";
const WHY_QUOTE =
  "We know what it was to have put in orders and paid, and then to be told that the equipment and the ventilators would no longer be delivered because there were export prohibitions under the laws of other countries…";
const WHY_ATTRIBUTION_NAME = "Prime Minister Mia Mottley";
const WHY_ATTRIBUTION_DATE = "November 2023";

type TrajectoryBlock = {
  heading?: string | null;
  body?: string | null;
  highlight?: boolean | null;
};

const TRAJECTORY_BLOCKS: TrajectoryBlock[] = [
  {
    heading: "What Dependency Looks Like in Practice",
    body: "Today, no facility with this capacity exists in Barbados, and local manufacturers must send products overseas for testing, a gap in the region's pharmaceutical infrastructure that adds cost, time, and risk to every product that reaches a patient.",
    highlight: false,
  },
  {
    heading: "What's Already Changing",
    body: "On April 16, 2026, Queen Elizabeth Hospital received a donation of 2,553 cartons of IV fluids, manufactured in Nigeria by AMA Medical Manufacturing. It was BPI's first tangible delivery, and the first shipment along the AU–Caribbean pharmaceutical trade route. The long-term goal: a facility in Barbados producing 12 million IV bags a year, for domestic supply and export across CARICOM and the Global South.",
    highlight: true,
  },
  {
    heading: "The Path Forward",
    body: "By 2035, Barbados will be the trusted pharmaceutical manufacturing gateway for the Caribbean and the Global South: producing medicines here, distributing them regionally, and building the institutions that make it permanent, fostering deeper South–South cooperation and increasing access to essential medicines at affordable prices.",
    highlight: false,
  },
];

const DEFAULT_SOCIALS: SocialLink[] = [
  { kind: "Website", href: "https://www.barbadospharmainc.org" },
  { kind: "LinkedIn", href: "#" },
  { kind: "X", href: "#" },
  { kind: "Instagram", href: "https://www.instagram.com/barbadospharmainc" },
];

function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}

function mediaVideoSrc(m: ResolvedMedia | null): string | undefined {
  return m?.kind === "video" ? m.src : undefined;
}

async function getImpactPage(lang: string): Promise<ImpactPage | null> {
  return loadQuery<ImpactPage | null>(IMPACT_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.impactPage],
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
  const data = await getImpactPage(lang);
  return {
    title: data?.seoTitle ?? "Impact — BPI",
    description:
      data?.seoDescription ??
      "Behind every prescription filled in the Caribbean is a supply chain that starts an ocean away. BPI is building the infrastructure of care to change that.",
  };
}

export default async function ImpactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [data, home, latestPosts] = await Promise.all([
    getImpactPage(lang),
    getHomePage(lang),
    loadQuery<BlogPost[] | null>(LATEST_POSTS_QUERY, {
      params: { lang, limit: 3 },
      tags: [TAG.post],
    }),
  ]);

  // Photography: the impactPage upload first, then a Home photo so nothing
  // renders bare before the real shots are uploaded.
  const media = resolveMedia(
    data?.heroImage ?? home?.whyImage ?? home?.leaderQuoteImage,
    { width: 1200 },
  );
  const portrait = resolveMedia(data?.whyPortrait ?? home?.leaderQuoteImage, {
    width: 240,
  });
  // Falls back to a Home photo so the slot renders for testing before an
  // editor uploads the real shot in Studio → Impact page → Why This Matters.
  const whyMedia = resolveMedia(
    data?.whyImage ?? home?.buildingImage ?? home?.architectureFeature,
    { width: 1000 },
  );
  const wideMedia = resolveMedia(
    data?.facilityImage ?? home?.buildingImage ?? home?.architectureFeature,
    { width: 2000 },
  );
  const socials =
    home?.leaderSocials && home.leaderSocials.length > 0
      ? home.leaderSocials
      : DEFAULT_SOCIALS;

  // Copy — CMS values with the launch copy as fallback.
  const heroHeading = data?.heroHeading ?? "Impact";
  const heroBody = data?.heroBody ?? IMPACT_BODY;
  const heroCtaLabel = data?.heroCta?.label ?? "Partner With BPI";
  const heroCtaHref = data?.heroCta?.href ?? "/contact";
  const whyEyebrow = data?.whyEyebrow ?? "What We Are Building";
  const whyHeadingLead = data?.whyHeadingLead ?? "Why This";
  const whyHeadingTrail = data?.whyHeadingTrail ?? "Matters";
  const whyBody = data?.whyBody ?? WHY_BODY;
  const whyQuote = data?.whyQuote ?? WHY_QUOTE;
  const whyName = data?.whyAttributionName ?? WHY_ATTRIBUTION_NAME;
  const whyDate = data?.whyAttributionDate ?? WHY_ATTRIBUTION_DATE;
  const trajectoryBlocks =
    data?.trajectoryBlocks && data.trajectoryBlocks.length > 0
      ? data.trajectoryBlocks
      : TRAJECTORY_BLOCKS;

  // Resolve each beat's media once, server-side. Beats with no upload fall
  // back to a Home photo so the showcase renders while content is added.
  const trajectoryFallback =
    resolveMedia(home?.buildingImage, { width: 1200 }) ??
    resolveMedia(home?.architectureFeature, { width: 1200 });
  const trajectoryShowcase = trajectoryBlocks.map((block) => ({
    heading: block.heading,
    body: block.body,
    highlight: block.highlight,
    media:
      resolveMedia((block as { media?: SanityImage | null }).media, {
        width: 1200,
      }) ?? trajectoryFallback,
  }));

  // Voices from the Ground. CMS quotes when present, otherwise placeholder
  // cards so the section renders while content is gathered. Portraits resolve
  // here so <ImpactVoices> stays presentational.
  const voicesEyebrow =
    data?.voicesEyebrow ?? "Barbados Pharmaceuticals Inc.";
  const voicesHeading = data?.voicesHeading ?? "Voices from";
  const voicesHeadingTail = data?.voicesHeadingTail ?? "the Ground";
  const voicesCta = data?.voicesCta ?? {
    label: "Partner With BPI",
    href: "/contact",
  };
  const voicePortraitFallback = resolveMedia(
    data?.whyPortrait ?? home?.leaderQuoteImage,
    { width: 200 },
  );
  const voicesSource =
    data?.voicesQuotes && data.voicesQuotes.length > 0
      ? data.voicesQuotes
      : Array.from({ length: 4 }, () => ({
          quote:
            "Your body keeps score even when your calendar is full. Invest in your health before you're forced to pay with your time.",
          title: "Title of person",
          name: "Name of person here",
          image: null,
          bg: null,
        }));
  const voices: ImpactVoice[] = voicesSource.map((q) => ({
    quote: q.quote,
    name: q.name,
    title: q.title,
    bg: q.bg,
    portrait: resolveMedia(q.image, { width: 200 }) ?? voicePortraitFallback,
  }));

  // Latest from BPI + the Careers/closing-CTA tail — reuse the Home document's
  // copy so the sections match the rest of the site.
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
  const careersMedia = resolveMedia(home?.careersImage, { width: 1200 });
  const buildingMedia = resolveMedia(home?.buildingImage, { width: 1600 });

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
              {/* Left — display heading, top-aligned with the image. */}
              <Stagger className="lg:col-span-3 lg:self-start">
                <StaggerItem
                  as="h1"
                  className="font-display text-[clamp(3.5rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-error-500"
                >
                  {heroHeading}
                </StaggerItem>
              </Stagger>

              {/* Center — the human at the heart of the supply chain. */}
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
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-linear-to-t from-error-950/40 via-transparent to-transparent"
                  />
                </Reveal>
              ) : (
                <Reveal
                  preset="scale"
                  aria-hidden
                  className="aspect-square w-full rounded-3xl bg-white/5 ring-1 ring-white/10 lg:col-span-5"
                />
              )}

              {/* Right — narrative + CTA. */}
              <Stagger
                className="flex flex-col gap-8 lg:col-span-4 lg:justify-end lg:pb-10"
              >
                <StaggerItem>
                  <PortableTextBody
                    value={heroBody}
                    className="max-w-lg"
                    // Header body type per design spec: Albert Sans (via
                    // --font-display) Light 300, 18px / 152% line-height, no
                    // tracking, pure white.
                    paragraphClassName="font-display text-[18px] font-light leading-[1.52] tracking-normal text-white"
                  />
                </StaggerItem>
                <StaggerItem>
                  <CtaLink
                    href={localizedHref(lang, heroCtaHref)}
                    className="group inline-flex w-fit items-center gap-2 rounded-round bg-error-500 pl-6 pr-5 py-3 text-sm font-semibold text-primary-500 transition-all duration-300 ease-(--ease-premium) hover:bg-error-400 hover:shadow-lg hover:shadow-error-500/20"
                  >
                    {heroCtaLabel}
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 transition-transform duration-300 ease-(--ease-premium) group-hover:translate-x-0.5"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </CtaLink>
                </StaggerItem>
              </Stagger>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters — narrative + attributed pull-quote on the light canvas. */}
      <section
        data-nav-theme="light"
        className="bg-error-25 px-6 md:px-10 lg:px-14 pt-20 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24"
      >
        <Stagger
          className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16"
        >
          {/* Left — eyebrow + display heading. */}
          <StaggerItem>
            <p className="text-sm font-medium tracking-[0.14em] text-primary-500/70">
              {whyEyebrow}
            </p>
            <h2 className="mt-4 font-display text-display-xs md:text-display-sm lg:text-display-md font-bold text-primary-500 leading-[1.1] tracking-[-0.02em]">
              {whyHeadingLead}
              {whyHeadingTrail ? (
                <>
                  <br />
                  <span className="inline-block pl-16 md:pl-24">
                    {whyHeadingTrail}
                  </span>
                </>
              ) : null}
            </h2>
          </StaggerItem>

          {/* Right — body, rule, quote, attribution. */}
          <StaggerItem className="flex flex-col">
            <PortableTextBody
              value={whyBody}
              paragraphClassName="text-base md:text-lg text-primary-500/85 leading-relaxed"
            />

            {whyQuote ? (
              <>
                <hr className="my-8 md:my-10 border-t border-primary-500/15" />
                <blockquote className="text-base md:text-lg italic text-primary-500/80 leading-relaxed">
                  &ldquo;
                  <PortableTextBody
                    value={whyQuote}
                    compact
                    className="inline"
                    paragraphClassName="inline"
                  />
                  &rdquo;
                </blockquote>
              </>
            ) : null}

            <div className="mt-8 flex items-center gap-5">
              {portrait ? (
                <div className="relative size-16 md:size-20 shrink-0 overflow-hidden rounded-full bg-primary-500/5">
                  <MediaImage
                    media={portrait}
                    sizes="80px"
                    objectPositionStyle="center top"
                  />
                </div>
              ) : null}
              <div>
                <p className="font-display text-base md:text-lg font-bold text-primary-500 leading-tight">
                  {whyName}
                </p>
                <p className="mt-1 text-sm md:text-base text-primary-500/55">
                  {whyDate}
                </p>
                <div className="mt-4 flex items-center gap-2.5">
                  {socials.map((s) => (
                    <a
                      key={s.kind}
                      href={s.href}
                      aria-label={s.label ?? s.kind}
                      className="inline-flex size-9 items-center justify-center rounded-full border border-dashed border-primary-500/40 text-primary-500/70 transition-colors hover:border-primary-500/75 hover:text-primary-500"
                    >
                      <SocialIcon kind={s.kind} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </StaggerItem>
        </Stagger>

        {/* Full-width section image beneath the narrative. */}
        {whyMedia ? (
          <Reveal
            preset="scale"
            className="relative mt-14 aspect-3/1 w-full overflow-hidden rounded-3xl bg-primary-500/5 md:mt-20 lg:mt-24"
          >
            <MediaImage media={whyMedia} sizes="100vw" />
          </Reveal>
        ) : null}
      </section>

      {/* Full-bleed facility image. */}
      {wideMedia ? (
        <section className="bg-error-25 px-6 md:px-10 lg:px-14 pb-20 md:pb-28 lg:pb-32">
          <Reveal
            preset="scale"
            className="relative aspect-2/1 w-full overflow-hidden rounded-3xl bg-primary-500/5"
          >
            <MediaImage
              media={wideMedia}
              sizes="(min-width: 1600px) 1440px, 100vw"
            />
          </Reveal>
        </section>
      ) : null}

      {/* From dependency to gateway — narrative beats beside a graphic of
          fragmented supply lines converging on a single point. */}
      <section
        data-nav-theme="light"
        className="bg-error-25 px-6 md:px-10 lg:px-14 pb-20 md:pb-28 lg:pb-32"
      >
        <TrajectoryShowcase blocks={trajectoryShowcase} />
      </section>

      {/* Voices from the Ground — testimonial cards on a dark canvas. */}
      <ImpactVoices
        eyebrow={voicesEyebrow}
        heading={voicesHeading}
        headingTail={voicesHeadingTail}
        quotes={voices}
        cta={
          voicesCta
            ? {
                label: voicesCta.label,
                href: localizedHref(lang, voicesCta.href),
              }
            : null
        }
      />

      {/* Latest from BPI — newest posts (hides itself when none). */}
      <BlogSection
        heading={home?.blogHeading ?? undefined}
        viewAllHref={localizedHref(lang, "/blog")}
        posts={blogPosts}
      />

      {/* Careers. */}
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

      {/* Closing call to action. */}
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
