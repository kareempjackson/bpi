import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";

import ArrowRight from "@/app/components/ArrowRight";
import BuildingSection from "@/app/components/BuildingSection";
import Button from "@/app/components/Button";
import CareersSection from "@/app/components/CareersSection";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import LazyVideo from "@/app/components/LazyVideo";
import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import Zone from "@/app/components/sections/Zone";
import type { RenderedBlock } from "@/app/components/sections/registry";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import LeaderShape from "@/app/components/shapes/LeaderShape";
import AboutBannerVideo from "./AboutBannerVideo";
import MissionShape from "@/app/components/shapes/MissionShape";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMedia } from "@/sanity/lib/image";
import { localizedHref } from "@/app/lib/locale";
import {
  ABOUT_PAGE_QUERY,
  HOME_PAGE_QUERY,
  MISSION_SECTOR_CARDS_QUERY,
} from "@/sanity/lib/queries";
import type {
  AboutPage,
  Cta,
  HomePage,
  Leader as LeaderData,
  Pillar as PillarData,
  ResolvedMedia,
  SanityImage,
  Stat as StatData,
} from "@/sanity/lib/types";
import CountUp from "@/app/components/CountUp";
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

// Sector card as needed by the mission carousel — carries both media slots so
// we can show whichever is authored (the card image if set, else the sector's
// hero video, which every sector has).
type MissionSectorCard = {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  order?: number | null;
  cardImage?: SanityImage | null;
  heroImage?: SanityImage | null;
};

async function getSectors(lang: string): Promise<MissionSectorCard[]> {
  const data = await loadQuery<MissionSectorCard[] | null>(
    MISSION_SECTOR_CARDS_QUERY,
    {
      params: { lang },
      tags: [TAG.sector],
    },
  );
  return data ?? [];
}

// The Careers + footer CTA copy lives on the Home page document (shared across
// the site). Reuse it here so the About page closes the same way as /sectors.
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

// Video src for a resolved media object (undefined for images).
function mediaVideoSrc(m: ResolvedMedia | null): string | undefined {
  return m?.kind === "video" ? m.src : undefined;
}

// A single mission carousel card, normalized from a Sector document. The
// carousel under "Our Mission" is driven by the same Sector documents that
// power the home-page nodes and the /sectors listing — name, blurb, media,
// and a link straight to the sector's own detail page.
type MissionCardView = {
  title: string;
  description?: string;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt: string;
  href: string;
  bg: string;
};

