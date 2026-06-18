import type { Metadata } from "next";
import Image from "next/image";

import BuildingSection from "@/app/components/BuildingSection";
import CareersSection from "@/app/components/CareersSection";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import Logo from "@/app/components/Logo";
import { toLocale } from "@/app/lib/locale";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMedia } from "@/sanity/lib/image";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";
import type { HomePage, ResolvedMedia } from "@/sanity/lib/types";
import EcosystemCarousel, { type EcosystemItem } from "./EcosystemCarousel";

export const metadata: Metadata = {
  title: "Strategic Priorities — BPI",
  description:
    "Our strategic priorities are designed to accelerate industry growth, improve healthcare outcomes, and position Barbados as a leading pharmaceutical hub in the Caribbean.",
};

// Time-based backstop; busted on publish via the revalidate webhook. Added
// now that the page reads the Home document for the careers / CTA sections.
export const revalidate = 3600;

// This page's blue, matching the AMA initiative detail page — drives both the
// careers/CTA section tone and the recoloured footer.
const PAGE_BLUE = "#0B2F64";

// Poster/still for a resolved media object (image src, or a video's poster).
function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}

// Careers + footer-CTA copy is authored on the Home document; reuse it so the
// bottom of this page stays in sync with the rest of the site.
async function getHomePage(lang: string): Promise<HomePage | null> {
  return loadQuery<HomePage | null>(HOME_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.homePage],
  });
}

// Hero portrait. Drop in a real image URL (Sanity CDN or /public asset) and
// it renders; left empty, the hero shows a branded placeholder so the layout
// holds. Kept as a constant so it's a one-line swap later.
const HERO_IMAGE_SRC = "";
const HERO_IMAGE_ALT = "The BPI team";

// Wide image beneath the Strategic Priorities list. Same swap-in convention
// as the hero image — empty renders a branded placeholder.
const PRIORITIES_IMAGE_SRC = "";
const PRIORITIES_IMAGE_ALT = "Pharmaceutical facility equipment";

// Impact stats band.
const STATS: { value: string; label: string }[] = [
  { value: "25+", label: "Strategic Partnerships" },
  { value: "50+", label: "Training & Initiatives" },
  { value: "100+", label: "Professionals Trained" },
  { value: "10+", label: "Innovative Projects" },
  { value: "5+", label: "Market Collaborations" },
];

// The strategic priorities, shown as a numbered index.
const PRIORITY_LIST: string[] = [
  "Advanced Manufacturing",
  "Research & Innovation",
  "Talent Development",
  "Supply Chain Resilience",
  "Strategic Partnerships",
];

// "Our Ecosystem" carousel pillars — the active one drives the large image.
const ECOSYSTEM: EcosystemItem[] = [
  {
    title: "Manufacturing & Production",
    body: "Building world-class pharmaceutical facilities in the Caribbean.",
  },
  {
    title: "Regional Partnerships",
    body: "Connecting CARICOM nations through unified health infrastructure.",
  },
  {
    title: "Innovation Pipeline",
    body: "From lab to market: accelerating Caribbean pharmaceutical breakthroughs.",
  },
];

// "Latest from BPI" — one large feature story + two compact cards. Hrefs are
// locale-prefixed at render. Images use the same empty → placeholder rule.
type NewsCard = {
  title: string;
  tags: string[];
  href: string;
  imageSrc?: string;
  imageAlt?: string;
};
const NEWS_FEATURE: NewsCard & { eyebrow: string } = {
  eyebrow: "Alliance",
  title:
    "First pharmaceutical cargo between Africa and the Caribbean departs Kaduna",
  tags: ["investment", "Partnership"],
  href: "/blog",
};
const NEWS_CARDS: NewsCard[] = [
  {
    title: "BMPRA regulatory framework moves to next phase in partnership with WHO",
    tags: ["investment", "Partnership"],
    href: "/blog",
  },
  {
    title:
      "Queen Elizabeth Hospital receives first shipment from the AMA IV fluids corridor",
    tags: ["investment", "Partnership"],
    href: "/blog",
  },
];

// The critical sectors where BPI creates value, shown as cards.
const VALUE_SECTORS: { title: string; body: string }[] = [
  {
    title: "Pharmaceutical Manufacturing",
    body: "Enhancing production capacity and quality standards.",
  },
  {
    title: "Biotechnology & Research",
    body: "Supporting innovation-driven healthcare solutions.",
  },
  {
    title: "Healthcare Distribution",
    body: "Improving pharmaceutical accessibility and logistics.",
  },
  {
    title: "Education & Workforce",
    body: "Developing the next generation of pharmaceutical professionals.",
  },
];

