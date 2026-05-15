import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";

import { client } from "../../../../sanity/lib/client";
import {
  ALL_JOB_SLUGS_QUERY,
  CAREERS_PAGE_QUERY,
  JOB_BY_SLUG_QUERY,
} from "../../../../sanity/lib/queries";
import type { CareersPage, Job } from "../../../../sanity/lib/types";
import CareersWatermark from "../CareersWatermark";

/**
 * Render rules for Portable Text inside a job section. Numbered lists,
 * bulleted lists, bold / italic, and external links all map to clean
 * Tailwind styles matching the rest of the careers page.
 */
const sectionPortableTextComponents: PortableTextComponents = {
  list: {
    number: ({ children }) => (
      <ol className="flex flex-col gap-1.5 list-decimal list-outside pl-5 marker:text-primary-500 marker:font-semibold">
        {children}
      </ol>
    ),
    bullet: ({ children }) => (
      <ul className="flex flex-col gap-1.5 list-disc list-outside pl-5 marker:text-primary-500">
        {children}
      </ul>
    ),
  },
  listItem: {
    number: ({ children }) => <li className="pl-1">{children}</li>,
    bullet: ({ children }) => <li className="pl-1">{children}</li>,
  },
  block: {
    normal: ({ children }) => <p className="leading-relaxed">{children}</p>,
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
          className="underline underline-offset-2 hover:opacity-80"
        >
          {children}
        </a>
      );
    },
  },
};

type RouteProps = {
  params: Promise<{ slug: string }>;
};

const DEFAULT_APPLY_EMAIL = "hr_bpi@investbarbados.org";

export async function generateStaticParams() {
  const data = await client.fetch<{ slug: string }[] | null>(
    ALL_JOB_SLUGS_QUERY,
  );
  return (data ?? []).map((d) => ({ slug: d.slug }));
}

async function getJob(slug: string): Promise<Job | null> {
  return client.fetch<Job | null>(JOB_BY_SLUG_QUERY, { slug });
}

async function getCareersPage(): Promise<CareersPage | null> {
  return client.fetch<CareersPage | null>(CAREERS_PAGE_QUERY);
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: "Careers — BPI" };
  return {
    title: `${job.title} — BPI Careers`,
    description: job.summary,
  };
}

