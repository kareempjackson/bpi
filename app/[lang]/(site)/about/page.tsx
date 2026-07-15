import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";

import ArrowRight from "@/app/components/ArrowRight";
import Button from "@/app/components/Button";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import Logo from "@/app/components/Logo";
import LazyVideo from "@/app/components/LazyVideo";
import MediaImage from "@/app/components/MediaImage";
import PageSections from "@/app/components/PageSections";
import { Parallax, Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import LeaderShape from "@/app/components/shapes/LeaderShape";
import MissionShape from "@/app/components/shapes/MissionShape";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveImage, resolveMedia } from "@/sanity/lib/image";
import {
  ABOUT_PAGE_QUERY,
  LATEST_INITIATIVES_QUERY,
} from "@/sanity/lib/queries";
import type {
  AboutPage,
  Cta,
  Initiative as InitiativeDoc,
  Leader as LeaderData,
  MissionCard as MissionCardData,
  Pillar as PillarData,
  Stat as StatData,
} from "@/sanity/lib/types";
import CountUp from "./CountUp";
import InitiativesPanel, { type Initiative } from "./InitiativesPanel";
import LeaderLabel from "./LeaderLabel";
import MissionCarousel from "./MissionCarousel";

export const revalidate = 3600;

/**
 * Split a headline into its first sentence (rendered white) and the
 * remainder (rendered green) — the "We're not a traditional agency. / We're
 * a market creator." treatment. Falls back to all-white when there's no
 * sentence break.
 */
function splitHeadline(headline: string): { lead: string; rest: string } {
  const match = headline.match(/^([\s\S]*?[.!?])\s+([\s\S]*)$/);
  if (!match) return { lead: headline, rest: "" };
  return { lead: match[1], rest: match[2] };
}

async function getAboutPage(lang: string): Promise<AboutPage | null> {
  return loadQuery<AboutPage | null>(ABOUT_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.aboutPage],
  });
}

