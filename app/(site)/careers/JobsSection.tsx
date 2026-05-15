"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";

export type JobsSectionJob = {
  slug: string;
  title: string;
  category: string;
  location: string;
  schedule: string;
  summary: string;
};

type Props = {
  jobs?: JobsSectionJob[];
  heading?: string;
  description?: string;
  searchPlaceholder?: string;
  findButtonLabel?: string | null;
  bg?: string;
};

export default function JobsSection({
  jobs = [],
  heading = "Jobs",
  description = "Our approach to innovation and growth is guided by clear priorities that shape impact and direction. Built to strengthen systems, people, and long-term success.",
  searchPlaceholder = "Search",
  findButtonLabel = "Find Job",
  bg = "#CAF1FF",
}: Props) {
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");

  // Derive the filter chips from the jobs that actually exist, in the
  // order they first appear. "All" is always prepended.
  const filters = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const j of jobs) {
      if (!j.category) continue;
      if (seen.has(j.category)) continue;
      seen.add(j.category);
      ordered.push(j.category);
    }
    return ["All", ...ordered];
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (filter !== "All" && job.category !== filter) return false;
      if (!q) return true;
      return (
        job.title.toLowerCase().includes(q) ||
        job.summary.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.schedule.toLowerCase().includes(q)
      );
    });
  }, [jobs, filter, query]);

  return (
    <section className="px-6 md:px-28 lg:px-44 xl:px-56 pb-20 md:pb-28 lg:pb-32">
      <div
        className="mx-auto max-w-page rounded-3xl px-7 md:px-14 lg:px-20 py-9 md:py-12 lg:py-14"
        style={{ backgroundColor: bg }}
      >
        {/* Header */}
        <div className="flex flex-col gap-2 max-w-xl">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.01em]">
            {heading}
          </h2>
          <p className="text-sm lg:text-base text-primary-500/65 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Filter / search / button row */}
        <div className="mt-6 lg:mt-7 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={active}
                  className={`rounded-round px-5 py-2 text-sm lg:text-base font-medium transition-all duration-200 ease-out ${
                    active
                      ? "bg-primary-500 text-white"
                      : "border border-primary-500/35 text-primary-500 hover:border-primary-500/60 hover:bg-primary-500/5"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <div className="flex-1 flex items-center gap-3 lg:ml-auto lg:max-w-sm">
            <label className="flex-1 flex items-center gap-2 rounded-round bg-white px-4 py-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-primary-500/55 shrink-0"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label="Search jobs"
                className="flex-1 bg-transparent outline-none text-sm lg:text-base text-primary-500 placeholder:text-primary-500/50"
              />
            </label>
          </div>

          {findButtonLabel ? (
            <button
              type="button"
              className="shrink-0 rounded-round border border-dashed border-primary-500/45 bg-error-500 px-5 py-2 text-sm lg:text-base font-semibold text-primary-500 transition-all duration-300 ease-[var(--ease-premium)] hover:bg-error-400 hover:border-primary-500/70 active:scale-[0.98] motion-reduce:transform-none"
            >
              {findButtonLabel}
            </button>
          ) : null}
        </div>

        {/* Job listings */}
        <ul className="mt-7 lg:mt-8 flex flex-col divide-y divide-primary-500/15">
          {filtered.length > 0 ? (
            filtered.map((job) => <JobRow key={job.slug} job={job} />)
          ) : (
            <li className="py-8 text-center text-sm text-primary-500/70">
              No roles match your filters yet.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

function JobRow({ job }: { job: JobsSectionJob }) {
  return (
    <li className="py-4 lg:py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      <div className="flex-1 min-w-0">
        <h3 className="text-xl lg:text-2xl font-bold text-primary-500 leading-snug">
          {job.title}
        </h3>
        <p className="mt-1 text-sm lg:text-base text-primary-500/80 leading-relaxed">
          {job.summary}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <Tag icon="pin">{job.location}</Tag>
          <Tag icon="clock">{job.schedule}</Tag>
        </div>
      </div>
      <Link
        href={`/careers/${job.slug}`}
        className="group/apply shrink-0 inline-flex items-center gap-2 text-base lg:text-lg font-semibold text-primary-500 transition-opacity duration-200 hover:opacity-80"
        aria-label={`Apply for ${job.title}`}
      >
        <span className="transition-transform duration-300 ease-[var(--ease-premium)] group-hover/apply:-translate-x-0.5 motion-reduce:transform-none">
          Apply
        </span>
        <ApplyArrow />
      </Link>
    </li>
  );
}

function Tag({ icon, children }: { icon: "pin" | "clock"; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-round border border-primary-500/30 px-3 py-1 text-xs lg:text-sm text-primary-500/85">
      {icon === "pin" ? <PinIcon /> : <ClockIcon />}
      {children}
    </span>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M12 22s-7-7.5-7-13a7 7 0 1 1 14 0c0 5.5-7 13-7 13Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ApplyArrow() {
  return (
    <span className="inline-flex items-center justify-center transition-transform duration-300 ease-[var(--ease-premium)] group-hover/apply:translate-x-0.5 group-hover/apply:-translate-y-0.5 motion-reduce:transform-none">
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
          d="M12 20 L20 12 M20 20 L20 12 L12 12"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
