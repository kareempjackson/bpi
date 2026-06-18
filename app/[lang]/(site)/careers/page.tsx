import type { Metadata } from "next";

import CtaLink from "@/app/components/CtaLink";
import MediaImage from "@/app/components/MediaImage";
import PageSections from "@/app/components/PageSections";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMedia } from "@/sanity/lib/image";
import {
  ALL_JOBS_QUERY,
  CAREERS_PAGE_QUERY,
} from "@/sanity/lib/queries";
import type {
  CareersPage,
  JobSummary,
} from "@/sanity/lib/types";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import CareersWatermark from "./CareersWatermark";
import JobsSection, { type JobsSectionJob } from "./JobsSection";

export const revalidate = 3600;

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

async function getCareersPage(lang: string): Promise<CareersPage | null> {
  return loadQuery<CareersPage | null>(CAREERS_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.careersPage],
  });
}

async function getAllJobs(lang: string): Promise<JobSummary[]> {
  const data = await loadQuery<JobSummary[] | null>(ALL_JOBS_QUERY, {
    params: { lang },
    tags: [TAG.job],
  });
  return data ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const data = await getCareersPage(lang);
  return {
    title: data?.seoTitle ?? "Careers — BPI",
    description:
      data?.seoDescription ??
      "We are hiring. Join the team building the Caribbean's pharmaceutical gateway.",
  };
}

export default async function CareersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [data, jobs] = await Promise.all([
    getCareersPage(lang),
    getAllJobs(lang),
  ]);

  if (!data) {
    return <EmptyState />;
  }

  const heroMedia = resolveMedia(data.heroImage, { width: 1800 });
  const whyMedia = resolveMedia(data.whyImage, { width: 1000 });
  // Prefer the dedicated highlight field; fall back to splitting the headline
  // for documents authored before that field existed.
  const split = splitHeadline(data.heroHeadlineLine1);
  const headlineLead = data.heroHeadlineHighlight ? data.heroHeadlineLine1 : split.lead;
  const headlineRest = data.heroHeadlineHighlight ?? split.rest;
  // Break the green headline so its final word sits on its own line,
  // matching the "Be Part of our / Mission" treatment.
  const headlineRestLastSpace = headlineRest.trimEnd().lastIndexOf(" ");
  const headlineRestHead =
    headlineRestLastSpace > 0
      ? headlineRest.slice(0, headlineRestLastSpace)
      : "";
  const headlineRestTail =
    headlineRestLastSpace > 0
      ? headlineRest.slice(headlineRestLastSpace + 1)
      : headlineRest;

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
          data-cursor="icon"
          className="relative flex flex-col overflow-hidden bg-error-950 lg:min-h-[90vh]"
        >
          {/* Interactive rounded-tile grid backdrop — tiles light up on hover,
              and the BPI logo mark replaces the cursor across the hero (via the
              global CustomCursor, opted in with data-cursor="icon"). */}
          <GridHoverBackdrop />

          {/* Decorative scroll-down arrow anchored to the bottom-right. */}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute bottom-8 right-6 md:bottom-12 md:right-12 lg:right-20 xl:right-28 h-28 w-28 md:h-44 md:w-44 lg:h-52 lg:w-52 text-error-500/35"
          >
            <path d="M5 5l14 14" />
            <path d="M19 9v10H9" />
          </svg>

          <div className="relative flex flex-1 flex-col px-6 md:px-12 lg:px-20 xl:px-28 pt-16 md:pt-20 lg:pt-20 pb-10 md:pb-12 lg:pb-12">
            <div className="mx-auto flex w-full max-w-page flex-1 flex-col">
              {/* "We are hiring." — white lead headline across the top. */}
              <h1
                data-reveal-stagger
                className="font-display text-[clamp(2.75rem,5.5vw,5rem)] font-semibold leading-[0.92] tracking-[-0.035em] text-white"
              >
                {headlineLead}
              </h1>

              {/* Image (left) + green headline / description / CTA (right). */}
              <div className="mt-6 md:mt-8 grid flex-1 grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-stretch">
                {heroMedia ? (
                  <div
                    data-reveal="scale"
                    className="group relative w-full aspect-4/5 sm:aspect-4/3 lg:aspect-auto lg:h-full rounded-3xl overflow-hidden bg-white/5 ring-1 ring-white/10 shadow-2xl shadow-black/40"
                  >
                    <MediaImage
                      media={heroMedia}
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      preload
                      eager
                    />
                    {/* Subtle gradient to seat the image into the dark canvas. */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-linear-to-t from-error-950/40 via-transparent to-transparent"
                    />
                  </div>
                ) : null}

                <div
                  data-reveal-stagger
                  className="flex flex-col gap-8 lg:justify-between"
                >
                  {headlineRest ? (
                    <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[0.92] tracking-[-0.035em] text-error-500">
                      {headlineRestHead ? (
                        <>
                          {headlineRestHead}
                          <br />
                        </>
                      ) : null}
                      {headlineRestTail}
                    </h2>
                  ) : null}

                  <div className="flex flex-col gap-7 max-w-sm lg:mt-auto">
                    <p className="text-base md:text-lg text-white/65 leading-relaxed">
                      {data.heroDescription}
                    </p>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      <PageSections sections={data.pageSections} />
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