async function getLatestInitiatives(
  lang: string,
  limit: number,
): Promise<InitiativeDoc[]> {
  if (limit <= 0) return [];
  const data = await loadQuery<InitiativeDoc[] | null>(LATEST_INITIATIVES_QUERY, {
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
  const data = await getAboutPage(lang);
  return {
    title: data?.seoTitle ?? "About BPI | Barbados Pharmaceutical Inc.",
    description:
      data?.seoDescription ??
      "BPI is the institution advancing pharmaceutical manufacturing, investment, and essential medicines access across the Caribbean and beyond.",
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const data = await getAboutPage(lang);

  if (!data) {
    return <EmptyState />;
  }

  const initiatives = await getLatestInitiatives(
    lang,
    data.initiativesShowCount ?? 4,
  );

  const heroMedia = resolveMedia(data.heroImage, { width: 1600 });
  const { lead: heroLead, rest: heroRest } = splitHeadline(
    data.heroHeadline ?? "",
  );
  const bannerMedia = resolveMedia(data.bannerImage, { width: 2000 });

  const initiativesForPanel: Initiative[] = initiatives.flatMap(
    (item): Initiative[] => {
      const img = resolveImage(item.coverImage, { width: 600 });
      if (!img) return [];
      // Link rules mirror the rest of the site: externalLink wins; otherwise
      // an internal detail page unless the editor turned it off.
      const href = item.externalLink
        ? item.externalLink
        : item.hasDetailPage === false
          ? undefined
          : `/initiatives/${item.slug}`;
      const out: Initiative = {
        title: item.title,
        description: item.excerpt,
        imageSrc: img.src,
        imageAlt: img.alt,
      };
      if (item.subtitle) out.subtitle = item.subtitle;
      if (href) out.href = href;
      return [out];
    },
  );

  return (
    <main className="bg-error-25">
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        className="relative flex flex-col overflow-hidden bg-error-950 px-6 md:px-12 lg:px-20 xl:px-28 pt-14 md:pt-16 lg:pt-16 pb-12 md:pb-16 lg:pb-20 lg:min-h-[96dvh]"
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
        <GridHoverBackdrop />

        <div className="relative mx-auto grid w-full max-w-page flex-1 grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 min-h-0 items-stretch">
          {/* Left — description + CTA (top), two-tone headline (bottom). */}
          <div className="order-2 lg:order-1 flex flex-col min-h-0">
            <Stagger
              className="flex flex-col gap-6 max-w-md"
            >
              {data.heroSubheading ? (
                <StaggerItem as="p" className="text-base md:text-lg text-white/75 leading-relaxed">
                  {data.heroSubheading}
                </StaggerItem>
              ) : null}
              <StaggerItem>
                <CtaLink
                  href={data.heroCta?.href ?? "/contact"}
                  className="inline-flex w-fit items-center rounded-round bg-error-500 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-[var(--ease-premium)] hover:bg-error-400"
                >
                  {data.heroCta?.label ?? "Partner With BPI"}
                </CtaLink>
              </StaggerItem>
            </Stagger>

            <Stagger
              as="h1"
              className="mt-10 lg:mt-auto lg:pt-12 font-display text-[clamp(2.5rem,5.5vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] max-w-3xl"
            >
              <StaggerItem as="span" className="text-white">{heroLead}</StaggerItem>
              {heroRest ? (
                <>
                  {" "}
                  <StaggerItem as="span" className="text-error-500">{heroRest}</StaggerItem>
                </>
              ) : null}
            </Stagger>
          </div>

          {/* Right — tall portrait image. */}
          {heroMedia ? (
            <div className="order-1 lg:order-2 w-full min-h-0 lg:h-full">
              <Reveal
                preset="scale"
                className="relative w-full aspect-3/4 lg:aspect-auto lg:h-full overflow-hidden rounded-2xl bg-white/5"
              >
                <MediaImage
                  media={heroMedia}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  preload
                  eager
                />
              </Reveal>
            </div>
          ) : null}
        </div>
      </section>

      <section
        data-nav-theme="light"
        className="bg-error-25 px-6 md:px-12 lg:px-20 xl:px-28 pt-12 md:pt-16 lg:pt-20 pb-12 md:pb-16 lg:pb-24"
      >
        <div className="mx-auto max-w-page">
          <Stagger
            className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 md:gap-8 mb-10 md:mb-12 lg:mb-14"
          >
            <StaggerItem className="max-w-lg">
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.01em]">
                {data.visionHeading}
              </h2>
              <p className="mt-3 text-sm lg:text-base text-primary-500/70 leading-relaxed">
                {data.visionDescription}
              </p>
            </StaggerItem>
            <StaggerItem className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0 md:ml-auto">
              <CtaButton cta={data.visionPrimaryCta} variant="primary" />
              <CtaButton cta={data.visionSecondaryCta} variant="tertiary" />
            </StaggerItem>
          </Stagger>

          <Stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8 items-stretch"
          >
            {data.pillars?.map((pillar, idx) => (
              <StaggerItem key={pillar.eyebrow + idx}>
                <PillarCard pillar={pillar} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <DifferenceWeMakeSection data={data} />

      <section className="px-5 md:px-20 lg:px-32 pt-12 md:pt-12 lg:pt-16 pb-12 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-page">
          <Stagger className="max-w-2xl mb-8 lg:mb-8">
            <StaggerItem as="h2" className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
              {data.missionHeading}
            </StaggerItem>
            <StaggerItem as="p" className="mt-3 text-sm lg:text-base text-primary-500/75 leading-relaxed">
              {data.missionDescription}
            </StaggerItem>
          </Stagger>

          <Reveal preset="fade">
            <MissionCarousel>
              {data.missionCards?.map((card, idx) => (
                <MissionCardItem
                  key={(card.href ?? card.title) + idx}
                  card={card}
                />
              ))}
            </MissionCarousel>
          </Reveal>
        </div>
      </section>

      {/* Full-width video/media banner — sits directly above the numbers. */}
      {bannerMedia ? (
        <section className="px-5 md:px-20 lg:px-32 pt-8 lg:pt-10 pb-8 lg:pb-10">
          <div className="mx-auto max-w-page">
            <Reveal
              preset="scale"
              className="relative aspect-3/1 md:aspect-2/1 rounded-lg overflow-hidden"
            >
              <Parallax
                speed={0.06}
                className="absolute inset-x-0 top-[-12%] bottom-[-12%]"
              >
                <MediaImage media={bannerMedia} sizes="100vw" eager />
              </Parallax>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="px-5 md:px-20 lg:px-32 pt-12 md:pt-12 lg:pt-16 pb-12 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-page">
          <Stagger className="max-w-3xl mb-8 lg:mb-8">
            <StaggerItem as="h2" className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
              {data.statsHeading}
            </StaggerItem>
            <StaggerItem as="p" className="mt-3 text-sm lg:text-base text-primary-500/75 leading-relaxed">
              {data.statsDescription}
            </StaggerItem>
          </Stagger>

          <Stagger
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-3 lg:gap-4"
          >
            {data.stats?.map((stat, idx) => (
              <StaggerItem key={stat.value + idx}>
                <StatCard stat={stat} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="pt-12 md:pt-10 lg:pt-14 pb-14 md:pb-14 lg:pb-20">
        <Stagger
          className="bg-[#13362A] px-5 py-12 md:px-8 md:py-16 lg:px-12 lg:py-24"
        >
          <StaggerItem className="mb-8 lg:mb-8">
            <p className="text-[10px] lg:text-xs font-bold tracking-[0.14em] text-white/60 uppercase">
              {data.initiativesEyebrow}
            </p>
            <h2 className="mt-2 font-display text-display-xs lg:text-display-sm font-semibold text-white leading-[1.1] tracking-tight">
              {data.initiativesHeading}
            </h2>
          </StaggerItem>

          <StaggerItem>
            <InitiativesPanel initiatives={initiativesForPanel} />
          </StaggerItem>
        </Stagger>
      </section>

      <section className="px-5 md:px-20 lg:px-32 pt-12 md:pt-10 lg:pt-14 pb-14 md:pb-14 lg:pb-20">
        <Stagger className="mx-auto max-w-page">
          <StaggerItem className="max-w-md mb-8 lg:mb-10">
            <h2 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
              {data.leadershipHeading}
            </h2>
            <p className="mt-3 text-sm lg:text-base text-primary-500/75 leading-relaxed">
              {data.leadershipDescription}
            </p>
          </StaggerItem>

          <StaggerItem>
            <Stagger
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-3 lg:gap-4"
            >
              {data.leaders?.map((leader, idx) => (
                <StaggerItem key={leader.name + leader.role + idx}>
                  <LeaderCard
                    leader={leader}
                    index={idx}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </StaggerItem>
        </Stagger>
      </section>

      <PageSections sections={data.pageSections} />
    </main>
  );
}

function CtaButton({
  cta,
  variant,
}: {
  cta: Cta;
  variant: "primary" | "tertiary";
}) {
  if (!cta) return null;
  return (
    <CtaLink href={cta.href} className="inline-flex">
      <Button variant={variant} size="sm">
        {cta.label}
      </Button>
    </CtaLink>
  );
}

// Turn a single-line heading into a two-step staircase by dropping the last
// two words onto a second line (e.g. "The Difference We Make" →
// ["The Difference", "We Make"]). Headings of two words or fewer stay on one
// line. Used only when the stored heading has no explicit line break.
function staircaseFromFlat(heading: string): string[] {
  const words = heading.trim().split(/\s+/);
  if (words.length <= 2) return [heading];
  return [
    words.slice(0, -2).join(" "),
    words.slice(-2).join(" "),
  ];
}

// Split the trailing sentence off a paragraph: `lead` is everything up to and
// including the final sentence-ending period, `trailing` is the last sentence.
// Falls back to the whole text as `lead` when there's no internal break.
function splitTrailingSentence(text: string): { lead: string; trailing: string } {
  const trimmed = text.trim();
  const idx = trimmed.lastIndexOf(". ");
  if (idx === -1) return { lead: trimmed, trailing: "" };
  return {
    lead: trimmed.slice(0, idx + 1).trim(),
    trailing: trimmed.slice(idx + 2).trim(),
  };
}

// "The Difference We Make" — a simple, image-free two-column statement that
// sits between the Vision / Pillars block and the Mission carousel on the
// About page. Eyebrow + heading on the left, body copy (with an optional
// tagline below a divider) on the right. All editable from Studio.
function DifferenceWeMakeSection({ data }: { data: AboutPage }) {
  const eyebrow = data.differenceEyebrow ?? "What We Are Building";
  const heading = data.differenceHeading ?? "The Difference\nWe Make";
  const rawBody = data.differenceBody ?? "";
  const rawTagline = data.differenceTagline ?? "";

  // Hide the section entirely if there's no content to render yet — keeps
  // the page graceful when the document hasn't been populated.
  if (!rawBody && !rawTagline) return null;

  // The heading is laid out as a staircase: the first line hugs the left
  // edge, every line after it is pushed to the right. Authors set the break
  // points with newlines in Studio; if the stored value has none, we drop
  // the last two words to the second line so older flat content still reads
  // as a staircase (e.g. "The Difference" / "We Make").
  const headingLines = heading.includes("\n")
    ? heading.split("\n")
    : staircaseFromFlat(heading);

  // Body / tagline. When no explicit tagline is authored, peel the final
  // sentence off the body so it renders as the smaller line below the
  // divider — matching the design without requiring a content edit.
  let body = rawBody;
  let tagline = rawTagline;
  if (!tagline && body) {
    const split = splitTrailingSentence(body);
    body = split.lead;
    tagline = split.trailing;
  }

  return (
    <section className="my-12 md:my-16 lg:my-24 px-5 md:px-20 lg:px-32 pt-12 md:pt-12 lg:pt-16 pb-12 md:pb-12 lg:pb-16">
      <div className="mx-auto max-w-page grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-start">
        <Stagger className="max-w-sm">
          {eyebrow ? (
            <StaggerItem as="p" className="text-[10px] lg:text-xs font-bold tracking-[0.14em] text-primary-500/70 uppercase">
              {eyebrow}
            </StaggerItem>
          ) : null}
          <StaggerItem as="h2" className="mt-3 font-display text-display-md lg:text-display-lg font-extrabold text-primary-500 leading-[1.05] tracking-tight">
            {headingLines.map((line, i) => (
              <span
                key={i}
                className={`block ${i === 0 ? "text-left" : "text-right pr-16 lg:pr-28 mt-2 lg:mt-3"}`}
              >
                {line}
              </span>
            ))}
          </StaggerItem>
        </Stagger>

        <Stagger>
          {body ? (
            <StaggerItem as="p" className="text-sm md:text-base lg:text-lg text-primary-500/85 leading-relaxed whitespace-pre-line">
              {body}
            </StaggerItem>
          ) : null}
          {tagline ? (
            <StaggerItem as="p" className="mt-6 lg:mt-8 pt-5 lg:pt-6 border-t border-primary-500/15 text-sm lg:text-base text-primary-500/70 leading-relaxed whitespace-pre-line">
              {tagline}
            </StaggerItem>
          ) : null}
        </Stagger>
      </div>
    </section>
  );
}

function LeaderCard({
  leader,
  index,
}: {
  leader: LeaderData;
  index: number;
}) {
  const cardNumber = index + 1;
  const isEven = cardNumber % 2 === 0;
  const variant: "br" | "tl" =
    cardNumber === 2 || cardNumber === 4 ? "br" : "tl";

  const media = resolveMedia(leader.image, { width: 600 });
  if (!media) return null;
  const posterSrc = media.kind === "image" ? media.src : media.poster;
  const videoSrc = media.kind === "video" ? media.src : undefined;

  if (isEven) {
    const labelClass =
      variant === "br"
        ? "left-[2.7%] bottom-[14%] right-[45.6%] px-3 lg:px-4"
        : "left-[2.7%] right-[2.7%] bottom-[14%] px-3 lg:px-4";
    return (
      <div className="group relative w-full aspect-372/444">
        <LeaderShape
          variant={variant}
          imageSrc={posterSrc}
          videoSrc={videoSrc}
          imageAlt={media.alt}
          darkBottom
          className="absolute inset-0 w-full h-full filter-[contrast(1.06)_saturate(0.92)_brightness(0.96)] transition-[filter] duration-700 ease-[var(--ease-premium)] group-hover:filter-[contrast(1.08)_saturate(0.95)_brightness(1)]"
          imageClassName="transition-transform duration-1000 ease-[var(--ease-premium)] group-hover:scale-[1.04] motion-reduce:transform-none"
        />
        <LeaderLabel
          name={leader.name}
          role={leader.role}
          bio={leader.bio}
          linkedin={leader.linkedin}
          imageSrc={posterSrc ?? ""}
          imageAlt={media.alt}
          className={labelClass}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-372/444">
      <div
        className="group absolute rounded-2xl overflow-hidden isolate transform-gpu bg-primary-500/5"
        style={{
          left: `${(10 / 372) * 100}%`,
          right: `${(10 / 372) * 100}%`,
          top: 0,
          bottom: `${(20 / 444) * 100}%`,
        }}
      >
        {videoSrc ? (
          <LazyVideo
            src={videoSrc}
            poster={posterSrc}
            ariaLabel={media.alt || undefined}
            className="absolute inset-0 w-full h-full object-cover filter-[contrast(1.06)_saturate(0.92)_brightness(0.96)] transition-[transform,filter] duration-1000 ease-[var(--ease-premium)] group-hover:scale-[1.04] group-hover:filter-[contrast(1.08)_saturate(0.95)_brightness(1)] motion-reduce:transform-none"
          />
        ) : (
          <Image
            src={posterSrc ?? ""}
            alt={media.alt}
            fill
            sizes="(min-width: 768px) 30vw, 45vw"
            className="object-cover filter-[contrast(1.06)_saturate(0.92)_brightness(0.96)] transition-[transform,filter] duration-1000 ease-[var(--ease-premium)] group-hover:scale-[1.04] group-hover:filter-[contrast(1.08)_saturate(0.95)_brightness(1)] motion-reduce:transform-none"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/95 via-black/65 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[var(--ease-premium)]" />
        <LeaderLabel
          name={leader.name}
          role={leader.role}
          bio={leader.bio}
          linkedin={leader.linkedin}
          imageSrc={posterSrc ?? ""}
          imageAlt={media.alt}
          className="inset-x-0 bottom-0 px-4 lg:px-5 pb-7 md:pb-8 lg:pb-10"
        />
      </div>
    </div>
  );
}

function LeadershipContactCard({
  heading,
  description,
  primaryCta,
  secondaryCta,
}: {
  heading: string;
  description: string;
  primaryCta: Cta;
  secondaryCta: Cta;
}) {
  return (
    <div className="rounded-2xl bg-transparent flex flex-col justify-end h-full aspect-372/444 p-4 lg:p-5 gap-4">
      <h3 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
        {heading}
      </h3>
      <p className="text-sm lg:text-base text-primary-500/75 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <CtaButton cta={primaryCta} variant="primary" />
        <CtaButton cta={secondaryCta} variant="tertiary" />
      </div>
    </div>
  );
}

function MissionCardItem({ card }: { card: MissionCardData }) {
  const media = resolveMedia(card.image, { width: 800 });
  const img = media
    ? { src: media.kind === "image" ? media.src : media.poster ?? "", alt: media.alt }
    : null;
  const videoSrc = media?.kind === "video" ? media.src : undefined;
  return (
    <div
      className="rounded-lg px-5 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 flex items-stretch gap-5 md:gap-8 lg:gap-12 w-[80vw] md:w-[62vw] lg:w-[54vw] xl:w-[48vw] shrink-0 min-h-64 md:min-h-80 lg:min-h-96"
      style={{ backgroundColor: card.bg ?? "#CAF1FF" }}
    >
      <div className="flex flex-col justify-between gap-4 md:gap-5 flex-1 min-w-0">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex items-center gap-2 text-primary-500">
            <Logo
              iconOnly
              size={28}
              className="text-primary-500 w-5 md:w-6 lg:w-7 h-auto shrink-0"
            />
            {card.eyebrow ? (
              <span className="text-sm md:text-base lg:text-lg font-semibold text-primary-500 leading-none">
                {card.eyebrow}
              </span>
            ) : null}
          </div>
          <h3 className="font-display text-xl md:text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.15] tracking-tight">
            {card.title}
          </h3>
          <p className="text-sm md:text-base lg:text-lg text-primary-500/75 leading-relaxed max-w-md">
            {card.description}
          </p>
        </div>
        {card.href ? (
          <CtaLink
            href={card.href}
            className="inline-flex items-center gap-2 text-sm md:text-base font-semibold text-primary-500 hover:opacity-70 transition-opacity"
          >
            Learn more
            <ArrowRight />
          </CtaLink>
        ) : null}
      </div>

      {img ? (
        <Reveal
          preset="scale"
          className="shrink-0 self-stretch flex items-center"
        >
          <MissionShape
            size={420}
            imageSrc={img.src}
            videoSrc={videoSrc}
            imageAlt={img.alt}
            className="w-auto h-auto max-h-64 md:max-h-80 lg:max-h-96"
          />
        </Reveal>
      ) : null}
    </div>
  );
}

function StatCard({ stat }: { stat: StatData }) {
  return (
    <div className="rounded-lg p-4 md:p-5 lg:p-6 bg-error-100 flex flex-col justify-between min-h-36 md:min-h-52 lg:min-h-64 gap-5 md:gap-8 lg:gap-10">
      <CountUp
        value={stat.value}
        className="font-display text-display-xs md:text-display-sm lg:text-display-md font-semibold text-primary-500 leading-none tracking-tight"
      />
      <p className="text-xs md:text-sm text-primary-500/75 leading-relaxed">
        {stat.description}
      </p>
    </div>
  );
}

function PillarCard({ pillar }: { pillar: PillarData }) {
  // Card renders even when no image is uploaded — text-only is a valid
  // state. Only the media block is conditional, never the whole card.
  const media = resolveMedia(pillar.image, { width: 800 });
  const posterSrc =
    media?.kind === "image" ? media.src : media?.poster ?? "";
  const videoSrc = media?.kind === "video" ? media.src : undefined;
  const hasMedia = !!media;

  const mediaBlock = hasMedia ? (
    <Reveal
      preset="scale"
      className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/10"
    >
      {videoSrc ? (
        <LazyVideo
          src={videoSrc}
          poster={posterSrc}
          ariaLabel={media!.alt || undefined}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <Image
          src={posterSrc}
          alt={media!.alt}
          fill
          sizes="(min-width: 768px) 30vw, 90vw"
          className="object-cover"
        />
      )}
    </Reveal>
  ) : null;

  // Highlighted card — dark green, image on top, copy beneath. Slightly
  // taller than its neighbours for emphasis.
  if (pillar.highlight) {
    return (
      <div
        className="rounded-2xl overflow-hidden flex flex-col h-full min-h-120 md:min-h-136 lg:min-h-152 p-5 md:p-6 lg:p-7"
        style={{ backgroundColor: pillar.bg ?? "#042D2B" }}
      >
        {mediaBlock}
        <div className="mt-auto pt-10 md:pt-12 lg:pt-14 flex flex-col gap-3">
          <h3 className="font-display text-lg lg:text-xl font-bold tracking-[0.02em] text-white uppercase leading-snug">
            {pillar.eyebrow}
          </h3>
          <p className="whitespace-pre-line text-sm lg:text-base text-white/70 leading-relaxed">
            {pillar.description}
          </p>
        </div>
      </div>
    );
  }

  // Standard card — white, heading + copy on top, image beneath.
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col h-full min-h-120 md:min-h-136 lg:min-h-152 bg-white p-5 md:p-6 lg:p-7"
      style={pillar.bg && pillar.bg !== "#ffffff" ? { backgroundColor: pillar.bg } : undefined}
    >
      <div className="flex flex-col gap-3 px-1 pt-2">
        <h3 className="font-display text-lg lg:text-xl font-bold tracking-[0.02em] text-primary-500 uppercase leading-snug">
          {pillar.eyebrow}
        </h3>
        <p className="text-sm lg:text-base text-primary-500/70 leading-relaxed">
          {pillar.description}
        </p>
      </div>
      {hasMedia ? (
        <div className="mt-auto pt-10 md:pt-12">{mediaBlock}</div>
      ) : null}
    </div>
  );
}

function EmptyState() {
  return (
    <main className="bg-error-25 min-h-[60vh] flex items-center justify-center px-5 md:px-20 lg:px-32 py-20">
      <div className="mx-auto max-w-page text-center">
        <h1 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
          About page not yet configured
        </h1>
        <p className="mt-4 text-base text-primary-500/75 max-w-xl mx-auto leading-relaxed">
          Open Sanity Studio at <code>/studio</code> and create the
          &ldquo;About page&rdquo; document to populate this page.
        </p>
      </div>
    </main>
  );
}