export default async function PrioritiesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = toLocale(raw);

  const contactHref = `/${lang}/contact`;

  const homeData = await getHomePage(lang);
  const careersMedia = resolveMedia(homeData?.careersImage, { width: 1200 });
  const buildingMedia = resolveMedia(homeData?.buildingImage, { width: 1600 });

  return (
    <main className="relative bg-error-25 overflow-hidden">
      {/* Recolour the shared footer + brand accents to this page's blue
          (SSR-safe, no flash) — matches the AMA initiative detail page. */}
      <style>{`:root{--footer-bg:${PAGE_BLUE};--brand-accent:#ABE8FE;--brand-accent-strong:#0094C9;}`}</style>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        style={{ backgroundColor: "#0B2F64" }}
        className="relative overflow-hidden px-6 md:px-12 lg:px-20 xl:px-28 pt-24 md:pt-28 lg:pt-24 pb-12 md:pb-14 lg:pb-12 lg:min-h-[94vh] lg:flex lg:flex-col"
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
        <GridHoverBackdrop />

        <div className="relative mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 lg:flex-1 lg:min-h-0 lg:items-stretch">
          {/* Left — body + CTA at the top, oversized two-tone headline at the
              bottom of the column. */}
          <div className="flex flex-col justify-between gap-12 lg:gap-8 lg:py-2 lg:min-h-0">
            <div data-reveal-stagger className="flex flex-col gap-7 max-w-md">
              <p className="text-base md:text-lg text-white/70 leading-relaxed">
                Our strategic priorities are designed to accelerate industry
                growth, improve healthcare outcomes, and position Barbados as a
                leading pharmaceutical hub in the Caribbean.
              </p>
              <CtaLink
                href={contactHref}
                className="inline-flex w-fit items-center rounded-round bg-warning-50 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-white"
              >
                Partner With BPI
              </CtaLink>
            </div>

            <h1
              data-reveal-stagger
              className="font-display text-[clamp(2.75rem,6vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.03em]"
            >
              <span className="text-white">Strengthening the</span>{" "}
              <span className="text-warning-50">Pharmaceutical Ecosystem</span>
            </h1>
          </div>

          {/* Right — portrait hero image (or branded placeholder). */}
          <div
            data-reveal="scale"
            className="relative w-full max-lg:aspect-4/5 lg:h-full min-h-0 overflow-hidden rounded-2xl lg:rounded-3xl bg-primary-500"
          >
            {HERO_IMAGE_SRC ? (
              <Image
                src={HERO_IMAGE_SRC}
                alt={HERO_IMAGE_ALT}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                priority
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center"
              >
                <Logo
                  iconOnly
                  size={220}
                  className="text-white/10"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Impact stats ───────────────────────────────────────────── */}
      <section
        data-nav-theme="light"
        className="bg-white px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20 lg:py-24"
      >
        <div className="mx-auto w-full max-w-page">
          <dl
            data-reveal-stagger
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-10"
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col gap-3 lg:px-8 lg:first:pl-0 ${
                  i > 0 ? "lg:border-l lg:border-primary-500/15" : ""
                }`}
              >
                <dt className="font-display text-4xl lg:text-5xl font-bold text-primary-500 leading-none tracking-[-0.02em]">
                  {s.value}
                </dt>
                <dd className="text-sm md:text-base text-primary-500/70">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>

          <div data-reveal-stagger className="mt-16 md:mt-20 max-w-xl">
            <p className="text-base md:text-lg text-primary-500/80 leading-relaxed">
              Our commitment to excellence is reflected in the impact we
              continue to create across the pharmaceutical sector.
            </p>
            <h2 className="mt-5 font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.02em]">
              Advancing Pharmaceutical Excellence
            </h2>
          </div>
        </div>
      </section>

      {/* ── Strategic priorities ───────────────────────────────────── */}
      <section
        data-nav-theme="light"
        style={{ backgroundColor: "#E8F4FC" }}
        className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28"
      >
        <div className="mx-auto w-full max-w-page">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left — heading + intro. */}
            <div data-reveal-stagger className="lg:pt-6">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-tight tracking-[-0.02em]">
                Strategic Priorities
              </h2>
              <p className="mt-6 max-w-md text-base text-primary-500/55 leading-relaxed">
                BPI is focused on four strategic priorities. Each one a
                deliberate step toward a Caribbean that manufactures,
                distributes, and regulates its own medicines.
              </p>
            </div>

            {/* Right — numbered index of priorities. */}
            <ul data-reveal-stagger className="flex flex-col">
              {PRIORITY_LIST.map((item, i) => (
                <li
                  key={item}
                  className="flex items-center justify-between gap-6 border-t border-primary-500/15 py-5 lg:py-6"
                >
                  <span className="text-base md:text-lg font-semibold text-primary-500">
                    {item}
                  </span>
                  <span className="text-sm text-primary-500/60 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Wide facility image (or branded placeholder). */}
          <div
            data-reveal="scale"
            className="mt-12 lg:mt-16 relative w-full max-lg:aspect-video lg:aspect-5/2 overflow-hidden rounded-2xl lg:rounded-3xl bg-primary-500"
          >
            {PRIORITIES_IMAGE_SRC ? (
              <Image
                src={PRIORITIES_IMAGE_SRC}
                alt={PRIORITIES_IMAGE_ALT}
                fill
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center"
              >
                <Logo iconOnly size={200} className="text-white/10" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Creating value across critical sectors ─────────────────── */}
      <section
        data-nav-theme="light"
        style={{ backgroundColor: "#E8F4FC" }}
        className="px-6 md:px-12 lg:px-20 xl:px-28 pb-16 md:pb-24 lg:pb-28"
      >
        <div className="mx-auto w-full max-w-page">
          <div data-reveal-stagger className="max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-[1.1] tracking-[-0.02em] max-w-md">
              Creating Value Across Critical Sectors
            </h2>
            <p className="mt-8 md:mt-10 max-w-md text-base md:text-lg text-primary-500/80 leading-relaxed">
              Producing medicines here, distributing them regionally, and
              building the institutions that make it permanent.
            </p>
          </div>

          <div
            data-reveal-stagger
            className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {VALUE_SECTORS.map((sector, i) => (
              <div
                key={sector.title}
                style={{ backgroundColor: "#BFE4F9" }}
                className="flex flex-col justify-between gap-12 rounded-2xl lg:rounded-3xl p-6 md:p-7 lg:p-8 min-h-64 lg:min-h-72"
              >
                <h3
                  className={`font-display text-xl md:text-2xl font-bold text-primary-500 leading-snug tracking-[-0.01em] ${
                    i === 0
                      ? "underline decoration-2 underline-offset-[6px] decoration-warning-500"
                      : ""
                  }`}
                >
                  {sector.title}
                </h3>
                <p className="text-sm md:text-base text-primary-500/70 leading-relaxed">
                  {sector.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our ecosystem ──────────────────────────────────────────── */}
      <section
        data-nav-theme="light"
        style={{ backgroundColor: "#E8F4FC" }}
        className="px-6 md:px-12 lg:px-20 xl:px-28 pb-16 md:pb-24 lg:pb-28"
      >
        <div className="mx-auto w-full max-w-page">
          <div data-reveal-stagger className="max-w-xl">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-[1.1] tracking-[-0.02em]">
              Our Ecosystem
            </h2>
            <p className="mt-6 md:mt-8 max-w-lg text-base md:text-lg text-primary-500/80 leading-relaxed">
              Pioneering sovereign pharmaceutical infrastructure for the
              Caribbean — building the capabilities we&apos;ve always needed,
              from manufacturing to innovation.
            </p>
          </div>

          <div data-reveal-stagger className="mt-10 md:mt-14">
            <EcosystemCarousel items={ECOSYSTEM} />
          </div>
        </div>
      </section>

      {/* ── What we are building (closing) ─────────────────────────── */}
      <section
        data-nav-theme="dark"
        style={{ backgroundColor: "#0B2F64" }}
        className="relative overflow-hidden px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28 lg:py-32"
      >
        <div className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left — eyebrow + stepped two-tone headline. */}
          <div data-reveal-stagger>
            <span className="text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-white/70">
              What We Are Building
            </span>
            <h2 className="mt-6 font-display text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.12] tracking-[-0.02em]">
              <span className="block text-white">Building the</span>
              <span className="block text-warning-50 lg:ml-20">
                Future of Healthcare
              </span>
            </h2>
          </div>

          {/* Right — body, rule, secondary note, CTA. */}
          <div data-reveal-stagger className="flex flex-col lg:pt-8">
            <p className="text-lg md:text-xl text-white/85 leading-relaxed">
              BPI remains focused on fostering innovation, strengthening
              industry capabilities, and creating long-term value for
              healthcare systems, businesses, and communities. Through strategic
              investment and collaboration, we are helping shape a more resilient
              and competitive pharmaceutical sector for future generations.
            </p>
            <div className="mt-8 h-px w-full bg-white/15" />
            <p className="mt-8 max-w-md text-sm text-white/55 leading-relaxed">
              At BPI, we believe innovation thrives when different perspectives,
              experiences, and ideas come together to shape the future of
              healthcare.
            </p>
            <CtaLink
              href={contactHref}
              className="mt-10 inline-flex w-fit items-center rounded-round bg-warning-50 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-white"
            >
              Partner With BPI
            </CtaLink>
          </div>
        </div>
      </section>

      {/* ── Latest from BPI ────────────────────────────────────────── */}
      <section
        data-nav-theme="light"
        style={{ backgroundColor: "#E8F4FC" }}
        className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28"
      >
        <div className="mx-auto w-full max-w-page">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8 md:mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-[1.05] tracking-[-0.02em]">
              Latest from BPI
            </h2>
            <CtaLink
              href={`/${lang}/blog`}
              className="group inline-flex items-center gap-3 text-sm md:text-base font-medium text-primary-500"
            >
              View all
              <span className="inline-flex size-10 md:size-11 items-center justify-center rounded-full border border-primary-500 transition-colors group-hover:bg-primary-500/5">
                <NewsArrow className="h-4 w-4" />
              </span>
            </CtaLink>
          </div>

          {/* Grid: large feature (2 cols) + two compact cards. */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-5 items-stretch">
            {/* Feature */}
            <CtaLink
              href={`/${lang}${NEWS_FEATURE.href}`}
              className="group relative lg:col-span-2 flex flex-col justify-between overflow-hidden rounded-2xl lg:rounded-3xl bg-primary-500 p-6 md:p-7 lg:p-8 min-h-112 lg:min-h-136 focus-visible:outline-none"
            >
              {NEWS_FEATURE.imageSrc ? (
                <Image
                  src={NEWS_FEATURE.imageSrc}
                  alt={NEWS_FEATURE.imageAlt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : null}
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/30"
              />
              <div className="relative flex flex-wrap gap-2">
                {NEWS_FEATURE.tags.map((t) => (
                  <NewsTag key={t} label={t} dark />
                ))}
              </div>
              <div className="relative flex items-end justify-between gap-4">
                <div className="max-w-md">
                  <div className="text-xs md:text-sm font-bold uppercase tracking-[0.16em] text-white">
                    {NEWS_FEATURE.eyebrow}
                  </div>
                  <p className="mt-3 text-base md:text-lg text-white/90 leading-snug">
                    {NEWS_FEATURE.title}
                  </p>
                </div>
                <NewsCircleArrow />
              </div>
            </CtaLink>

            {/* Compact cards */}
            {NEWS_CARDS.map((card) => (
              <CtaLink
                key={card.title}
                href={`/${lang}${card.href}`}
                style={{ backgroundColor: "#BFE4F9" }}
                className="group lg:col-span-1 flex flex-col rounded-2xl lg:rounded-3xl p-5 md:p-6 focus-visible:outline-none"
              >
                <div className="flex flex-wrap gap-2">
                  {card.tags.map((t) => (
                    <NewsTag key={t} label={t} />
                  ))}
                </div>
                <div className="relative mt-5 aspect-square overflow-hidden rounded-xl lg:rounded-2xl bg-primary-500">
                  {card.imageSrc ? (
                    <Image
                      src={card.imageSrc}
                      alt={card.imageAlt ?? ""}
                      fill
                      sizes="(min-width: 1024px) 25vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Logo iconOnly size={90} className="text-white/10" />
                    </div>
                  )}
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="text-base md:text-lg text-primary-500 leading-snug">
                    {card.title}
                  </p>
                  <NewsCircleArrow />
                </div>
              </CtaLink>
            ))}
          </div>
        </div>
      </section>

      {/* ── Careers + building CTA (blue tone, from the Home document) ─ */}
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

// Tag pill — outlined; `dark` variant sits on the dark feature card.
function NewsTag({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5 ${
        dark
          ? "border-white/50 text-white"
          : "border-primary-500/40 text-primary-500"
      }`}
    >
      {label}
    </span>
  );
}

// White circular arrow badge tucked into the corner of each news card.
function NewsCircleArrow() {
  return (
    <span className="shrink-0 inline-flex size-11 md:size-12 items-center justify-center rounded-full bg-white text-primary-500 shadow-sm transition-transform duration-300 ease-(--ease-premium) group-hover:translate-x-0.5 motion-reduce:transform-none">
      <NewsArrow className="h-5 w-5" />
    </span>
  );
}

function NewsArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