// Soft background tints cycled across the cards so neighbours read as
// distinct, mirroring the alternating blue/green of the approved design.
const MISSION_CARD_BG = [
  "#CAF1FF",
  "#C9F2D8",
  "#FDE7CE",
  "#E4E0FF",
  "#FFE0EC",
  "#D8EEF0",
];

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
  const [data, sectors, home] = await Promise.all([
    getAboutPage(lang),
    getSectors(lang),
    getHomePage(lang),
  ]);

  if (!data) {
    return <EmptyState />;
  }

  const heroMedia = resolveMedia(data.heroImage, { width: 1600 });
  const { lead: heroLead, rest: heroRest } = splitHeadline(
    data.heroHeadline ?? "",
  );
  const bannerMedia = resolveMedia(data.bannerImage, { width: 2000 });

  // Careers + footer CTA media, resolved from the Home page document.
  const careersMedia = resolveMedia(home?.careersImage, { width: 1200 });
  const buildingMedia = resolveMedia(home?.buildingImage, { width: 1600 });

  // Mission carousel cards come straight from the Sector documents so they
  // stay in lockstep with the home-page nodes and the /sectors pages.
  const missionCards: MissionCardView[] = sectors.map((sector, idx) => {
    // Prefer the card image slot; fall back to the sector's hero media (a
    // video on every sector) so each card always shows its sector's media.
    const media =
      resolveMedia(sector.cardImage, { width: 800 }) ??
      resolveMedia(sector.heroImage, { width: 800 });
    return {
      title: sector.title,
      description: sector.subtitle ?? undefined,
      imageSrc:
        media?.kind === "image" ? media.src : media?.poster ?? undefined,
      videoSrc: media?.kind === "video" ? media.src : undefined,
      imageAlt: media?.alt || sector.title,
      href: localizedHref(lang, `/sectors/${sector.slug}`),
      bg: MISSION_CARD_BG[idx % MISSION_CARD_BG.length],
    };
  });

  return (
    <main className="bg-error-25">
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        className="relative flex flex-col overflow-hidden bg-error-950 px-6 md:px-10 lg:px-14 pt-14 md:pt-16 lg:pt-16 pb-12 md:pb-16 lg:pb-20 lg:min-h-[89dvh]"
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
        <GridHoverBackdrop />

        <div className="relative grid w-full flex-1 grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 min-h-0 items-stretch">
          {/* Left — description + CTA (top), two-tone headline (bottom). */}
          <div className="order-2 lg:order-1 flex flex-col min-h-0">
            <Stagger
              immediate
              className="flex flex-col gap-6 max-w-md"
            >
              {data.heroSubheading ? (
                <StaggerItem as="p" className="font-display font-light text-[18px] leading-[140%] tracking-normal text-white max-w-md">
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
              immediate
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
                immediate
                className="relative w-full aspect-3/4 lg:aspect-auto lg:h-full overflow-hidden rounded-sm bg-white/5"
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

      <NeedForChangeSection data={data} />

      <section
        data-nav-theme="light"
        className="bg-error-25 px-6 md:px-10 lg:px-14 pt-16 md:pt-24 lg:pt-28 pb-12 md:pb-16 lg:pb-24"
      >
        <div className="mx-auto max-w-page">
          <Stagger
            className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 md:gap-8 mb-10 md:mb-12 lg:mb-14"
          >
            <StaggerItem className="max-w-2xl">
              <h2 className="font-display font-medium text-[30px] leading-[110%] tracking-normal text-black">
                {data.visionHeading}
              </h2>
              <PortableTextBody
                value={data.visionDescription}
                className="mt-3"
                paragraphClassName="font-display font-normal text-[18px] leading-[150%] tracking-normal text-black"
              />
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

      {/* Full-width video/media banner — sits directly under the
          "What We Are Building" section. */}
      {bannerMedia ? (
        <section className="px-6 md:px-10 lg:px-14 pt-8 lg:pt-10 pb-8 lg:pb-10">
          <div className="mx-auto max-w-page">
            <AboutBannerVideo media={bannerMedia} />
          </div>
        </section>
      ) : null}

      <section className="px-6 md:px-10 lg:px-14 pt-12 md:pt-12 lg:pt-16 pb-12 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-page">
          <Stagger className="max-w-3xl mb-12 lg:mb-16">
            <StaggerItem as="h2" className="font-display font-semibold text-[30px] leading-10 tracking-[0.37px] text-black">
              {data.missionHeading}
            </StaggerItem>
            <StaggerItem className="mt-3">
              <PortableTextBody
                value={data.missionDescription}
                paragraphClassName="font-display font-normal text-[18px] leading-[150%] tracking-[0.37px] text-black"
              />
            </StaggerItem>
          </Stagger>

          <Reveal preset="fade">
            <MissionCarousel>
              {missionCards.map((card, idx) => (
                <MissionCardItem
                  key={card.href + idx}
                  card={card}
                />
              ))}
            </MissionCarousel>
          </Reveal>
        </div>
      </section>

      <section className="px-6 md:px-10 lg:px-14 pt-12 md:pt-12 lg:pt-16 pb-12 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-page">
          <Stagger className="max-w-3xl mb-8 lg:mb-8">
            <StaggerItem as="h2" className="font-display font-semibold text-[30px] leading-10 tracking-[0.37px] text-black">
              {data.statsHeading}
            </StaggerItem>
            <StaggerItem className="mt-3">
              <PortableTextBody
                value={data.statsDescription}
                paragraphClassName="font-display font-normal text-[18px] leading-[150%] tracking-[0.37px] text-black"
              />
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

      <section className="px-6 md:px-10 lg:px-14 pt-12 md:pt-10 lg:pt-14 pb-14 md:pb-14 lg:pb-20">
        <Stagger className="mx-auto max-w-page">
          <StaggerItem className="max-w-lg mb-8 lg:mb-10">
            <h2 className="font-display font-semibold text-[30px] leading-10 tracking-[0.37px] text-black">
              {data.leadershipHeading}
            </h2>
            <PortableTextBody
              value={data.leadershipDescription}
              className="mt-3"
              paragraphClassName="font-display font-normal text-[18px] leading-[150%] tracking-[0.37px] text-black"
            />
          </StaggerItem>

          <StaggerItem>
            {/* Each leader card carries a built-in ~2.7%-of-cell horizontal
                inset (the LeaderShape path spans x=10→362 of 372, and the odd
                rounded cards match it). Pull the whole grid outward by that
                inset so the outer portraits sit flush with the page gutters —
                lining the row up with the nav logo (left) and menu (right).
                The fraction differs by column count: ~1.3% at 2 cols, ~0.65%
                at 4 cols. */}
            <Stagger
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-3 lg:gap-4 mx-[-1.3%] md:mx-[-0.65%]"
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

      <Zone
        blocks={data.pageSections as unknown as RenderedBlock[]}
        lang={lang}
      />

      {/* Careers + closing CTA — shared copy from the Home page document, the
          same pairing that closes the /sectors page. */}
      <CareersSection
        tone="mint"
        eyebrow={home?.careersEyebrow ?? undefined}
        heading={home?.careersHeading ?? undefined}
        lead={home?.careersLead ?? undefined}
        body={home?.careersBody ?? undefined}
        imageSrc={mediaImageSrc(careersMedia) ?? mediaImageSrc(buildingMedia)}
        videoSrc={mediaVideoSrc(careersMedia)}
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
        videoSrc={mediaVideoSrc(buildingMedia)}
        imageAlt={buildingMedia?.alt}
        headlineLine1={home?.buildingHeadlineLine1}
        headlineLine2={home?.buildingHeadlineLine2}
        primaryLabel={home?.buildingPrimaryCta?.label ?? undefined}
        primaryHref={
          home?.buildingPrimaryCta?.href
            ? localizedHref(lang, home.buildingPrimaryCta.href)
            : undefined
        }
        secondaryLabel={home?.buildingSecondaryCta?.label ?? undefined}
        secondaryHref={
          home?.buildingSecondaryCta?.href
            ? localizedHref(lang, home.buildingSecondaryCta.href)
            : undefined
        }
      />
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

// "The need for change" — an image-free editorial two-column section that
// opens the About narrative, sitting directly above the Vision block. A short
// label sits on the left; on the right, an intro paragraph leads into a large
// pull-quote statement, followed by a closing paragraph. All copy is editable
// from Studio (WYSIWYG); the approved copy below is the fallback shown until
// the CMS fields are populated.
function NeedForChangeSection({ data }: { data: AboutPage }) {
  const heading = data.needHeading ?? "The need for change";
  const intro =
    data.needIntro ??
    "In 2020, the COVID-19 pandemic exposed what small island states already knew: when global supply chains fracture, the Caribbean waits longest and receives least. Barbados imported almost every medicine its population needed.";
  const statement =
    data.needStatement ??
    "That dependency cost the country during the pandemic, and it continues to cost it today.";
  const closing =
    data.needClosing ??
    "Barbados Pharmaceutical Inc. was established in 2023 by the Government of Barbados, operating under the Ministry of Health and Wellness, to address that structural vulnerability directly. BPI's mandate is to develop the pharmaceutical ecosystem needed to attract investment, build local manufacturing capacity, and position Barbados as a production and distribution hub for CARICOM and beyond.";

  return (
    <section
      data-nav-theme="light"
      className="bg-error-25 px-6 md:px-10 lg:px-14 pt-14 md:pt-20 lg:pt-24 pb-4 md:pb-6 lg:pb-8"
    >
      <div className="mx-auto max-w-page grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-start">
        <Stagger className="max-w-sm">
          <StaggerItem
            as="h2"
            className="font-display font-semibold text-[30px] leading-[48px] tracking-[0.48px] align-middle text-black"
          >
            {heading}
          </StaggerItem>
        </Stagger>

        <Stagger className="flex flex-col gap-8 md:gap-10 lg:gap-12">
          <StaggerItem>
            <PortableTextBody
              value={intro}
              paragraphClassName="font-sans font-normal text-[18px] leading-[176%] tracking-[0.48px] align-middle text-black"
            />
          </StaggerItem>
          <StaggerItem>
            <PortableTextBody
              value={statement}
              paragraphClassName="font-sans font-bold text-[36px] leading-[176%] tracking-[0.48px] align-middle text-black"
            />
          </StaggerItem>
          <StaggerItem>
            <PortableTextBody
              value={closing}
              paragraphClassName="font-sans font-normal text-[18px] leading-[176%] tracking-[0.48px] align-middle text-black"
            />
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}

// "The Difference We Make" — a simple, image-free two-column statement that
// sits between the Vision / Pillars block and the Mission carousel on the
// About page. Eyebrow + heading on the left, body copy (with an optional
// tagline below a divider) on the right. All editable from Studio.
function DifferenceWeMakeSection({ data }: { data: AboutPage }) {
  const eyebrow = data.differenceEyebrow ?? "What We Are Building";
  const heading = data.differenceHeading ?? "The Difference\nWe Make";

  // The heading is laid out as a staircase: the first line hugs the left
  // edge, every line after it is pushed to the right. Authors set the break
  // points with newlines in Studio; if the stored value has none, we drop
  // the last two words to the second line so older flat content still reads
  // as a staircase (e.g. "The Difference" / "We Make").
  const headingLines = heading.includes("\n")
    ? heading.split("\n")
    : staircaseFromFlat(heading);

  // Above-the-line statement and the content below the divider are both fixed
  // to the approved copy.
  const body =
    "BPI is a market creator. Our role is a sector accelerator and investment facilitator, catalyzing investment, partnerships, manufacturing, and policy alignment, serving as a gateway to global demand and creating new market entry points. Through a catalytic project incubator model, we're pushing from investment to impact.";

  return (
    <section className="my-12 md:my-16 lg:my-24 px-6 md:px-10 lg:px-14 pt-12 md:pt-12 lg:pt-16 pb-12 md:pb-12 lg:pb-16">
      <div className="mx-auto max-w-page grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-start">
        <Stagger className="max-w-sm">
          {eyebrow ? (
            <StaggerItem as="p" className="font-display font-normal text-[16px] leading-[100%] tracking-[1px] align-middle text-black">
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
            <StaggerItem as="p" className="font-display font-normal text-[20px] leading-[23.59px] tracking-[-0.75px] align-middle text-black whitespace-pre-line">
              {body}
            </StaggerItem>
          ) : null}
          <StaggerItem className="mt-6 lg:mt-8 pt-5 lg:pt-6 border-t border-primary-500/15">
            <h3 className="font-display font-bold text-[20px] leading-[1.2] tracking-[-0.5px] text-black">
              The Difference We Make
            </h3>
            <p className="mt-3 font-display font-normal text-[18px] leading-[1.4] tracking-[-0.5px] text-black">
              97% of Caribbean medicines are imported today. BPI exists to
              change that, one shipment, one facility, one policy at a time.
            </p>
          </StaggerItem>
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

function MissionCardItem({ card }: { card: MissionCardView }) {
  return (
    <div
      className="rounded-lg px-5 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 flex items-stretch gap-5 md:gap-8 lg:gap-12 w-[86vw] md:w-[74vw] lg:w-[68vw] xl:w-[62vw] shrink-0 min-h-80 md:min-h-112 lg:min-h-128"
      style={{ backgroundColor: card.bg }}
    >
      <div className="flex flex-col justify-center items-start text-left gap-5 md:gap-6 flex-1 min-w-0 pl-4 md:pl-10 lg:pl-16">
        <div className="flex flex-col items-start gap-5 md:gap-7">
          <h3 className="font-display font-medium text-[36px] leading-9.5 tracking-[0.37px] text-black">
            {card.title}
          </h3>
          {card.description ? (
            <p className="font-display font-normal text-[18px] leading-7 tracking-[0.37px] text-black max-w-md whitespace-pre-line">
              {card.description}
            </p>
          ) : null}
        </div>
        <CtaLink
          href={card.href}
          className="inline-flex items-center gap-2 font-display font-normal text-[16px] leading-5 tracking-[0.55px] text-black hover:opacity-70 transition-opacity"
        >
          Learn more
          <ArrowRight />
        </CtaLink>
      </div>

      {card.imageSrc || card.videoSrc ? (
        <Reveal
          preset="scale"
          className="shrink-0 self-stretch flex items-center"
        >
          <MissionShape
            size={520}
            imageSrc={card.imageSrc}
            videoSrc={card.videoSrc}
            imageAlt={card.imageAlt}
            className="w-auto h-auto max-h-80 md:max-h-112 lg:max-h-128"
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
      <p className="font-display font-normal text-[16px] leading-[142%] tracking-normal text-black">
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
          <h3 className="font-display font-semibold text-[24px] leading-[150%] tracking-normal uppercase text-white">
            {pillar.eyebrow}
          </h3>
          <PortableTextBody
            value={pillar.description}
            paragraphClassName="whitespace-pre-line font-display font-normal text-[18px] leading-[142%] tracking-normal text-white/70"
          />
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
        <h3 className="font-display font-semibold text-[24px] leading-[150%] tracking-normal uppercase text-[#001E4A]">
          {pillar.eyebrow}
        </h3>
        <PortableTextBody
          value={pillar.description}
          paragraphClassName="font-display font-normal text-[18px] leading-[142%] tracking-normal text-black"
        />
      </div>
      {hasMedia ? (
        <div className="mt-auto pt-10 md:pt-12">{mediaBlock}</div>
      ) : null}
    </div>
  );
}

function EmptyState() {
  return (
    <main className="bg-error-25 min-h-[60vh] flex items-center justify-center px-6 md:px-10 lg:px-14 py-20">
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
