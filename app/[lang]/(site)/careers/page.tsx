import type { Metadata } from "next";

import CtaLink from "@/app/components/CtaLink";
import MediaImage from "@/app/components/MediaImage";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMedia } from "@/sanity/lib/image";
import {
  ALL_JOBS_QUERY,
  CAREERS_PAGE_QUERY,
} from "@/sanity/lib/queries";
import type { CareersPage, JobSummary } from "@/sanity/lib/types";
import CareersWatermark from "./CareersWatermark";
import JobsSection, { type JobsSectionJob } from "./JobsSection";

export const revalidate = 3600;

// Faint rounded-tile grid drawn behind the dark hero — a single SVG tile
// (108px rounded square inset 2px for the gap) repeated across the section.
const HERO_GRID_TILE =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='112'%20height='112'%3E%3Crect%20x='2'%20y='2'%20width='108'%20height='108'%20rx='14'%20fill='none'%20stroke='%23ffffff'%20stroke-opacity='0.06'%20stroke-width='1'/%3E%3C/svg%3E";

/**
 * Split the hero headline into its first sentence (rendered white) and the
 * remainder (rendered green), matching the "We are hiring. Be Part of our
 * Mission" treatment. Falls back to an all-white headline when there's no
 * sentence break.
 */
function splitHeadline(headline: string): { lead: string; rest: string } {
  const match = headline.match(/^([\s\S]*?[.!?])\s+([\s\S]*)$/);
  if (!match) return { lead: headline, rest: "" };
  return { lead: match[1], rest: match[2] };
}

async function getCareersPage(): Promise<CareersPage | null> {
  return loadQuery<CareersPage | null>(CAREERS_PAGE_QUERY, {
    tags: [TAG.careersPage],
  });
}

async function getAllJobs(): Promise<JobSummary[]> {
  const data = await loadQuery<JobSummary[] | null>(ALL_JOBS_QUERY, {
    tags: [TAG.job],
  });
  return data ?? [];
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getCareersPage();
  return {
    title: data?.seoTitle ?? "Careers — BPI",
    description:
      data?.seoDescription ??
      "We are hiring. Join the team building the Caribbean's pharmaceutical gateway.",
  };
}

