import type { Metadata } from "next";

import ConvergenceGraphic from "@/app/components/ConvergenceGraphic";
import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import MediaImage from "@/app/components/MediaImage";
import SocialIcon from "@/app/components/SocialIcon";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMedia } from "@/sanity/lib/image";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";
import type { HomePage, SocialLink } from "@/sanity/lib/types";

export const revalidate = 3600;

// Copy is fixed for the launch of the Impact page — there is no dedicated
// Sanity document for it yet. Photography is sourced from the Home page's
// editor-managed assets so nothing is hard-coded to a stale upload until an
// `impactPage` schema exists.
const IMPACT_BODY =
  "There is a woman at a polyclinic pharmacy right now, waiting for the metformin that keeps her diabetes manageable and the amlodipine that keeps her blood pressure from killing her. She does not know that every tablet was made thousands of miles away, shipped across an ocean, and could be stopped at any border, at any time.";

// "Why This Matters" narrative — the two body paragraphs and the pull-quote.
const WHY_BODY_1 =
  "Hypertension and diabetes are the largest share of the Barbados Drug Service's prescription mix. She is not a statistic. She is the entire point of what BPI is building.";
const WHY_BODY_2 =
  "97% of Caribbean medicines are imported. One conflict. One shipping disruption. One policy shift, and patients go without.";
const WHY_QUOTE =
  "We know what it was to have put in orders and paid, and then to be told that the equipment and the ventilators would no longer be delivered because there were export prohibitions under the laws of other countries…";

const WHY_ATTRIBUTION_NAME = "Prime Minister Mia Mottley";
const WHY_ATTRIBUTION_DATE = "November 2023";

// "From dependency to gateway" — three narrative beats beside the
// supply-lines graphic. The middle beat is highlighted as the present-day
// turning point.
const TRAJECTORY_BLOCKS = [
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
] as const;

const DEFAULT_SOCIALS: SocialLink[] = [
  { kind: "Website", href: "https://www.barbadospharmainc.org" },
  { kind: "LinkedIn", href: "#" },
  { kind: "X", href: "#" },
  { kind: "Instagram", href: "https://www.instagram.com/barbadospharmainc" },
];

async function getHomePage(lang: string): Promise<HomePage | null> {
  return loadQuery<HomePage | null>(HOME_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.homePage],
  });
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Impact — BPI",
    description:
      "Behind every prescription filled in the Caribbean is a supply chain that starts an ocean away. BPI is building the infrastructure of care to change that.",
  };
}

export default async function ImpactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const data = await getHomePage(lang);
  const media = resolveMedia(data?.whyImage ?? data?.leaderQuoteImage, {
    width: 1200,
  });
  const portrait = resolveMedia(data?.leaderQuoteImage, { width: 240 });
  const wideMedia = resolveMedia(
    data?.buildingImage ?? data?.architectureFeature,
    { width: 2000 },
  );
  const socials =
    data?.leaderSocials && data.leaderSocials.length > 0
      ? data.leaderSocials
      : DEFAULT_SOCIALS;

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

        <div className="relative flex flex-1 flex-col px-6 md:px-12 lg:px-20 xl:px-28 pt-28 md:pt-32 lg:pt-32 pb-14 md:pb-16 lg:pb-16">
          <div className="mx-auto flex w-full max-w-page flex-1 items-center">
            <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
              {/* Left — display heading, top-aligned with the image. */}
              <Stagger className="lg:col-span-3 lg:self-start">
                <StaggerItem
                  as="h1"
                  className="font-display text-[clamp(3.5rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-error-500"
                >
                  Impact
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
                className="flex flex-col gap-8 lg:col-span-4 lg:justify-end"
              >
                <StaggerItem
                  as="p"
                  className="text-base md:text-lg text-white/70 leading-relaxed max-w-md"
                >
                  {IMPACT_BODY}
                </StaggerItem>
                <StaggerItem>
                  <CtaLink
                    href="/contact"
                    className="group inline-flex w-fit items-center gap-2 rounded-round bg-error-500 pl-6 pr-5 py-3 text-sm font-semibold text-primary-500 transition-all duration-300 ease-(--ease-premium) hover:bg-error-400 hover:shadow-lg hover:shadow-error-500/20"
                  >
                    Partner With BPI
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
        className="bg-error-25 px-6 md:px-12 lg:px-20 xl:px-28 pt-20 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24"
      >
        <Stagger
          className="mx-auto grid max-w-page grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16"
        >
          {/* Left — eyebrow + display heading. */}
          <StaggerItem>
            <p className="text-sm font-medium tracking-[0.14em] text-primary-500/70">
              What We Are Building
            </p>
            <h2 className="mt-4 font-display text-display-xs md:text-display-sm lg:text-display-md font-bold text-primary-500 leading-[1.1] tracking-[-0.02em]">
              Why This
              <br />
              <span className="inline-block pl-16 md:pl-24">Matters</span>
            </h2>
          </StaggerItem>

          {/* Right — body, rule, quote, attribution. */}
          <StaggerItem className="flex flex-col">
            <div className="flex flex-col gap-5 text-base md:text-lg text-primary-500/85 leading-relaxed">
              <p>{WHY_BODY_1}</p>
              <p>{WHY_BODY_2}</p>
            </div>

            <hr className="my-8 md:my-10 border-t border-primary-500/15" />

            <blockquote className="text-base md:text-lg italic text-primary-500/80 leading-relaxed">
              &ldquo;{WHY_QUOTE}&rdquo;
            </blockquote>

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
                  {WHY_ATTRIBUTION_NAME}
                </p>
                <p className="mt-1 text-sm md:text-base text-primary-500/55">
                  {WHY_ATTRIBUTION_DATE}
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
      </section>

      {/* Full-bleed facility image. */}
      {wideMedia ? (
        <section className="bg-error-25 px-6 md:px-12 lg:px-20 xl:px-28 pb-20 md:pb-28 lg:pb-32">
          <Reveal
            preset="scale"
            className="relative mx-auto aspect-2/1 w-full max-w-page overflow-hidden rounded-3xl bg-primary-500/5"
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
        className="bg-error-25 px-6 md:px-12 lg:px-20 xl:px-28 pb-20 md:pb-28 lg:pb-32"
      >
        <div className="mx-auto grid max-w-page grid-cols-1 items-stretch gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          {/* Left — three stacked narrative blocks. */}
          <Stagger className="flex flex-col gap-8 lg:gap-10">
            {TRAJECTORY_BLOCKS.map((block) => (
              <StaggerItem
                key={block.heading}
                className={
                  block.highlight
                    ? "rounded-2xl bg-error-50 px-6 py-6 md:px-8 md:py-8"
                    : ""
                }
              >
                <h3 className="font-display text-lg md:text-xl font-bold text-primary-500 leading-tight">
                  {block.heading}
                </h3>
                <p className="mt-4 text-base md:text-lg text-primary-500/75 leading-relaxed">
                  {block.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Right — supply-lines converging on a single node. */}
          <Reveal
            preset="scale"
            className="relative aspect-4/5 w-full overflow-hidden rounded-xl lg:aspect-auto lg:min-h-130"
            style={{
              background:
                "linear-gradient(160deg, #1c257f 0%, #141b6a 55%, #0d1256 100%)",
            }}
          >
            <ConvergenceGraphic />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
