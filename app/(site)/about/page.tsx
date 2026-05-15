import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";

import ArrowRight from "../../components/ArrowRight";
import Button from "../../components/Button";
import CtaLink from "../../components/CtaLink";
import Logo from "../../components/Logo";
import MediaImage from "../../components/MediaImage";
import AboutShape from "../../components/shapes/AboutShape";
import LeaderShape from "../../components/shapes/LeaderShape";
import UnionShape from "../../components/shapes/UnionShape";
import MissionShape from "../../components/shapes/MissionShape";
import VisionShape from "../../components/shapes/VisionShape";
import { client } from "../../../sanity/lib/client";
import { resolveImage, resolveMedia } from "../../../sanity/lib/image";
import {
  ABOUT_PAGE_QUERY,
  LATEST_INITIATIVES_QUERY,
} from "../../../sanity/lib/queries";
import type {
  AboutPage,
  Cta,
  Initiative as InitiativeDoc,
  Leader as LeaderData,
  MissionCard as MissionCardData,
  Pillar as PillarData,
  Stat as StatData,
} from "../../../sanity/lib/types";
import CountUp from "./CountUp";
import InitiativesPanel, { type Initiative } from "./InitiativesPanel";
import LeaderLabel from "./LeaderLabel";
import MissionCarousel from "./MissionCarousel";

export const revalidate = 60;

async function getAboutPage(): Promise<AboutPage | null> {
  return client.fetch<AboutPage | null>(ABOUT_PAGE_QUERY);
}

async function getLatestInitiatives(limit: number): Promise<InitiativeDoc[]> {
  if (limit <= 0) return [];
  const data = await client.fetch<InitiativeDoc[] | null>(
    LATEST_INITIATIVES_QUERY,
    { limit },
  );
  return data ?? [];
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAboutPage();
  return {
    title: data?.seoTitle ?? "About BPI | Barbados Pharmaceutical Inc.",
    description:
      data?.seoDescription ??
      "BPI is the institution advancing pharmaceutical manufacturing, investment, and essential medicines access across the Caribbean and beyond.",
  };
}