export default async function CareersPage() {
  const [data, jobs] = await Promise.all([getCareersPage(), getAllJobs()]);

  if (!data) {
    return <EmptyState />;
  }

  const heroMedia = resolveMedia(data.heroImage, { width: 1800 });
  const whyMedia = resolveMedia(data.whyImage, { width: 1000 });
  const { lead: headlineLead, rest: headlineRest } = splitHeadline(
    data.heroHeadlineLine1,
  );

  const jobsForSection: JobsSectionJob[] = jobs.map((j) => ({
    slug: j.slug,
    title: j.title,
    category: j.category,
    location: j.location,
    schedule: j.schedule,
    summary: j.summary,
  }));

  return (
    <main className="relative bg-error-25 overflow-hidden">
      <CareersWatermark />
      <div className="relative">
        <section
          data-nav-theme="dark"
          className="relative flex flex-col overflow-hidden bg-error-950 lg:h-dvh"
        >
          {/* Faint rounded-tile grid backdrop. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: `url("${HERO_GRID_TILE}")` }}
          />

          {/* Top band — oversized headline (left) + description & CTA (right). */}
          <div className="relative shrink-0 px-6 md:px-12 lg:px-20 xl:px-28 pt-28 md:pt-32 lg:pt-32 pb-8 md:pb-10 lg:pb-12">
            <div className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <h1
                data-reveal-stagger
                className="font-display text-[clamp(2.75rem,5.5vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] max-w-3xl"
              >
                <span className="text-white">{headlineLead}</span>
                {headlineRest ? (
                  <>
                    {" "}
                    <span className="text-error-500">{headlineRest}</span>
                  </>
                ) : null}
              </h1>

              <div
                data-reveal-stagger
                className="flex flex-col gap-6 max-w-sm lg:justify-self-end lg:pt-2"
              >
                <p className="text-base md:text-lg text-white/70 leading-relaxed">
                  {data.heroDescription}
                </p>
                <CtaLink
                  href="/contact"
                  className="inline-flex w-fit items-center rounded-round bg-error-500 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
                >
                  Partner With BPI
                </CtaLink>
              </div>
            </div>
          </div>

          {/* Full-width team image fills the remaining height of the hero. */}
          {heroMedia ? (
            <div
              data-reveal="scale"
              className="relative w-full lg:flex-1 lg:min-h-0"
            >
              <div className="relative w-full aspect-4/3 sm:aspect-video lg:aspect-auto lg:h-full overflow-hidden bg-white/5">
                <MediaImage
                  media={heroMedia}
                  sizes="100vw"
                  preload
                  eager
                />
              </div>
            </div>
          ) : null}
        </section>

        <section
          data-nav-theme="dark"
          className="bg-error-950 px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20 lg:py-16 lg:h-dvh lg:flex lg:flex-col"
        >
          <div className="mx-auto w-full max-w-page flex flex-col lg:flex-1 lg:min-h-0">
            {/* Heading + intro */}
            <div data-reveal-stagger className="shrink-0 flex flex-col gap-3 max-w-2xl">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-error-500 leading-tight tracking-[-0.01em]">
                {data.whyHeading}
              </h2>
              <p className="text-base lg:text-lg text-white/55 leading-relaxed max-w-xl">
                {data.whyIntro}
              </p>
            </div>

            {/* Portrait image (left) + narrative blocks (right). The grid takes
                the remaining height and both columns stretch to match, so the
                image is exactly as tall as the text column. */}
            <div className="mt-10 lg:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-stretch lg:flex-1 lg:min-h-0">
              {whyMedia ? (
                <div
                  data-reveal="scale"
                  className="relative w-full aspect-4/5 lg:aspect-auto lg:h-full rounded-2xl overflow-hidden bg-white/5"
                >
                  <MediaImage
                    media={whyMedia}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                  />
                </div>
              ) : null}

              <div
                data-reveal-stagger
                className="flex flex-col justify-between gap-5 lg:min-h-0"
              >
                {(data.whySections ?? []).map((section, idx) => (
                  <div key={section.heading + idx}>
                    <h3 className="font-display text-base lg:text-lg font-bold text-white leading-snug">
                      {section.heading}
                    </h3>
                    <p className="mt-1.5 text-sm lg:text-[15px] text-white/65 leading-relaxed">
                      {section.body}
                    </p>
                  </div>
                ))}

                {(data.whyBullets?.length ?? 0) > 0 ? (
                  <div>
                    <h3 className="font-display text-base lg:text-lg font-bold text-white leading-snug">
                      {data.whyBulletsHeading}
                    </h3>
                    <ul className="mt-1.5 flex flex-col gap-1 text-sm lg:text-[15px] text-white/65 leading-relaxed list-disc list-outside pl-5 marker:text-error-500">
                      {data.whyBullets.map((bullet, idx) => (
                        <li key={bullet + idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <JobsSection
          jobs={jobsForSection}
          heading={data.jobsHeading}
          description={data.jobsDescription}
          searchPlaceholder={data.jobsSearchPlaceholder ?? undefined}
          findButtonLabel={data.jobsFindButtonLabel ?? null}
          bg={data.jobsBg ?? "#CAF1FF"}
        />
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <main className="bg-error-25 min-h-[60vh] flex items-center justify-center px-5 md:px-20 lg:px-32 py-20">
      <div className="mx-auto max-w-page text-center">
        <h1 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
          Careers page not yet configured
        </h1>
        <p className="mt-4 text-base text-primary-500/75 max-w-xl mx-auto leading-relaxed">
          Open Sanity Studio at <code>/studio</code> and create the
          &ldquo;Careers page&rdquo; document to populate this page.
        </p>
      </div>
    </main>
  );
}
