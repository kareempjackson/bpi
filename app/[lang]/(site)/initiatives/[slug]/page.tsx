import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import BlogSection, { type BlogSectionPost } from "@/app/components/BlogSection";
import BuildingSection from "@/app/components/BuildingSection";
import CareersSection from "@/app/components/CareersSection";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import PortableTextBody from "@/app/components/PortableTextBody";
import SocialIcon from "@/app/components/SocialIcon";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import InitiativeHeaderType1 from "./InitiativeHeaderType1";
import InitiativeHeaderType2 from "./InitiativeHeaderType2";
import InitiativeHeaderType3 from "./InitiativeHeaderType3";
import InitiativeHeaderType4 from "./InitiativeHeaderType4";
import { client } from "@/sanity/lib/client";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveImage, resolveMedia } from "@/sanity/lib/image";
import {
  ALL_INITIATIVE_SLUGS_QUERY,
  HOME_PAGE_QUERY,
  INITIATIVE_BY_SLUG_QUERY,
  LATEST_POSTS_QUERY,
} from "@/sanity/lib/queries";
import type {
  BlogPost,
  HomePage,
  InitiativeDetail,
  ResolvedMedia,
} from "@/sanity/lib/types";

// Poster/still for a resolved media object (image src, or a video's poster).
function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}
function mediaVideoSrc(m: ResolvedMedia | null): string | undefined {
  return m?.kind === "video" ? m.src : undefined;
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
    // A step deeper than sectionBg, for a band that needs to separate from it —
    // the same blue the blog bento uses for its cards.
    accentBg: "#CAF1FF",
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

// "Latest from BPI" — newest posts for the optional blog section.
async function getLatestPosts(lang: string, limit = 3): Promise<BlogPost[]> {
  const data = await loadQuery<BlogPost[] | null>(LATEST_POSTS_QUERY, {
    params: { lang, limit },
    tags: [TAG.post],
  });
  return data ?? [];
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

  const [homeData, latestPosts] = await Promise.all([
    getHomePage(lang),
    initiative.showBlog ? getLatestPosts(lang, 3) : Promise.resolve([]),
  ]);
  const careersMedia = resolveMedia(homeData?.careersImage, { width: 1200 });
  const buildingMedia = resolveMedia(homeData?.buildingImage, { width: 1600 });

  // Latest from BPI — mapped to the shared bento component (same as the
  // sectors/home pages). Hides itself when there are no posts.
  const blogPosts: BlogSectionPost[] = latestPosts.map((p) => {
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
  const { base, heroAccent, sectionBg, accentBg, quoteBg, whyBg, ring } =
    pagePalette(initiative.pageColor || DEFAULT_PAGE_COLOR);

  // Header type. "type1" swaps the editorial hero for a title + tall-image
  // layout, "type2" for the split-title lockup, "type3" for the copy-on-top /
  // big-title-bottom layout; everything falls back so an editor only has to
  // flip the toggle.
  const isType1Header = initiative.headerType === "type1";
  const isType2Header = initiative.headerType === "type2";
  const isType3Header = initiative.headerType === "type3";
  const isType4Header = initiative.headerType === "type4";
  const headerTitle = initiative.headerTitle || initiative.title;
  const headerSubtitle = initiative.headerSubtitle || initiative.excerpt;
  const headerImg = resolveImage(initiative.headerImage ?? initiative.coverImage, {
    width: 1800,
  });
  // headerImage → coverImage → the Home building photo, so the slot is filled.
  const headerImageSrc = headerImg?.src ?? mediaImageSrc(buildingMedia);
  const headerImageAlt = headerImg?.alt ?? buildingMedia?.alt ?? "";
  const headerPrimaryCta = {
    label: initiative.headerPrimaryCta?.label || "Partner With BPI",
    href: initiative.headerPrimaryCta?.href || "/contact",
  };
  const headerSecondaryCta = initiative.headerSecondaryCta?.label
    ? {
        label: initiative.headerSecondaryCta.label,
        href: initiative.headerSecondaryCta.href || "#",
      }
    : null;

  // "What This Is" + Key Metrics — a toggleable white section.
  const whatThisIsParagraphs = (initiative.whatThisIsBody ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const keyMetrics = (initiative.keyMetrics ?? []).filter(
    (m) => m.value || m.label,
  );
  const showWhatThisIs =
    !!initiative.showWhatThisIs &&
    (whatThisIsParagraphs.length > 0 || keyMetrics.length > 0);
  // "beside" pairs the heading with the body as a large italic lead; absent/
  // anything else keeps the original stacked, full-width block.
  const whatThisIsBeside = initiative.whatThisIsLayout === "beside";
  // "stackedLead" keeps the stacked block but sizes the body as a statement
  // rather than body copy — the same lead scale "beside" uses, minus the italic.
  const whatThisIsLead = initiative.whatThisIsLayout === "stackedLead";
  // "imageBeside": heading across the top, image left, body + button right, on
  // the deeper blue band so it separates from the pale sections around it.
  const whatThisIsImageBeside = initiative.whatThisIsLayout === "imageBeside";
  const whatThisIsImg = resolveImage(
    initiative.whatThisIsImage ?? initiative.coverImage,
    { width: 1200 },
  );
  const whatThisIsImageSrc = whatThisIsImg?.src ?? mediaImageSrc(buildingMedia);
  const whatThisIsImageAlt = whatThisIsImg?.alt ?? buildingMedia?.alt ?? "";
  const whatThisIsCta = {
    label: initiative.whatThisIsCta?.label || "Partner With BPI",
    href: initiative.whatThisIsCta?.href || "/contact",
  };

  // Phased Approach + Strategic Relevance — a toggleable dark band.
  const phases = (initiative.phases ?? []).filter((p) => p.title || p.body);
  const showPhases =
    !!initiative.showPhases &&
    (phases.length > 0 || !!initiative.relevanceBody);
  const phasesImg = resolveImage(
    initiative.phasesImage ?? initiative.coverImage,
    { width: 2000 },
  );
  const relevanceCta = {
    label: initiative.relevanceCta?.label || "Partner With BPI",
    href: initiative.relevanceCta?.href || "/contact",
  };

  // Key Developments — a toggleable light-blue section (image + bullet list).
  const developmentBullets = (initiative.developmentsBody ?? "")
    .split(/\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  const developmentsImg = resolveImage(initiative.developmentsImage, {
    width: 1200,
  });
  const developmentsImageSrc =
    developmentsImg?.src ?? mediaImageSrc(buildingMedia);
  const developmentsImageAlt = developmentsImg?.alt ?? buildingMedia?.alt ?? "";
  const developmentsCta = {
    label: initiative.developmentsCta?.label || "Partner With BPI",
    href: initiative.developmentsCta?.href || "/contact",
  };
  const showDevelopments =
    !!initiative.showDevelopments && developmentBullets.length > 0;
  // "imageBelow" pairs the heading with the bullets and drops a wide image
  // under both; "noImage" is the same pair with the image dropped entirely;
  // absent/anything else keeps the original tall-image-beside grid.
  const developmentsImageBelow = initiative.developmentsLayout === "imageBelow";
  const developmentsNoImage = initiative.developmentsLayout === "noImage";

  // Next Steps — a toggleable card in the page colour, on the same light-blue
  // band as Key Developments (bullets, one per line).
  const nextStepsBullets = (initiative.nextStepsBody ?? "")
    .split(/\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  const nextStepsCta = {
    label: initiative.nextStepsCta?.label || "Partner With BPI",
    href: initiative.nextStepsCta?.href || "/contact",
  };
  const showNextSteps =
    !!initiative.showNextSteps && nextStepsBullets.length > 0;
  const showNextStepsCta = initiative.showNextStepsCta !== false;

  // Financing Approach — a toggleable card in the page colour: heading left;
  // body + button, a rule, an italic quote and an attribution (photo, name,
  // role, socials) right.
  const financingCta = {
    label: initiative.financingCta?.label || "Partner With BPI",
    href: initiative.financingCta?.href || "/contact",
  };
  const showFinancingCta = initiative.showFinancingCta !== false;
  const financingImg = resolveImage(initiative.financingImage, { width: 240 });
  const financingSocials = initiative.financingSocials ?? [];
  const showFinancing =
    !!initiative.showFinancing &&
    (!!initiative.financingBody || !!initiative.financingQuote);

  // Roadmap — a toggleable mid-blue band closing the story: eyebrow + heading
  // left; a single italic statement, a button and a wide image right. Unrelated
  // to the `outlook*` note that closes Current Status.
  const roadmapImg = resolveImage(
    initiative.roadmapImage ?? initiative.coverImage,
    { width: 1200 },
  );
  const roadmapCta = {
    label: initiative.roadmapCta?.label || "Partner With BPI",
    href: initiative.roadmapCta?.href || "/contact",
  };
  const showRoadmap =
    !!initiative.showRoadmap &&
    (!!initiative.roadmapHeading || !!initiative.roadmapStatement);

  // "Why Barbados" + Ecosystem Approach — a toggleable pale-blue section: a
  // heading + bullets, then a wide image sitting flush on a navy panel.
  const whyBarbadosBullets = (initiative.whyBarbadosBody ?? "")
    .split(/\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  const whyBarbadosImg = resolveImage(
    initiative.whyBarbadosImage ?? initiative.coverImage,
    { width: 1800 },
  );
  const whyBarbadosCta = {
    label: initiative.whyBarbadosCta?.label || "Partner With BPI",
    href: initiative.whyBarbadosCta?.href || "/contact",
  };
  const ecosystemCta = {
    label: initiative.ecosystemCta?.label || "Partner With BPI",
    href: initiative.ecosystemCta?.href || "/contact",
  };
  const showWhyBarbados =
    !!initiative.showWhyBarbados &&
    (whyBarbadosBullets.length > 0 || !!initiative.ecosystemBody);

  // "Current Status" + the closing "Next Steps" note — a toggleable pale-blue
  // band: image left, lead + detail + buttons right, then a large italic note.
  const currentStatusImg = resolveImage(
    initiative.currentStatusImage ?? initiative.coverImage,
    { width: 1400 },
  );
  const currentStatusPrimaryCta = {
    label: initiative.currentStatusPrimaryCta?.label || "Partner with us",
    href: initiative.currentStatusPrimaryCta?.href || "/contact",
  };
  const currentStatusSecondaryCta = initiative.currentStatusSecondaryCta?.label
    ? {
        label: initiative.currentStatusSecondaryCta.label,
        href: initiative.currentStatusSecondaryCta.href || "#",
      }
    : null;
  const showCurrentStatus =
    !!initiative.showCurrentStatus &&
    (!!initiative.currentStatusLead || !!initiative.outlookBody);

  // The standard body/quote/why-matters/careers blocks below the custom
  // sections. Absent (legacy docs) → still shown; only an explicit false hides
  // them, so the page can end at the custom sections.
  const showDefaultSections = initiative.showDefaultSections !== false;

  return (
    <main className="bg-error-25">
      {/* Recolour the shared footer + brand accents (footer text, Subscribe
          button, nav menu button) to match this page (SSR-safe, no flash).
          Falls back to brand teal/green on every other page. */}
      <style>{`:root{--footer-bg:${base};--brand-accent:#ABE8FE;--brand-accent-strong:${quoteBg};}`}</style>
      {/* Header — the "Type 1" title + tall-image layout, the "Type 2" split
          title lockup, the "Type 3" copy-top / big-title-bottom layout, or the
          default royal-blue editorial hero (two-tone title left, excerpt + CTAs
          right, then a full-bleed cover image flush to the bottom). */}
      {isType1Header ? (
        <InitiativeHeaderType1
          title={headerTitle}
          subtitle={headerSubtitle}
          imageSrc={headerImageSrc}
          imageAlt={headerImageAlt}
          base={base}
          primaryCta={headerPrimaryCta}
          secondaryCta={headerSecondaryCta}
        />
      ) : isType2Header ? (
        <InitiativeHeaderType2
          title={headerTitle}
          titleTail={initiative.headerTitleTail}
          subtitle={headerSubtitle}
          imageSrc={headerImageSrc}
          imageAlt={headerImageAlt}
          base={base}
          primaryCta={headerPrimaryCta}
          secondaryCta={headerSecondaryCta}
        />
      ) : isType3Header ? (
        <InitiativeHeaderType3
          title={headerTitle}
          subtitle={headerSubtitle}
          imageSrc={headerImageSrc}
          imageAlt={headerImageAlt}
          base={base}
          primaryCta={headerPrimaryCta}
          secondaryCta={headerSecondaryCta}
        />
      ) : isType4Header ? (
        <InitiativeHeaderType4
          eyebrow={headerTitle}
          headline={headerSubtitle}
          imageSrc={headerImageSrc}
          imageAlt={headerImageAlt}
          base={base}
          accent={heroAccent}
        />
      ) : (
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        className="relative overflow-hidden"
        style={{ backgroundColor: base }}
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
        <GridHoverBackdrop />

        {/* Top band — title left, excerpt + CTAs right. */}
        <div className="relative px-6 md:px-10 lg:px-14 pt-24 md:pt-28 lg:pt-28 pb-10 md:pb-14 lg:pb-16">
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
      )}

      {/* "Why Barbados" + Ecosystem Approach — toggleable pale-blue section:
          heading + bullets, then a wide image sitting flush on a navy panel
          (both halves of one rounded card). */}
      {showWhyBarbados ? (
        <section
          className="px-6 md:px-10 lg:px-14 py-16 md:py-20 lg:py-24"
          style={{ backgroundColor: sectionBg }}
        >
          <div className="mx-auto max-w-page flex flex-col gap-12 lg:gap-16">
            {whyBarbadosBullets.length > 0 ? (
              <Stagger className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                {initiative.whyBarbadosHeading ? (
                  <StaggerItem
                    as="h2"
                    className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-tight"
                  >
                    {initiative.whyBarbadosHeading}
                  </StaggerItem>
                ) : null}
                <div className="flex flex-col gap-8">
                  <Stagger
                    as="ul"
                    className="flex flex-col gap-4 list-disc list-outside pl-5 marker:text-primary-500/50 text-sm lg:text-base text-primary-500/85 leading-[1.6]"
                  >
                    {whyBarbadosBullets.map((b, i) => (
                      <StaggerItem as="li" key={i} className="pl-1">
                        {b}
                      </StaggerItem>
                    ))}
                  </Stagger>
                  <CtaLink
                    href={whyBarbadosCta.href}
                    className="inline-flex w-fit items-center rounded-round bg-warning-25 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-white"
                  >
                    {whyBarbadosCta.label}
                  </CtaLink>
                </div>
              </Stagger>
            ) : null}

            {/* Wide image + navy panel — one rounded card, image flush on top. */}
            <Reveal
              preset="scale"
              className="overflow-hidden rounded-lg lg:rounded-xl"
            >
              {whyBarbadosImg ? (
                <div className="relative aspect-video lg:aspect-2/1 w-full">
                  <Image
                    src={whyBarbadosImg.src}
                    alt={whyBarbadosImg.alt}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              {initiative.ecosystemHeading || initiative.ecosystemBody ? (
                <div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 px-6 md:px-10 lg:px-12 py-10 md:py-12 lg:py-14"
                  style={{ backgroundColor: base }}
                >
                  {initiative.ecosystemHeading ? (
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
                      {initiative.ecosystemHeading}
                    </h2>
                  ) : null}
                  <div className="flex flex-col gap-8">
                    {initiative.ecosystemBody ? (
                      <PortableTextBody
                        value={initiative.ecosystemBody}
                        paragraphClassName="text-base lg:text-lg text-white/85 leading-[1.6]"
                      />
                    ) : null}
                    <CtaLink
                      href={ecosystemCta.href}
                      className="inline-flex w-fit items-center rounded-round bg-warning-25 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-white"
                    >
                      {ecosystemCta.label}
                    </CtaLink>
                  </div>
                </div>
              ) : null}
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* "Current Status" + the closing "Next Steps" note — toggleable pale-blue
          band: heading, image left / lead + detail + buttons right, then a
          quiet closing note in large italic type. */}
      {showCurrentStatus ? (
        <section
          className="px-6 md:px-10 lg:px-14 py-16 md:py-20 lg:py-24"
          style={{ backgroundColor: sectionBg }}
        >
          <div className="mx-auto max-w-page">
            {initiative.currentStatusLead ? (
              <Stagger className="flex flex-col gap-10 lg:gap-14">
                {initiative.currentStatusHeading ? (
                  <StaggerItem
                    as="h2"
                    className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-tight"
                  >
                    {initiative.currentStatusHeading}
                  </StaggerItem>
                ) : null}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-start">
                  {currentStatusImg ? (
                    <StaggerItem
                      preset="scale"
                      className="relative aspect-3/2 w-full overflow-hidden rounded-lg lg:rounded-xl bg-primary-500/5"
                    >
                      <Image
                        src={currentStatusImg.src}
                        alt={currentStatusImg.alt}
                        fill
                        sizes="(min-width: 1024px) 45vw, 100vw"
                        className="object-cover"
                      />
                    </StaggerItem>
                  ) : null}
                  <div className="flex flex-col gap-6">
                    <StaggerItem
                      as="p"
                      className="font-display text-xl md:text-2xl lg:text-[28px] font-semibold text-primary-500 leading-[1.3] tracking-[-0.01em] balance-text"
                    >
                      {initiative.currentStatusLead}
                    </StaggerItem>
                    {initiative.currentStatusBody ? (
                      <StaggerItem
                        as="div"
                        className="text-sm lg:text-[15px] text-primary-500/75 leading-[1.7]"
                      >
                        <PortableTextBody
                          value={initiative.currentStatusBody}
                          paragraphClassName="text-sm lg:text-[15px] text-primary-500/75 leading-[1.7]"
                        />
                      </StaggerItem>
                    ) : null}
                    <StaggerItem className="flex flex-wrap items-center gap-3 pt-2">
                      <CtaLink
                        href={currentStatusPrimaryCta.href}
                        className="inline-flex items-center rounded-round px-6 py-2.5 text-sm font-semibold text-white transition-opacity duration-300 ease-(--ease-premium) hover:opacity-85"
                        style={{ backgroundColor: base }}
                      >
                        {currentStatusPrimaryCta.label}
                      </CtaLink>
                      {currentStatusSecondaryCta ? (
                        <CtaLink
                          href={currentStatusSecondaryCta.href}
                          className="inline-flex items-center rounded-round border border-primary-500/25 bg-white px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:border-primary-500/50"
                        >
                          {currentStatusSecondaryCta.label}
                        </CtaLink>
                      ) : null}
                    </StaggerItem>
                  </div>
                </div>
              </Stagger>
            ) : null}

            {/* Closing note — heading left, one large italic paragraph right. */}
            {initiative.outlookBody ? (
              <Stagger
                className={`grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-16 items-start ${
                  initiative.currentStatusLead ? "mt-20 lg:mt-28" : ""
                }`}
              >
                {initiative.outlookHeading ? (
                  <StaggerItem
                    as="h2"
                    className="lg:col-span-1 font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-tight"
                  >
                    {initiative.outlookHeading}
                  </StaggerItem>
                ) : null}
                <StaggerItem
                  as="p"
                  className="lg:col-span-2 font-display text-2xl md:text-3xl lg:text-[32px] italic text-primary-500/55 leading-[1.45] tracking-[-0.01em]"
                >
                  {initiative.outlookBody}
                </StaggerItem>
              </Stagger>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* "What This Is" + Key Metrics — toggleable white section. Four layouts,
          picked per initiative (whatThisIsLayout): the heading stacks above the
          body full-width at body-copy size ("stacked") or at lead size
          ("stackedLead"), sits left of a large italic lead ("beside"), or tops
          an image + body pair on the deeper band ("imageBeside"). */}
      {showWhatThisIs ? (
        <section
          className={`px-6 md:px-10 lg:px-14 py-16 md:py-20 lg:py-24 ${
            whatThisIsImageBeside ? "" : "bg-white"
          }`}
          style={
            whatThisIsImageBeside ? { backgroundColor: accentBg } : undefined
          }
        >
          <div className="mx-auto max-w-page">
            {whatThisIsImageBeside ? (
              <Stagger className="flex flex-col gap-8 lg:gap-10">
                {initiative.whatThisIsHeading ? (
                  <StaggerItem
                    as="h2"
                    className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-tight"
                  >
                    {initiative.whatThisIsHeading}
                  </StaggerItem>
                ) : null}
                <div className="grid grid-cols-1 lg:grid-cols-[0.42fr_0.58fr] gap-8 lg:gap-16 items-start">
                  {whatThisIsImageSrc ? (
                    <StaggerItem
                      preset="scale"
                      className="relative aspect-4/3 w-full overflow-hidden rounded-sm bg-white/40"
                    >
                      <Image
                        src={whatThisIsImageSrc}
                        alt={whatThisIsImageAlt}
                        fill
                        sizes="(min-width: 1024px) 42vw, 100vw"
                        className="object-cover"
                      />
                    </StaggerItem>
                  ) : null}
                  <div className="flex flex-col gap-5">
                    {whatThisIsParagraphs.map((p, i) => (
                      <StaggerItem
                        as="p"
                        key={i}
                        className="text-sm lg:text-base text-primary-500/85 leading-[1.75]"
                      >
                        {p}
                      </StaggerItem>
                    ))}
                    <StaggerItem className="pt-2">
                      <CtaLink
                        href={whatThisIsCta.href}
                        className="inline-flex w-fit items-center rounded-round bg-white px-6 py-2.5 text-sm font-semibold text-primary-500 transition-opacity duration-300 ease-(--ease-premium) hover:opacity-90"
                      >
                        {whatThisIsCta.label}
                      </CtaLink>
                    </StaggerItem>
                  </div>
                </div>
              </Stagger>
            ) : whatThisIsParagraphs.length > 0 ? (
              <Stagger
                className={
                  whatThisIsBeside
                    ? "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start"
                    : "flex flex-col gap-5"
                }
              >
                {initiative.whatThisIsHeading ? (
                  <StaggerItem
                    as="h2"
                    className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-tight"
                  >
                    {initiative.whatThisIsHeading}
                  </StaggerItem>
                ) : null}
                {whatThisIsBeside ? (
                  <div className="flex flex-col gap-5">
                    {whatThisIsParagraphs.map((p, i) => (
                      <StaggerItem
                        as="p"
                        key={i}
                        className="text-lg md:text-xl lg:text-2xl italic text-primary-500/60 leading-normal tracking-[-0.01em]"
                      >
                        {p}
                      </StaggerItem>
                    ))}
                  </div>
                ) : (
                  whatThisIsParagraphs.map((p, i) => (
                    <StaggerItem
                      as="p"
                      key={i}
                      className={
                        whatThisIsLead
                          ? "max-w-5xl text-lg md:text-xl lg:text-2xl text-primary-500/60 leading-relaxed tracking-[-0.01em]"
                          : "max-w-4xl text-base lg:text-lg text-primary-500/85 leading-[1.75]"
                      }
                    >
                      {p}
                    </StaggerItem>
                  ))
                )}
              </Stagger>
            ) : null}

            {keyMetrics.length > 0 ? (
              <div className="mt-14 lg:mt-20">
                {initiative.metricsHeading ? (
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-tight">
                    {initiative.metricsHeading}
                  </h2>
                ) : null}
                <Stagger
                  as="dl"
                  className="mt-8 lg:mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8"
                >
                  {keyMetrics.map((m, i) => (
                    <StaggerItem
                      key={i}
                      className={`flex flex-col gap-2 lg:px-6 lg:first:pl-0 ${
                        i > 0 ? "lg:border-l lg:border-primary-500/15" : ""
                      }`}
                    >
                      <dt className="font-display text-xl lg:text-[22px] font-bold text-primary-500 leading-tight tracking-tight">
                        {m.value}
                        {m.note ? (
                          <span className="ml-0.5 align-baseline text-[10px] font-normal text-primary-500/55">
                            {m.note}
                          </span>
                        ) : null}
                      </dt>
                      {m.label ? (
                        <dd className="text-xs lg:text-sm text-primary-500/70 leading-snug">
                          {m.label}
                        </dd>
                      ) : null}
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Key Developments — toggleable light-blue section. Two layouts, picked
          per initiative (developmentsLayout): the heading either spans the top
          with a tall image beside the bullets, or sits beside the bullets with
          a wide image under both. */}
      {showDevelopments ? (
        <section
          className={`px-6 md:px-10 lg:px-14 pt-16 md:pt-20 lg:pt-24 ${
            // Next Steps docks under this section's image — drop the bottom
            // padding so the two read as one stacked block. With no image the
            // section ends on the button instead, which the card would collide
            // with, so keep the normal spacing there.
            showNextSteps && !developmentsNoImage
              ? "pb-0"
              : "pb-16 md:pb-20 lg:pb-24"
          }`}
          style={{ backgroundColor: sectionBg }}
        >
          {(() => {
            const heading = initiative.developmentsHeading ? (
              <Stagger
                as="h2"
                className="font-display text-3xl md:text-4xl font-bold text-primary-500 leading-tight tracking-tight"
              >
                {initiative.developmentsHeading}
              </Stagger>
            ) : null;

            const bullets = (
              <div className="flex flex-col gap-8">
                <Stagger
                  as="ul"
                  className="flex flex-col gap-4 list-disc list-outside pl-5 marker:text-primary-500/50 text-base lg:text-lg text-primary-500/85 leading-[1.6]"
                >
                  {developmentBullets.map((b, i) => (
                    <StaggerItem as="li" key={i} className="pl-1">
                      {b}
                    </StaggerItem>
                  ))}
                </Stagger>
                <CtaLink
                  href={developmentsCta.href}
                  className="inline-flex w-fit items-center rounded-round bg-warning-25 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-white"
                >
                  {developmentsCta.label}
                </CtaLink>
              </div>
            );

            const image = (className: string, sizes: string) =>
              developmentsImageSrc ? (
                <Reveal
                  preset="scale"
                  className={`relative w-full overflow-hidden rounded-lg lg:rounded-xl bg-primary-500/5 ${className}`}
                >
                  <Image
                    src={developmentsImageSrc}
                    alt={developmentsImageAlt}
                    fill
                    sizes={sizes}
                    className="object-cover"
                  />
                </Reveal>
              ) : null;

            if (developmentsImageBelow || developmentsNoImage) {
              return (
                <div className="mx-auto max-w-page flex flex-col gap-10 lg:gap-14">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                    {heading}
                    {bullets}
                  </div>
                  {developmentsNoImage
                    ? null
                    : image("aspect-4/3 sm:aspect-video", "100vw")}
                </div>
              );
            }

            return (
              <div className="mx-auto max-w-page grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
                {/* Left — heading with a narrow portrait image beneath it,
                    left-aligned so a gap opens in the middle before the
                    right-hand text. The image fills the space under the heading,
                    so the column matches the bullets' height and the heading
                    top-aligns with the right-hand content. */}
                <div className="flex flex-col gap-8 lg:gap-10">
                  {heading}
                  {image(
                    "max-lg:aspect-square lg:flex-1 lg:min-h-0 lg:max-w-sm",
                    "(min-width: 1024px) 24rem, 100vw",
                  )}
                </div>
                {bullets}
              </div>
            );
          })()}
        </section>
      ) : null}

      {/* Next Steps — toggleable card in the page colour: heading left, bullets
          + optional button right. Same light-blue band as Key Developments, and
          when that section is on with an image this drops its top padding so
          the card docks straight under that image. */}
      {showNextSteps ? (
        <section
          className={`px-6 md:px-10 lg:px-14 pb-16 md:pb-20 lg:pb-24 ${
            showDevelopments && !developmentsNoImage
              ? "pt-2"
              : "pt-16 md:pt-20 lg:pt-24"
          }`}
          style={{ backgroundColor: sectionBg }}
        >
          <div
            className="mx-auto max-w-page rounded-lg lg:rounded-xl px-6 md:px-10 lg:px-14 py-12 md:py-14 lg:py-16"
            style={{ backgroundColor: base }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
              {initiative.nextStepsHeading ? (
                <Stagger
                  as="h2"
                  className="font-display text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight"
                >
                  {initiative.nextStepsHeading}
                </Stagger>
              ) : null}
              <div className="flex flex-col gap-10">
                <Stagger
                  as="ul"
                  className="flex flex-col gap-4 list-disc list-outside pl-5 marker:text-white/50 text-base lg:text-lg text-white/80 leading-[1.6]"
                >
                  {nextStepsBullets.map((b, i) => (
                    <StaggerItem as="li" key={i} className="pl-1">
                      {b}
                    </StaggerItem>
                  ))}
                </Stagger>
                {showNextStepsCta ? (
                  <CtaLink
                    href={nextStepsCta.href}
                    className="inline-flex w-fit items-center rounded-round bg-warning-25 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-white"
                  >
                    {nextStepsCta.label}
                  </CtaLink>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Financing Approach — toggleable card in the page colour: heading left;
          body + button, a rule, an italic quote and an attribution (photo, name,
          role, social links) right. */}
      {showFinancing ? (
        <section
          className="px-6 md:px-10 lg:px-14 pt-16 md:pt-20 lg:pt-24 pb-16 md:pb-20 lg:pb-24"
          style={{ backgroundColor: sectionBg }}
        >
          <div
            className="mx-auto max-w-page rounded-lg lg:rounded-xl px-6 md:px-10 lg:px-14 py-12 md:py-14 lg:py-16"
            style={{ backgroundColor: base }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
              {initiative.financingHeading ? (
                <Stagger
                  as="h2"
                  className="font-display text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight"
                >
                  {initiative.financingHeading}
                </Stagger>
              ) : null}

              <Stagger className="flex flex-col gap-8">
                {initiative.financingBody ? (
                  <StaggerItem
                    as="div"
                    className="text-base lg:text-lg text-white/80 leading-relaxed"
                  >
                    <PortableTextBody
                      value={initiative.financingBody}
                      paragraphClassName="text-base lg:text-lg text-white/80 leading-relaxed"
                    />
                  </StaggerItem>
                ) : null}

                {showFinancingCta ? (
                  <StaggerItem>
                    <CtaLink
                      href={financingCta.href}
                      className="inline-flex w-fit items-center rounded-round bg-warning-25 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-white"
                    >
                      {financingCta.label}
                    </CtaLink>
                  </StaggerItem>
                ) : null}

                {initiative.financingQuote ? (
                  <StaggerItem className="flex flex-col gap-8">
                    <div className="mt-2 w-full border-t border-white/15" />
                    <blockquote className="text-sm md:text-base italic text-white/70 leading-relaxed">
                      &ldquo;
                      <PortableTextBody
                        value={initiative.financingQuote}
                        compact
                        className="inline"
                        paragraphClassName="inline"
                      />
                      &rdquo;
                    </blockquote>

                    {financingImg || initiative.financingName ? (
                      <div className="flex items-center gap-5">
                        {financingImg ? (
                          <div className="relative size-16 md:size-20 shrink-0 overflow-hidden rounded-full bg-white/10">
                            <Image
                              src={financingImg.src}
                              alt={financingImg.alt}
                              fill
                              sizes="80px"
                              className="object-cover object-top"
                            />
                          </div>
                        ) : null}
                        <div>
                          {initiative.financingName ? (
                            <p className="font-display text-base md:text-lg font-bold text-white leading-tight">
                              {initiative.financingName}
                            </p>
                          ) : null}
                          {initiative.financingRole ? (
                            <p className="mt-1 text-sm md:text-base text-white/55">
                              {initiative.financingRole}
                            </p>
                          ) : null}
                          {financingSocials.length > 0 ? (
                            <div className="mt-4 flex items-center gap-2.5">
                              {financingSocials.map((s) => (
                                <a
                                  key={s.kind + s.href}
                                  href={s.href}
                                  aria-label={s.label ?? s.kind}
                                  className="inline-flex size-9 items-center justify-center rounded-full border border-dashed border-white/40 text-white/70 transition-colors hover:border-white/75 hover:text-white"
                                >
                                  <SocialIcon kind={s.kind} />
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </StaggerItem>
                ) : null}
              </Stagger>
            </div>
          </div>
        </section>
      ) : null}

      {/* Roadmap — toggleable mid-blue band closing the story: eyebrow +
          heading left; a single italic statement over a rule, then the button
          and a wide image, right. The button fills with the page colour — the
          light-blue pill used elsewhere would disappear on this band. */}
      {showRoadmap ? (
        <section
          className="px-6 md:px-10 lg:px-14 py-16 md:py-20 lg:py-24"
          style={
            { backgroundColor: accentBg, "--ink": base } as React.CSSProperties
          }
        >
          <div className="mx-auto max-w-page grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <Stagger className="flex flex-col gap-2">
              {initiative.roadmapEyebrow ? (
                <StaggerItem
                  as="p"
                  className="text-xs lg:text-sm text-primary-500/70"
                >
                  {initiative.roadmapEyebrow}
                </StaggerItem>
              ) : null}
              {initiative.roadmapHeading ? (
                <StaggerItem
                  as="h2"
                  className="font-display text-xl md:text-2xl font-bold text-primary-500 leading-tight tracking-tight"
                >
                  {initiative.roadmapHeading}
                </StaggerItem>
              ) : null}
            </Stagger>

            <Stagger className="flex flex-col gap-6">
              {initiative.roadmapStatement ? (
                <StaggerItem
                  as="p"
                  className="text-xl md:text-2xl italic text-primary-500 leading-normal tracking-[-0.01em]"
                >
                  {initiative.roadmapStatement}
                </StaggerItem>
              ) : null}
              <StaggerItem
                as="div"
                className="w-full border-t border-primary-500/20"
              />
              <CtaLink
                href={roadmapCta.href}
                className="inline-flex w-fit items-center rounded-round bg-(--ink) px-6 py-2.5 text-sm font-semibold text-white transition-opacity duration-300 ease-(--ease-premium) hover:opacity-90"
              >
                {roadmapCta.label}
              </CtaLink>
              {roadmapImg ? (
                <Reveal
                  preset="scale"
                  className="relative mt-2 w-full aspect-4/3 sm:aspect-video overflow-hidden rounded-lg lg:rounded-xl"
                >
                  <Image
                    src={roadmapImg.src}
                    alt={roadmapImg.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </Reveal>
              ) : null}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Phased Approach — dark band: heading, a row of phase cards (colours
          cycle white → light blue → green, same palette as the impact stats), a
          wide image, then the Strategic Relevance closing statement. */}
      {showPhases ? (
        <section
          className="px-6 md:px-10 lg:px-14 py-16 md:py-20 lg:py-24"
          style={{ backgroundColor: base }}
        >
          <div className="mx-auto max-w-page flex flex-col gap-10 lg:gap-14">
            {initiative.phasesHeading ? (
              <Stagger
                as="h2"
                className="font-display text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight"
              >
                {initiative.phasesHeading}
              </Stagger>
            ) : null}

            {phases.length > 0 ? (
              <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {phases.map((ph, i) => (
                  <StaggerItem
                    key={i}
                    className="flex flex-col justify-between gap-10 rounded-lg p-5 lg:p-6 min-h-44 lg:min-h-48"
                    style={{
                      backgroundColor: STAT_PALETTE[i % STAT_PALETTE.length],
                    }}
                  >
                    {ph.title ? (
                      <h3 className="font-display text-lg lg:text-xl font-semibold text-primary-500 leading-tight tracking-tight">
                        {ph.title}
                      </h3>
                    ) : null}
                    {ph.body ? (
                      <PortableTextBody
                        value={ph.body}
                        paragraphClassName="text-xs lg:text-sm text-primary-500/75 leading-relaxed"
                      />
                    ) : null}
                  </StaggerItem>
                ))}
              </Stagger>
            ) : null}

            {phasesImg ? (
              <Reveal
                preset="scale"
                className="relative w-full aspect-4/3 sm:aspect-video lg:aspect-2/1 overflow-hidden rounded-lg lg:rounded-xl bg-white/5"
              >
                <Image
                  src={phasesImg.src}
                  alt={phasesImg.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </Reveal>
            ) : null}

            {initiative.relevanceHeading || initiative.relevanceBody ? (
              <Stagger className="grid grid-cols-1 lg:grid-cols-[0.42fr_0.58fr] gap-6 lg:gap-16 items-start">
                {initiative.relevanceHeading ? (
                  <StaggerItem
                    as="h2"
                    className="font-display text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight"
                  >
                    {initiative.relevanceHeading}
                  </StaggerItem>
                ) : (
                  <span />
                )}
                <div className="flex flex-col gap-6">
                  {initiative.relevanceBody ? (
                    <StaggerItem
                      as="div"
                      className="text-sm lg:text-base text-white/75 leading-[1.75]"
                    >
                      <PortableTextBody
                        value={initiative.relevanceBody}
                        paragraphClassName="text-sm lg:text-base text-white/75 leading-[1.75]"
                      />
                    </StaggerItem>
                  ) : null}
                  <StaggerItem>
                    <CtaLink
                      href={relevanceCta.href}
                      className="inline-flex w-fit items-center rounded-round bg-warning-25 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-white"
                    >
                      {relevanceCta.label}
                    </CtaLink>
                  </StaggerItem>
                </div>
              </Stagger>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Body — two columns: the title (left) and the content (right), with
          the subtitle as a large lead above the smaller body detail. Pale-blue
          background. */}
      {showDefaultSections && (hasBody || initiative.subtitle) ? (
        <section
          className="px-6 md:px-10 lg:px-14 py-16 md:py-20 lg:py-28"
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
      {showDefaultSections && showQuote ? (
        <section
          className="px-6 md:px-10 lg:px-14 py-14 md:py-20 lg:py-24"
          style={{ backgroundColor: quoteBg }}
        >
          <Stagger
            className="mx-auto grid max-w-page grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch"
          >
            {/* Left — supporting note (top), attribution + quote (bottom). */}
            <StaggerItem className="flex flex-col justify-between gap-12 lg:gap-16">
              {initiative.quoteSupporting ? (
                <PortableTextBody
                  value={initiative.quoteSupporting}
                  className="max-w-xs"
                  paragraphClassName="text-sm text-white/55 leading-relaxed"
                />
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
      {showDefaultSections && showWhyMatters ? (
        <section
          className="px-6 md:px-10 lg:px-14 py-14 md:py-20 lg:py-24"
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
                    <PortableTextBody
                      value={initiative.whyMattersBody}
                      className="max-w-3xl"
                      paragraphClassName="text-sm md:text-base text-white/70 leading-relaxed"
                    />
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
                      <PortableTextBody
                        value={initiative.impactBody}
                        className="mt-3"
                        paragraphClassName="text-sm md:text-base text-white/70 leading-relaxed"
                      />
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

      {/* Latest from BPI — newest posts (hides itself when there are none). */}
      {initiative.showBlog ? (
        <BlogSection
          tone="blue"
          heading={homeData?.blogHeading ?? undefined}
          viewAllHref={localizedHref(lang, "/blog")}
          posts={blogPosts}
        />
      ) : null}

      {/* Careers + footer CTA from the Home page, in the blue tone. Each has
          its own toggle so a page can end on either one. */}
      {homeData ? (
        <>
          {initiative.showCareers !== false ? (
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
          ) : null}
          {initiative.showCta !== false ? (
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
          ) : null}
        </>
      ) : null}

    </main>
  );
}
