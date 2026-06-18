import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";

import { client } from "@/sanity/lib/client";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import {
  ALL_JOB_SLUGS_QUERY,
  CAREERS_PAGE_QUERY,
  JOB_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";
import type { CareersPage, Job } from "@/sanity/lib/types";
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
  params: Promise<{ lang: string; slug: string }>;
};

const DEFAULT_APPLY_EMAIL = "hr_bpi@investbarbados.org";

export const revalidate = 3600;

export async function generateStaticParams() {
  // Build-time / static context — can't use loadQuery (it reads draftMode).
  // Tag it so a published job also refreshes the slug list.
  const data = await client.fetch<{ slug: string }[] | null>(
    ALL_JOB_SLUGS_QUERY,
    {},
    { next: { tags: [TAG.job] } },
  );
  return (data ?? []).map((d) => ({ slug: d.slug }));
}

async function getJob(lang: string, slug: string): Promise<Job | null> {
  return loadQuery<Job | null>(JOB_BY_SLUG_QUERY, {
    params: { lang, slug },
    tags: [TAG.job],
  });
}

async function getCareersPage(lang: string): Promise<CareersPage | null> {
  return loadQuery<CareersPage | null>(CAREERS_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.careersPage],
  });
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const job = await getJob(lang, slug);
  if (!job) return { title: "Careers — BPI" };
  return {
    title: `${job.title} — BPI Careers`,
    description: job.summary,
  };
}

export default async function JobDetailPage({ params }: RouteProps) {
  const { lang, slug } = await params;
  const [job, careers] = await Promise.all([
    getJob(lang, slug),
    getCareersPage(lang),
  ]);
  if (!job) notFound();

  const applyHref = job.applyUrl
    ? job.applyUrl
    : `mailto:${job.applyEmail || DEFAULT_APPLY_EMAIL}?subject=Application: ${encodeURIComponent(
        slug,
      )}`;
  const applyExternal = !!job.applyUrl;

  return (
    <main className="relative bg-error-25 overflow-hidden">
      <CareersWatermark />
      <div className="relative">
        <section className="px-6 md:px-12 lg:px-20 xl:px-28 pt-10 md:pt-14 lg:pt-16 pb-20 md:pb-28 lg:pb-32">
          <div className="mx-auto max-w-page">
            {/* Back link */}
            <Link
              href="/careers"
              className="group/back inline-flex items-center gap-2.5 text-sm lg:text-base text-primary-500 transition-opacity duration-200 hover:opacity-80"
            >
              <BackArrow />
              <span className="transition-transform duration-300 ease-[var(--ease-premium)] group-hover/back:translate-x-0.5 motion-reduce:transform-none">
                Back to search result
              </span>
            </Link>

            {/* Title */}
            <h1 className="mt-7 md:mt-9 font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-tight tracking-[-0.02em]">
              {job.title}
            </h1>

            {/* Summary */}
            <div className="mt-6 md:mt-8 max-w-3xl">
              <h2 className="text-sm lg:text-base font-bold text-primary-500 leading-snug">
                Job Summary
              </h2>
              <p className="mt-2.5 text-sm lg:text-base text-primary-500/65 leading-relaxed">
                {job.longSummary}
              </p>
            </div>

            {/* Primary actions */}
            <div className="mt-7 md:mt-9 flex flex-wrap items-center gap-3">
              <SubmitResumeButton href={applyHref} external={applyExternal} />
              <OtherJobsButton />
            </div>

            {/* Detail rows */}
            <div className="mt-10 lg:mt-12 divide-y divide-primary-500/15 border-t border-primary-500/15">
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

            {/* Equal-opportunity statement — dark green block */}
            <div className="mt-12 lg:mt-16 rounded-3xl bg-error-950 px-7 md:px-12 lg:px-16 py-10 md:py-12 lg:py-16">
              <p className="text-sm lg:text-base text-white/70 leading-relaxed">
                {careers?.equalOpportunityParagraph1 ??
                  "Barbados Pharmaceuticals Inc. (BPI) is an equal opportunity employer committed to creating an inclusive and diverse workplace. We celebrate diversity and are dedicated to providing fair employment opportunities to all qualified applicants regardless of background, identity, or personal circumstances."}
              </p>
              {careers?.equalOpportunityParagraph2 ? (
                <p className="mt-4 text-sm lg:text-base text-white/70 leading-relaxed">
                  {careers.equalOpportunityParagraph2}
                </p>
              ) : null}

              <div className="mt-8 lg:mt-10 pt-7 lg:pt-8 border-t border-white/15 flex flex-wrap items-center gap-3">
                <SubmitResumeButton href={applyHref} external={applyExternal} />
                <OtherJobsButton onDark />
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
      <div className="md:col-span-8 lg:col-span-9 text-sm lg:text-base text-primary-500/70 leading-relaxed">
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
      className="rounded-round bg-error-500 px-6 lg:px-7 py-2.5 text-sm lg:text-base font-semibold text-primary-500 transition-all duration-300 ease-[var(--ease-premium)] hover:bg-error-400 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error-500/60"
    >
      Submit Resume
    </a>
  );
}

function OtherJobsButton({ onDark = false }: { onDark?: boolean }) {
  const variant = onDark
    ? "border-white/40 text-white hover:bg-white/10 hover:border-white/70 focus-visible:ring-white/50"
    : "border-primary-500/40 text-primary-500 hover:bg-primary-500/5 hover:border-primary-500/70 focus-visible:ring-primary-500/40";
  return (
    <Link
      href="/careers"
      className={`rounded-round border bg-transparent px-6 lg:px-7 py-2.5 text-sm lg:text-base font-semibold transition-all duration-300 ease-[var(--ease-premium)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variant}`}
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
          strokeWidth="1.25"
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