export default async function JobDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const [job, careers] = await Promise.all([getJob(slug), getCareersPage()]);
  if (!job) notFound();

  const applyHref = job.applyUrl
    ? job.applyUrl
    : `mailto:${job.applyEmail || DEFAULT_APPLY_EMAIL}?subject=Application: ${encodeURIComponent(
        slug,
      )}`;
  const applyExternal = !!job.applyUrl;
  const eqOppBg = careers?.equalOpportunityBg ?? "#CAF1FF";

  return (
    <main className="relative bg-error-25 overflow-hidden">
      <CareersWatermark />
      <div className="relative">
        <section className="px-6 md:px-28 lg:px-44 xl:px-56 pt-14 md:pt-18 lg:pt-20 pb-20 md:pb-28 lg:pb-32">
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-primary-500 leading-tight tracking-[-0.02em] mb-8 md:mb-10 lg:mb-12">
            Careers at BPI
          </h1>

          <div className="rounded-3xl bg-white px-6 md:px-12 lg:px-16 py-8 md:py-12 lg:py-14">
            {/* Back link */}
            <Link
              href="/careers"
              className="group/back inline-flex items-center gap-2 text-sm lg:text-base text-primary-500 transition-opacity duration-200 hover:opacity-80"
            >
              <BackArrow />
              <span className="transition-transform duration-300 ease-[var(--ease-premium)] group-hover/back:translate-x-0.5 motion-reduce:transform-none">
                Back to search result
              </span>
            </Link>

            {/* Title */}
            <h2 className="mt-6 md:mt-8 font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.01em]">
              {job.title}
            </h2>

            {/* Summary */}
            <div className="mt-5 md:mt-6 max-w-3xl">
              <h3 className="text-sm lg:text-base font-bold text-primary-500 leading-snug">
                Job Summary
              </h3>
              <p className="mt-2 text-sm lg:text-base text-primary-500/80 leading-relaxed">
                {job.longSummary}
              </p>
            </div>

            {/* Primary actions */}
            <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-3">
              <SubmitResumeButton href={applyHref} external={applyExternal} />
              <OtherJobsButton />
            </div>

            {/* Detail rows */}
            <div className="mt-8 lg:mt-10 divide-y divide-primary-500/15 border-t border-primary-500/15">
              <Row label="Job Description">
                <p>{job.description}</p>
              </Row>
              {(job.sections ?? []).map((section, idx) =>
                section.content && section.content.length > 0 ? (
                  <Row key={section.title + idx} label={section.title}>
                    <PortableText
                      value={section.content}
                      components={sectionPortableTextComponents}
                    />
                  </Row>
                ) : null,
              )}
            </div>

            {/* Equal-opportunity statement */}
            <div
              className="mt-8 lg:mt-10 rounded-2xl px-6 md:px-10 lg:px-12 py-6 md:py-8 lg:py-10"
              style={{ backgroundColor: eqOppBg }}
            >
              <p className="text-sm lg:text-base text-primary-500/85 leading-relaxed">
                {careers?.equalOpportunityParagraph1 ??
                  "Barbados Pharmaceuticals Inc. (BPI) is an equal opportunity employer committed to creating an inclusive and diverse workplace. We celebrate diversity and are dedicated to providing fair employment opportunities to all qualified applicants regardless of background, identity, or personal circumstances."}
              </p>
              {careers?.equalOpportunityParagraph2 ? (
                <p className="mt-3 text-sm lg:text-base text-primary-500/85 leading-relaxed">
                  {careers.equalOpportunityParagraph2}
                </p>
              ) : null}

              <div className="mt-6 lg:mt-8 pt-5 lg:pt-6 border-t border-primary-500/20 flex flex-wrap items-center gap-3">
                <SubmitResumeButton href={applyHref} external={applyExternal} />
                <OtherJobsButton />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 py-6 lg:py-7">
      <div className="md:col-span-4 lg:col-span-3">
        <h3 className="text-sm lg:text-base font-bold text-primary-500 leading-snug">
          {label}
        </h3>
      </div>
      <div className="md:col-span-8 lg:col-span-9 text-sm lg:text-base text-primary-500/85 leading-relaxed">
        {children}
      </div>
    </div>
  );
}


function SubmitResumeButton({
  href,
  external,
}: {
  href: string;
  external: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="rounded-round border border-dashed border-primary-500/45 bg-error-500 px-5 lg:px-6 py-2.5 text-sm lg:text-base font-semibold text-primary-500 transition-all duration-300 ease-[var(--ease-premium)] hover:bg-error-400 hover:border-primary-500/70 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error-500/60"
    >
      Submit Resume
    </a>
  );
}

function OtherJobsButton() {
  return (
    <Link
      href="/careers"
      className="rounded-round border border-dashed border-primary-500/60 bg-transparent px-5 lg:px-6 py-2.5 text-sm lg:text-base font-semibold text-primary-500 transition-all duration-300 ease-[var(--ease-premium)] hover:bg-primary-500/5 hover:border-primary-500/90 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500/40"
    >
      Other Jobs
    </Link>
  );
}

function BackArrow() {
  return (
    <span className="inline-flex items-center justify-center transition-transform duration-300 ease-[var(--ease-premium)] group-hover/back:-translate-x-0.5 motion-reduce:transform-none">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="w-7 h-7 text-primary-500"
        aria-hidden
      >
        <circle
          cx="16"
          cy="16"
          r="15"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <path
          d="M20 16 L12 16 M16 12 L12 16 L16 20"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
