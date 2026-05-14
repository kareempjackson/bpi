import type { Metadata } from "next";

import MediaImage from "../../components/MediaImage";
import CareerShape from "../../components/shapes/CareerShape";
import { client } from "../../../sanity/lib/client";
import { resolveMedia } from "../../../sanity/lib/image";
import {
  ALL_JOBS_QUERY,
  CAREERS_PAGE_QUERY,
} from "../../../sanity/lib/queries";
import type { CareersPage, JobSummary } from "../../../sanity/lib/types";
import CareersWatermark from "./CareersWatermark";
import JobsSection, { type JobsSectionJob } from "./JobsSection";

export const revalidate = 60;

async function getCareersPage(): Promise<CareersPage | null> {
  return client.fetch<CareersPage | null>(CAREERS_PAGE_QUERY);
}

async function getAllJobs(): Promise<JobSummary[]> {
  const data = await client.fetch<JobSummary[] | null>(ALL_JOBS_QUERY);
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
  const heroImageSrc =
    heroMedia?.kind === "image" ? heroMedia.src : heroMedia?.poster;
  const heroVideoSrc =
    heroMedia?.kind === "video" ? heroMedia.src : undefined;

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
        <section className="px-6 md:px-28 lg:px-44 xl:px-56 pt-14 md:pt-18 lg:pt-20 pb-10 md:pb-14 lg:pb-16">
          {/* Mobile / tablet — stacked. */}
          <div className="lg:hidden mx-auto max-w-page flex flex-col gap-6 md:gap-8">
            <h1 className="font-display text-display-md md:text-display-lg font-semibold text-primary-500 leading-[1.02] tracking-[-0.02em]">
              {data.heroHeadlineLine1}
            </h1>
            {heroMedia ? (
              <div data-reveal="scale">
                <CareerShape
                  size={1200}
                  imageSrc={heroImageSrc}
                  videoSrc={heroVideoSrc}
                  imageAlt={heroMedia.alt}
                  className="w-full h-auto"
                />
              </div>
            ) : null}
            <p className="text-base text-primary-500/85 leading-relaxed max-w-xl">
              {data.heroDescription}
            </p>
          </div>

          {/* Desktop — text inside the CareerShape notches. */}
          <div className="hidden lg:block relative mx-auto max-w-page">
            {heroMedia ? (
              <div data-reveal="scale">
                <CareerShape
                  size={1200}
                  imageSrc={heroImageSrc}
                  videoSrc={heroVideoSrc}
                  imageAlt={heroMedia.alt}
                  className="w-full h-auto block"
                />
              </div>
            ) : null}

            <h1 className="absolute top-[3%] left-0 w-[40%] pr-6 xl:pr-10 font-display text-display-lg xl:text-display-xl font-semibold text-primary-500 leading-[1.02] tracking-[-0.02em]">
              {data.heroHeadlineLine1}
            </h1>

            <p className="absolute bottom-[7%] right-[2%] w-[44%] pl-6 xl:pl-10 text-base xl:text-lg text-primary-500/85 leading-relaxed">
              {data.heroDescription}
            </p>
          </div>
        </section>

        <section className="px-6 md:px-28 lg:px-44 xl:px-56 pb-10 md:pb-14 lg:pb-16">
          <div className="mx-auto max-w-page rounded-3xl bg-white px-7 md:px-14 lg:px-20 py-9 md:py-12 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              {/* Left column — heading, intro, portrait */}
              <div className="flex flex-col gap-6 lg:gap-8">
                <div
                  data-reveal-stagger
                  className="flex flex-col gap-2 max-w-sm"
                >
                  <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.01em]">
                    {data.whyHeading}
                  </h2>
                  <p className="text-sm lg:text-base text-primary-500/65 leading-relaxed">
                    {data.whyIntro}
                  </p>
                </div>

                {whyMedia ? (
                  <div
                    data-reveal="scale"
                    className="relative aspect-4/5 rounded-3xl overflow-hidden"
                  >
                    <MediaImage
                      media={whyMedia}
                      sizes="(min-width: 1024px) 38vw, 100vw"
                    />
                  </div>
                ) : null}
              </div>

              {/* Right column — narrative blocks + bulleted list */}
              <div
                data-reveal-stagger
                className="flex flex-col gap-5 lg:gap-7"
              >
                {(data.whySections ?? []).map((section, idx) => (
                  <div key={section.heading + idx}>
                    <h3 className="font-display text-lg lg:text-xl font-bold text-primary-500 leading-snug">
                      {section.heading}
                    </h3>
                    <p className="mt-2 text-sm lg:text-base text-primary-500/85 leading-relaxed">
                      {section.body}
                    </p>
                  </div>
                ))}

                {(data.whyBullets?.length ?? 0) > 0 ? (
                  <div>
                    <h3 className="font-display text-lg lg:text-xl font-bold text-primary-500 leading-snug">
                      {data.whyBulletsHeading}
                    </h3>
                    <ul className="mt-2 flex flex-col gap-1 text-sm lg:text-base text-primary-500/85 leading-relaxed list-disc list-outside pl-5 marker:text-primary-500">
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
