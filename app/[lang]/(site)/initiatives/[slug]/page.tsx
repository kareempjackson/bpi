import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import BuildingSection from "@/app/components/BuildingSection";
import CareersSection from "@/app/components/CareersSection";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { client } from "@/sanity/lib/client";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveImage, resolveMedia } from "@/sanity/lib/image";
import {
  ALL_INITIATIVE_SLUGS_QUERY,
  HOME_PAGE_QUERY,
  INITIATIVE_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";
import type {
  HomePage,
  InitiativeDetail,
  ResolvedMedia,
} from "@/sanity/lib/types";

// Poster/still for a resolved media object (image src, or a video's poster).
function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}

type RouteProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export const revalidate = 3600;

// Royal-blue editorial hero (matches the screenshot). Faint rounded-tile grid
// backdrop reused from the careers / about heroes.
const DEFAULT_PAGE_COLOR = "#0B2F64";
// Impact stat-card background cycle: white, light blue, green.
const STAT_PALETTE = ["#FFFFFF", "#CAF1FF", "#5AD96A"];

// Lighten a hex colour toward white by `amount` (0 = original, 1 = white) so a
// single page colour can drive the whole palette (hero, bands, cards).
function mixWhite(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return hex;
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const to2 = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to2(mix(r))}${to2(mix(g))}${to2(mix(b))}`;
}

// Derive the page's colour palette from one base colour.
function pagePalette(base: string) {
  return {
    base,
    heroAccent: mixWhite(base, 0.5),
    // Pale "white" section band — a fixed soft blue.
    sectionBg: "#E7F9FF",
    quoteBg: "#0094C9",
    whyBg: mixWhite(base, 0.12),
    ring: mixWhite(base, 0.42),
  };
}

// Render a pull-quote two-tone: phrases wrapped in **double asterisks** are
// white, everything else is navy.
function renderQuote(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="text-white">
        {part}
      </span>
    ) : (
      <span key={i} className="text-primary-500">
        {part}
      </span>
    ),
  );
}

// Split a title so the first three and last two words render in the light-blue
// accent and the middle stays white — the two-tone treatment in the design.
function splitTitleEnds(title: string): {
  start: string;
  middle: string;
  end: string;
} {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const n = words.length;
  const startCount = Math.min(3, n);
  const endCount = Math.min(2, Math.max(0, n - startCount));
  return {
    start: words.slice(0, startCount).join(" "),
    middle: words.slice(startCount, n - endCount).join(" "),
    end: endCount ? words.slice(n - endCount).join(" ") : "",
  };
}

export async function generateStaticParams() {
  // Build-time / static context — can't use loadQuery (it reads draftMode).
  // Tag it so a published initiative also refreshes the slug list.
  const data = await client.fetch<{ slug: string }[] | null>(
    ALL_INITIATIVE_SLUGS_QUERY,
    {},
    { next: { tags: [TAG.initiative] } },
  );
  return (data ?? []).map((d) => ({ slug: d.slug }));
}

async function getInitiative(
  lang: string,
  slug: string,
): Promise<InitiativeDetail | null> {
  return loadQuery<InitiativeDetail | null>(INITIATIVE_BY_SLUG_QUERY, {
    params: { lang, slug },
    tags: [TAG.initiative],
  });
}

// Careers + footer-CTA copy lives on the Home page; the "Building the future"
// stats live on the Initiatives listing page. Reuse both so the bottom of the
// detail page stays in sync with the rest of the site.
async function getHomePage(lang: string): Promise<HomePage | null> {
  return loadQuery<HomePage | null>(HOME_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.homePage],
  });
}


export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const data = await getInitiative(lang, slug);
  if (!data) return { title: "Initiatives — BPI" };
  return {
    title: `${data.title} — BPI Initiatives`,
    description: data.excerpt,
  };
}

/**
 * Portable Text render rules — tuned for editorial reading: longer line
 * heights, generous gaps between blocks, refined heading hierarchy.
 */
const bodyComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base lg:text-lg text-primary-500/85 leading-[1.75]">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-primary-500 leading-[1.15] tracking-[-0.02em] mt-8 lg:mt-12 mb-1 balance-text">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-xl md:text-2xl font-semibold text-primary-500 leading-snug tracking-[-0.015em] mt-6 lg:mt-8 mb-0.5 balance-text">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 lg:my-6 border-l-2 border-primary-500/30 pl-6 lg:pl-8 font-display text-xl md:text-2xl lg:text-3xl text-primary-500 leading-[1.35] italic tracking-[-0.01em] balance-text">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="flex flex-col gap-2.5 list-disc list-outside pl-6 marker:text-primary-500/50 text-base lg:text-lg text-primary-500/85 leading-[1.75]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="flex flex-col gap-2.5 list-decimal list-outside pl-6 marker:text-primary-500/50 marker:font-semibold text-base lg:text-lg text-primary-500/85 leading-[1.75]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1">{children}</li>,
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-primary-500">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = /^https?:/i.test(href);
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="hov-underline text-primary-500 decoration-primary-500/30 underline underline-offset-[6px]"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const v = value as
        | { asset?: { _ref?: string }; alt?: string }
        | undefined;
      if (!v) return null;
      const img = resolveImage(
        { asset: v.asset, alt: v.alt ?? "" } as Parameters<
          typeof resolveImage
        >[0],
        { width: 1600 },
      );
      if (!img) return null;
      return (
        <figure className="my-8 lg:my-12">
          <div className="relative aspect-16/9 rounded-2xl lg:rounded-3xl overflow-hidden">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 800px, 100vw"
              className="object-cover"
            />
          </div>
          {img.alt ? (
            <figcaption className="mt-3 text-xs lg:text-sm text-primary-500/60 leading-relaxed">
              {img.alt}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

// Smaller "detail" body that follows the lead — quieter, tighter type.
const detailComponents: PortableTextComponents = {
  ...bodyComponents,
  block: {
    normal: ({ children }) => (
      <p className="text-sm lg:text-[15px] text-primary-500/75 leading-[1.7]">
        {children}
      </p>
    ),
  },
};

export default async function InitiativeDetailPage({ params }: RouteProps) {
  const { lang, slug } = await params;
  const initiative = await getInitiative(lang, slug);
  if (!initiative) notFound();
  // Display-only initiatives don't have a detail page. The
  // `generateStaticParams` GROQ already filters these out, but a direct
  // URL hit still lands here — 404 cleanly. (Treat absent `hasDetailPage`
  // as true so legacy data still renders.)
  if (initiative.hasDetailPage === false) notFound();

  const homeData = await getHomePage(lang);
  const careersMedia = resolveMedia(homeData?.careersImage, { width: 1200 });
  const buildingMedia = resolveMedia(homeData?.buildingImage, { width: 1600 });

  const cover = resolveImage(initiative.coverImage, { width: 2000 });
  const hasBody = !!initiative.body && initiative.body.length > 0;
  const quoteImg = resolveImage(initiative.quoteImage, { width: 1200 });
  const showQuote = !!initiative.showQuote && !!initiative.quoteText;
  const whyMattersImg = resolveImage(initiative.whyMattersImage, {
    width: 2000,
  });
  const impactStats = initiative.impactStats ?? [];
  const showWhyMatters =
    !!whyMattersImg || !!initiative.whyMattersBody || impactStats.length > 0;
  const {
    start: hStart,
    middle: hMid,
    end: hEnd,
  } = splitTitleEnds(initiative.title);

  // One Sanity colour drives the whole page (plus the footer, via a CSS var).
  const { base, heroAccent, sectionBg, quoteBg, whyBg, ring } = pagePalette(
    initiative.pageColor || DEFAULT_PAGE_COLOR,
  );

  return (
    <main className="bg-error-25">
      {/* Recolour the shared footer + brand accents (footer text, Subscribe
          button, nav menu button) to match this page (SSR-safe, no flash).
          Falls back to brand teal/green on every other page. */}
      <style>{`:root{--footer-bg:${base};--brand-accent:#ABE8FE;--brand-accent-strong:${quoteBg};}`}</style>
      {/* Royal-blue editorial hero — two-tone title (left), excerpt + CTAs
          (right), then a full-bleed cover image flush to the bottom. */}
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        className="relative overflow-hidden"
        style={{ backgroundColor: base }}
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
        <GridHoverBackdrop />

        {/* Top band — title left, excerpt + CTAs right. */}
        <div className="relative px-6 md:px-12 lg:px-20 xl:px-28 pt-24 md:pt-28 lg:pt-28 pb-10 md:pb-14 lg:pb-16">
          <Stagger
            className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start"
          >
            <StaggerItem
              as="h1"
              className="font-display text-[clamp(2.25rem,4.4vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.03em] max-w-2xl"
            >
              <span style={{ color: heroAccent }}>{hStart}</span>
              {hMid ? (
                <>
                  {" "}
                  <span className="text-white">{hMid}</span>
                </>
              ) : null}
              {hEnd ? (
                <>
                  {" "}
                  <span style={{ color: heroAccent }}>{hEnd}</span>
                </>
              ) : null}
            </StaggerItem>

            <StaggerItem className="flex flex-col gap-6 max-w-md lg:justify-self-end lg:pt-2">
              {initiative.excerpt ? (
                <p className="text-base md:text-lg text-white/75 leading-relaxed">
                  {initiative.excerpt}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <CtaLink
                  href="/contact"
                  className="inline-flex w-fit items-center rounded-round bg-warning-25 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-white"
                >
                  Partner With BPI
                </CtaLink>
                <CtaLink
                  href="/initiatives"
                  className="inline-flex w-fit items-center rounded-round border border-white/50 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-(--ease-premium) hover:border-white/80 hover:bg-white/10"
                >
                  Explore Our Impact
                </CtaLink>
              </div>
            </StaggerItem>
          </Stagger>
        </div>

        {/* Full-bleed cover image flush to the bottom of the blue band. */}
        {cover ? (
          <Reveal
            preset="scale"
            className="relative w-full aspect-4/3 sm:aspect-video lg:aspect-2/1"
          >
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="100vw"
              className="object-cover"
              preload
              quality={90}
            />
          </Reveal>
        ) : null}
      </section>

      {/* Body — two columns: the title (left) and the content (right), with
          the subtitle as a large lead above the smaller body detail. Pale-blue
          background. */}
      {hasBody || initiative.subtitle ? (
        <section
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20 lg:py-28"
          style={{ backgroundColor: sectionBg }}
        >
          <Stagger
            className="mx-auto grid max-w-page grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-start"
          >
            {/* Left — title, sticks while the body scrolls. */}
            <StaggerItem
              as="h2"
              className="lg:col-span-1 font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-tight lg:sticky lg:top-24 lg:self-start"
            >
              {initiative.title}
            </StaggerItem>

            {/* Right — subtitle as the large lead, then the body detail. */}
            <StaggerItem className="lg:col-span-2 flex flex-col gap-10 lg:gap-14">
              {initiative.subtitle ? (
                <p className="text-xl md:text-2xl lg:text-[26px] text-primary-500 leading-normal tracking-[-0.01em]">
                  {initiative.subtitle}
                </p>
              ) : null}
              {hasBody ? (
                <div className="flex flex-col gap-4 max-w-2xl">
                  <PortableText
                    value={initiative.body!}
                    components={detailComponents}
                  />
                </div>
              ) : null}
            </StaggerItem>
          </Stagger>
        </section>
      ) : null}

      {/* Quote section — toggled per-initiative in Sanity (showQuote). Medium
          blue band: supporting note + attribution + two-tone pull quote on the
          left, portrait on the right. */}
      {showQuote ? (
        <section
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-14 md:py-20 lg:py-24"
          style={{ backgroundColor: quoteBg }}
        >
          <Stagger
            className="mx-auto grid max-w-page grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch"
          >
            {/* Left — supporting note (top), attribution + quote (bottom). */}
            <StaggerItem className="flex flex-col justify-between gap-12 lg:gap-16">
              {initiative.quoteSupporting ? (
                <p className="max-w-xs text-sm text-white/55 leading-relaxed">
                  {initiative.quoteSupporting}
                </p>
              ) : null}
              <div className="flex flex-col gap-5">
                {initiative.quoteAttribution ? (
                  <p className="text-sm text-white/90 leading-snug">
                    {initiative.quoteAttribution}
                  </p>
                ) : null}
                <blockquote className="font-display text-[clamp(1.75rem,3.4vw,3rem)] font-bold leading-[1.12] tracking-[-0.02em]">
                  {renderQuote(initiative.quoteText!)}
                </blockquote>
              </div>
            </StaggerItem>

            {/* Right — portrait. */}
            {quoteImg ? (
              <StaggerItem
                preset="scale"
                className="relative w-full aspect-4/5 lg:aspect-auto lg:h-full min-h-80 overflow-hidden rounded-2xl lg:rounded-3xl bg-white/10"
              >
                <Image
                  src={quoteImg.src}
                  alt={quoteImg.alt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </StaggerItem>
            ) : null}
          </Stagger>
        </section>
      ) : null}

      {/* Why It Matters + Further Projected Impact — dark navy band with a
          full-width image and a row of stat cards (cycling palette). */}
      {showWhyMatters ? (
        <section
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-14 md:py-20 lg:py-24"
          style={{ backgroundColor: whyBg }}
        >
          <div className="mx-auto max-w-page flex flex-col gap-16 lg:gap-24">
            {/* Why It Matters */}
            {whyMattersImg || initiative.whyMattersBody ? (
              <Stagger className="flex flex-col gap-6 lg:gap-8">
                <StaggerItem className="flex flex-col gap-3 border-b border-white/15 pb-6 lg:pb-8">
                  <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
                    {initiative.whyMattersHeading ?? "Why It Matters"}
                  </h2>
                  {initiative.whyMattersBody ? (
                    <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-3xl">
                      {initiative.whyMattersBody}
                    </p>
                  ) : null}
                </StaggerItem>
                {whyMattersImg ? (
                  <StaggerItem
                    preset="scale"
                    className="relative w-full aspect-video lg:aspect-2/1 overflow-hidden rounded-lg lg:rounded-xl bg-white/5"
                    style={{ boxShadow: `0 0 0 2px ${ring}` }}
                  >
                    <Image
                      src={whyMattersImg.src}
                      alt={whyMattersImg.alt}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </StaggerItem>
                ) : null}
              </Stagger>
            ) : null}

            {/* Further Projected Impact */}
            {impactStats.length > 0 ? (
              <Stagger className="flex flex-col gap-8 lg:gap-10">
                <StaggerItem className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-xl">
                    <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
                      {initiative.impactHeading ?? "Further Projected Impact"}
                    </h2>
                    {initiative.impactBody ? (
                      <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">
                        {initiative.impactBody}
                      </p>
                    ) : null}
                  </div>
                  <CtaLink
                    href="/contact"
                    className="inline-flex w-fit shrink-0 items-center rounded-round bg-warning-25 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-white"
                  >
                    Partner With BPI
                  </CtaLink>
                </StaggerItem>
                <StaggerItem className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {impactStats.map((stat, i) => (
                    <div
                      key={i}
                      className="flex flex-col justify-between rounded-lg lg:rounded-xl p-5 lg:p-6 min-h-64 lg:min-h-72"
                      style={{
                        backgroundColor: STAT_PALETTE[i % STAT_PALETTE.length],
                      }}
                    >
                      <div className="font-display text-xl lg:text-2xl font-semibold text-primary-500 leading-tight tracking-tight">
                        {stat.value}
                      </div>
                      {stat.label ? (
                        <p className="text-xs lg:text-sm text-primary-500/70 leading-snug">
                          {stat.label}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </StaggerItem>
              </Stagger>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Careers + footer CTA from the Home page, in the blue tone. */}
      {homeData ? (
        <>
          <CareersSection
            tone="blue"
            eyebrow={homeData.careersEyebrow ?? undefined}
            heading={homeData.careersHeading ?? undefined}
            lead={homeData.careersLead ?? undefined}
            body={homeData.careersBody ?? undefined}
            imageSrc={
              mediaImageSrc(careersMedia) ?? mediaImageSrc(buildingMedia)
            }
            imageAlt={careersMedia?.alt ?? buildingMedia?.alt}
            primaryLabel={homeData.careersPrimaryCta?.label ?? undefined}
            primaryHref={homeData.careersPrimaryCta?.href ?? undefined}
            secondaryLabel={homeData.careersSecondaryCta?.label ?? undefined}
            secondaryHref={homeData.careersSecondaryCta?.href ?? undefined}
          />
          <BuildingSection
            tone="blue"
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