export default async function AboutPage() {
  const data = await getAboutPage();

  if (!data) {
    return <EmptyState />;
  }

  const initiatives = await getLatestInitiatives(
    data.initiativesShowCount ?? 4,
  );

  const heroMedia = resolveMedia(data.heroImage, { width: 1600 });
  const heroImageSrc =
    heroMedia?.kind === "image" ? heroMedia.src : heroMedia?.poster;
  const heroVideoSrc =
    heroMedia?.kind === "video" ? heroMedia.src : undefined;
  const bannerMedia = resolveMedia(data.bannerImage, { width: 2000 });

  const initiativesForPanel: Initiative[] = initiatives.flatMap(
    (item): Initiative[] => {
      const img = resolveImage(item.coverImage, { width: 600 });
      if (!img) return [];
      const out: Initiative = {
        title: item.title,
        description: item.excerpt,
        imageSrc: img.src,
        imageAlt: img.alt,
      };
      if (item.subtitle) out.subtitle = item.subtitle;
      return [out];
    },
  );

  return (
    <main className="bg-error-25">
      <section className="px-5 md:px-20 lg:px-32 pt-6 md:pt-10 lg:pt-12 pb-24 md:pb-14 lg:pb-20">
        <div className="mx-auto max-w-page relative">
          {heroMedia ? (
            <div data-reveal="scale">
              <UnionShape
                size={1200}
                imageSrc={heroImageSrc}
                videoSrc={heroVideoSrc}
                imageAlt={heroMedia.alt}
                imagePosition="xMidYMin slice"
                imageOffsetY={-40}
                className="w-full h-auto"
              />
            </div>
          ) : null}

          <div
            className="absolute left-0 w-[58%] md:w-[62%] lg:w-[68%] pt-2 md:pt-4 lg:pt-6 pr-3 md:pr-6 lg:pr-12"
            style={{ top: "60%" }}
          >
            <h1
              className="hero-anim font-display text-xl md:text-display-md lg:text-display-lg font-bold text-primary-500 leading-[1.15] md:leading-[1.05] tracking-tight md:max-w-3xl lg:max-w-4xl text-balance whitespace-pre-line"
              style={{ "--anim-delay": "0s" } as CSSProperties}
            >
              {data.heroHeadline}
            </h1>
            <p
              className="hero-anim mt-3 md:mt-4 text-sm md:text-lg lg:text-xl text-primary-500/75 leading-relaxed md:max-w-xl lg:max-w-2xl"
              style={{ "--anim-delay": "0.12s" } as CSSProperties}
            >
              {data.heroSubheading}
            </p>
            {data.heroCta ? (
              <div
                className="hero-anim mt-4 lg:mt-5 flex flex-wrap items-center gap-3"
                style={{ "--anim-delay": "0.24s" } as CSSProperties}
              >
                <CtaLink href={data.heroCta.href} className="inline-flex">
                  <Button variant="primary" size="sm">
                    {data.heroCta.label}
                  </Button>
                </CtaLink>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-5 md:px-20 lg:px-32 pt-12 md:pt-12 lg:pt-16 pb-12 md:pb-10 lg:pb-14">
        <div
          data-reveal-stagger
          className="mx-auto max-w-page rounded-lg px-5 py-10 md:px-8 md:py-16 lg:px-12 lg:py-24"
          style={{ backgroundColor: data.visionBg ?? "#CAF1FF" }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 md:gap-8 mb-8 md:mb-10 lg:mb-12">
            <div className="max-w-lg">
              <h2 className="font-display text-lg md:text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
                {data.visionHeading}
              </h2>
              <p className="mt-2 text-xs md:text-sm lg:text-base text-primary-500/75 leading-relaxed">
                {data.visionDescription}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0 md:ml-auto">
              <CtaButton cta={data.visionPrimaryCta} variant="primary" />
              <CtaButton cta={data.visionSecondaryCta} variant="tertiary" />
            </div>
          </div>

          <div
            data-reveal-stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8"
          >
            {data.pillars?.map((pillar, idx) => (
              <PillarCard key={pillar.eyebrow + idx} pillar={pillar} />
            ))}
          </div>
        </div>
      </section>

      <DifferenceWeMakeSection data={data} />

      <section className="px-5 md:px-20 lg:px-32 pt-12 md:pt-12 lg:pt-16 pb-12 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-page">
          <div data-reveal-stagger className="max-w-2xl mb-8 lg:mb-8">
            <h2 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
              {data.missionHeading}
            </h2>
            <p className="mt-3 text-sm lg:text-base text-primary-500/75 leading-relaxed">
              {data.missionDescription}
            </p>
          </div>

          <div data-reveal="fade">
            <MissionCarousel>
              {data.missionCards?.map((card, idx) => (
                <MissionCardItem
                  key={(card.href ?? card.title) + idx}
                  card={card}
                />
              ))}
            </MissionCarousel>
          </div>
        </div>
      </section>

      <section className="px-5 md:px-20 lg:px-32 pt-12 md:pt-12 lg:pt-16 pb-12 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-page">
          <div data-reveal-stagger className="max-w-3xl mb-8 lg:mb-8">
            <h2 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
              {data.statsHeading}
            </h2>
            <p className="mt-3 text-sm lg:text-base text-primary-500/75 leading-relaxed">
              {data.statsDescription}
            </p>
          </div>

          <div
            data-reveal-stagger
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-3 lg:gap-4"
          >
            {data.stats?.map((stat, idx) => (
              <StatCard key={stat.value + idx} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {bannerMedia ? (
        <section className="px-5 md:px-20 lg:px-32 pt-8 lg:pt-10 pb-8 lg:pb-10">
          <div className="mx-auto max-w-page">
            <div
              data-reveal="scale"
              className="relative aspect-3/1 md:aspect-2/1 rounded-lg overflow-hidden"
            >
              <div
                data-parallax="0.06"
                className="absolute inset-x-0 top-[-12%] bottom-[-12%]"
              >
                <MediaImage media={bannerMedia} sizes="100vw" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-5 md:px-20 lg:px-32 pt-12 md:pt-10 lg:pt-14 pb-14 md:pb-14 lg:pb-20">
        <div
          data-reveal-stagger
          className="mx-auto max-w-page rounded-lg bg-white px-5 py-12 md:px-8 md:py-16 lg:px-12 lg:py-24"
        >
          <div className="mb-8 lg:mb-8">
            <p className="text-[10px] lg:text-xs font-bold tracking-[0.14em] text-primary-500/70 uppercase">
              {data.initiativesEyebrow}
            </p>
            <h2 className="mt-2 font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
              {data.initiativesHeading}
            </h2>
          </div>

          <InitiativesPanel initiatives={initiativesForPanel} />
        </div>
      </section>

      <section className="px-5 md:px-20 lg:px-32 pt-12 md:pt-10 lg:pt-14 pb-14 md:pb-14 lg:pb-20">
        <div
          className="mx-auto max-w-page rounded-lg px-5 py-10 md:px-8 md:py-16 lg:px-12 lg:py-24"
          style={{ backgroundColor: data.leadershipBg ?? "#CAF1FF" }}
        >
          <div data-reveal-stagger className="mx-auto max-w-5xl xl:max-w-6xl">
            <div className="max-w-md mb-8 lg:mb-8">
              <h2 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
                {data.leadershipHeading}
              </h2>
              <p className="mt-3 text-sm lg:text-base text-primary-500/75 leading-relaxed">
                {data.leadershipDescription}
              </p>
            </div>

            <div
              data-reveal-stagger
              className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-3 lg:gap-4"
            >
              {data.leaders?.map((leader, idx) => (
                <LeaderCard
                  key={leader.name + leader.role + idx}
                  leader={leader}
                  index={idx}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
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

// "The Difference We Make" — Sanity-driven section that sits between the
// Vision / Pillars block and the Mission carousel on the About page.
// Images, copy, both CTAs, and the outer / inner background colours are
// all editable from the About-page document in Studio.
function DifferenceWeMakeSection({ data }: { data: AboutPage }) {
  const leftImage = resolveImage(data.differenceLeftImage, { width: 1400 });
  const rightImage = resolveImage(data.differenceRightImage, { width: 1200 });
  const heading = data.differenceHeading ?? "The Difference We Make";
  const body = data.differenceBody ?? "";
  const outerBg = data.differenceOuterBg ?? "#CAF1FF";
  const innerBg = data.differenceInnerBg ?? "#E5FFF2";

  // Hide the section entirely if there's no content to render yet — keeps
  // the page graceful when the document hasn't been populated.
  if (!leftImage && !rightImage && !body) return null;

  return (
    <section className="px-5 md:px-20 lg:px-32 pt-12 md:pt-12 lg:pt-16 pb-12 md:pb-12 lg:pb-16">
      <div
        className="mx-auto max-w-page rounded-3xl px-5 md:px-8 lg:px-12 pt-5 md:pt-8 lg:pt-12 pb-6 md:pb-10 lg:pb-14"
        style={{ backgroundColor: outerBg }}
      >
        {/* Paired image strip. AboutShape's natural aspect is ~1.59:1, so
            sizing the first column to 1.59fr and the second to 1fr makes
            both images render at the same height while the right image
            stays a perfect square. */}
        {(leftImage || rightImage) && (
          <div
            data-reveal-stagger
            className="grid grid-cols-1 md:grid-cols-[1.59fr_1fr] gap-4 md:gap-5"
          >
            {leftImage ? (
              <div>
                <AboutShape
                  size={668}
                  imageSrc={leftImage.src}
                  imageAlt={leftImage.alt}
                  className="w-full h-auto block"
                />
              </div>
            ) : (
              <div />
            )}
            {rightImage ? (
              <div className="relative aspect-square rounded-2xl lg:rounded-3xl overflow-hidden">
                <Image
                  src={rightImage.src}
                  alt={rightImage.alt}
                  fill
                  sizes="(min-width: 768px) 28vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div />
            )}
          </div>
        )}

        {/* Inset statement card */}
        <div
          data-reveal-stagger
          className="mt-6 md:mt-8 lg:mt-10 rounded-2xl lg:rounded-3xl px-5 md:px-10 lg:px-14 py-8 md:py-12 lg:py-16"
          style={{ backgroundColor: innerBg }}
        >
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.01em]">
            {heading}
          </h2>
          {body ? (
            <p className="mt-4 lg:mt-5 text-sm md:text-base lg:text-lg text-primary-500/85 leading-relaxed max-w-4xl whitespace-pre-line">
              {body}
            </p>
          ) : null}
          {(data.differencePrimaryCta || data.differenceSecondaryCta) && (
            <div className="mt-6 lg:mt-8 pt-5 lg:pt-6 border-t border-primary-500/15 flex flex-wrap items-center gap-2 md:gap-3">
              <CtaButton
                cta={data.differencePrimaryCta ?? null}
                variant="primary"
              />
              <CtaButton
                cta={data.differenceSecondaryCta ?? null}
                variant="tertiary"
              />
            </div>
          )}
        </div>
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
          className="absolute inset-0 w-full h-full filter-[contrast(1.06)_saturate(0.92)_brightness(0.96)] transition-[filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:filter-[contrast(1.08)_saturate(0.95)_brightness(1)]"
          imageClassName="transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transform-none"
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
          <video
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disableRemotePlayback
            disablePictureInPicture
            aria-label={media.alt || undefined}
            className="absolute inset-0 w-full h-full object-cover filter-[contrast(1.06)_saturate(0.92)_brightness(0.96)] transition-[transform,filter] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:filter-[contrast(1.08)_saturate(0.95)_brightness(1)] motion-reduce:transform-none"
          />
        ) : (
          <Image
            src={posterSrc ?? ""}
            alt={media.alt}
            fill
            sizes="(min-width: 768px) 30vw, 45vw"
            className="object-cover filter-[contrast(1.06)_saturate(0.92)_brightness(0.96)] transition-[transform,filter] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:filter-[contrast(1.08)_saturate(0.95)_brightness(1)] motion-reduce:transform-none"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/95 via-black/65 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
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
      className="rounded-lg p-5 md:p-8 lg:p-12 flex items-stretch gap-5 md:gap-8 lg:gap-12 w-[84vw] md:w-[78vw] lg:w-[74vw] xl:w-[66vw] shrink-0 min-h-80 md:min-h-112 lg:min-h-128"
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
        <div
          data-reveal="scale"
          className="shrink-0 self-stretch flex items-center"
        >
          <MissionShape
            size={420}
            imageSrc={img.src}
            videoSrc={videoSrc}
            imageAlt={img.alt}
            className="w-full max-w-40 md:max-w-md lg:max-w-lg h-auto"
          />
        </div>
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
  const media = resolveMedia(pillar.image, { width: 800 });
  if (!media) return null;
  const posterSrc =
    media.kind === "image" ? media.src : media.poster ?? "";
  const videoSrc = media.kind === "video" ? media.src : undefined;

  if (pillar.highlight) {
    return (
      <div
        className="rounded-2xl overflow-hidden flex flex-col min-h-120 md:min-h-140 lg:min-h-160"
        style={{ backgroundColor: pillar.bg ?? "#ffffff" }}
      >
        <div data-reveal="scale" className="p-5 md:p-6 lg:p-7">
          <VisionShape
            size={320}
            imageSrc={posterSrc}
            videoSrc={videoSrc}
            imageAlt={media.alt}
            className="w-full h-auto"
          />
        </div>
        <div className="-mt-8 md:-mt-12 lg:-mt-16 pl-8 md:pl-10 lg:pl-12 pr-5 md:pr-6 lg:pr-7 pb-6 md:pb-7 lg:pb-8 flex flex-col gap-3 md:gap-4 max-w-[62%]">
          <span className="text-[11px] md:text-xs lg:text-sm font-bold tracking-[0.14em] text-primary-500 uppercase leading-tight">
            {pillar.eyebrow}
          </span>
          <p className="whitespace-pre-line text-sm md:text-base lg:text-lg text-primary-500/80 leading-relaxed">
            {pillar.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col min-h-120 md:min-h-140 lg:min-h-160"
      style={{ backgroundColor: pillar.bg ?? "#ffffff" }}
    >
      <div className="px-5 md:px-6 lg:px-7 pt-6 md:pt-7 lg:pt-8 flex flex-col gap-3 md:gap-4">
        <span className="text-[11px] md:text-xs lg:text-sm font-bold tracking-[0.14em] text-primary-500 uppercase">
          {pillar.eyebrow}
        </span>
        <p className="text-sm md:text-base lg:text-lg text-primary-500/80 leading-relaxed">
          {pillar.description}
        </p>
      </div>
      <div className="px-5 md:px-6 lg:px-7 pt-4 md:pt-5 lg:pt-6 pb-5 md:pb-6 lg:pb-7 mt-auto">
        <div
          data-reveal="scale"
          className="relative aspect-5/4 rounded-lg overflow-hidden"
        >
          {videoSrc ? (
            <video
              src={videoSrc}
              poster={posterSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              disableRemotePlayback
              disablePictureInPicture
              aria-label={media.alt || undefined}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              src={posterSrc}
              alt={media.alt}
              fill
              sizes="(min-width: 768px) 30vw, 90vw"
              className="object-cover"
            />
          )}
        </div>
      </div>
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
