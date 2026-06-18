"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Logo from "@/app/components/Logo";
import type { ContentType } from "../blog/types";

export type Publication = {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  slug: string;
  contentType: ContentType;
  /** Drives the bento span + image aspect (grid tabs only). */
  size?: "large" | "small" | "half" | "wide";
  imageSrc?: string;
  imageAlt?: string;
  /** Reports tab only. */
  year?: string;
  /** Reports tab only — e.g. "Annual Report". */
  typeLabel?: string;
};

type TabKey = "publications" | "research" | "reports";

const TABS: { key: TabKey; label: string }[] = [
  { key: "publications", label: "Publications" },
  { key: "research", label: "Research" },
  { key: "reports", label: "Reports" },
];

// Which content types live under each tab. Publications & Research render as the
// bento grid; Reports renders the row list.
const TAB_TYPES: Record<TabKey, ContentType[]> = {
  publications: ["article", "news"],
  research: ["resource"],
  reports: ["report"],
};

const TYPE_LABELS: Record<ContentType, string> = {
  article: "Articles",
  news: "News",
  resource: "Resources",
  report: "Reports",
};

// Column span per card size — md collapses the 12-col bento to a tidy 2-col.
const SPAN: Record<NonNullable<Publication["size"]>, string> = {
  large: "md:col-span-2 lg:col-span-8",
  small: "md:col-span-1 lg:col-span-4",
  half: "md:col-span-1 lg:col-span-6",
  wide: "md:col-span-2 lg:col-span-12",
};

const ASPECT: Record<NonNullable<Publication["size"]>, string> = {
  large: "aspect-video",
  small: "aspect-4/3",
  half: "aspect-video",
  wide: "aspect-video lg:aspect-5/2",
};

export default function PublicationsGrid({
  lang,
  posts,
}: {
  lang: string;
  posts: Publication[];
}) {
  const [tab, setTab] = useState<TabKey>("publications");
  const [query, setQuery] = useState("");
  // Content-type refinement within the active tab. Empty = show all types.
  const [typeFilter, setTypeFilter] = useState<Set<ContentType>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  // The content types available to filter within the current tab.
  const tabTypes = TAB_TYPES[tab];
  const isReports = tab === "reports";

  // Close the filter popover on outside click / Escape.
  useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!filterRef.current?.contains(e.target as Node)) setFilterOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  const selectTab = (next: TabKey) => {
    setTab(next);
    setTypeFilter(new Set()); // filters are scoped per-tab
    setFilterOpen(false);
  };

  const toggleType = (t: ContentType) => {
    setTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const allowed = TAB_TYPES[tab];
    return posts.filter((p) => {
      if (!allowed.includes(p.contentType)) return false;
      if (typeFilter.size > 0 && !typeFilter.has(p.contentType)) return false;
      if (!q) return true;
      return `${p.title} ${p.excerpt} ${p.author}`
        .toLowerCase()
        .includes(q);
    });
  }, [posts, tab, query, typeFilter]);

  return (
    <div>
      {/* Header — tabs (left) + search / filter / find-post controls (right). */}
      <div className="mb-10 md:mb-14 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <nav
          aria-label="Publication categories"
          className="flex items-center gap-7 md:gap-9"
        >
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectTab(key)}
                aria-current={active ? "true" : undefined}
                className={`relative font-display text-2xl md:text-[1.75rem] font-bold tracking-[-0.02em] transition-colors ${
                  active
                    ? "text-primary-500"
                    : "text-primary-500/35 hover:text-primary-500/60"
                }`}
              >
                {label}
                <span
                  aria-hidden
                  className={`absolute -bottom-2 left-0 h-0.5 bg-primary-500 transition-all duration-300 ease-(--ease-premium) ${
                    active ? "w-full opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5 md:gap-3">
          <label className="relative flex-1 lg:flex-none">
            <span className="sr-only">Search</span>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-500/45" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search"
              className="w-full lg:w-56 xl:w-64 rounded-round border border-primary-500/15 bg-white py-2.5 pl-11 pr-4 text-sm text-primary-500 placeholder:text-primary-500/40 outline-none focus:ring-2 focus:ring-error-500/30"
            />
          </label>

          {/* Filter — content-type popover scoped to the active tab. */}
          <div ref={filterRef} className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              aria-expanded={filterOpen}
              aria-haspopup="true"
              className={`inline-flex shrink-0 items-center gap-2 rounded-round border px-4 py-2.5 text-sm font-medium transition-colors ${
                typeFilter.size > 0
                  ? "border-primary-500/40 bg-primary-500/5 text-primary-500"
                  : "border-primary-500/15 bg-white text-primary-500 hover:bg-primary-500/5"
              }`}
            >
              <FilterIcon className="h-4 w-4" />
              Filter
              {typeFilter.size > 0 ? (
                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-error-500 px-1.5 text-[11px] font-semibold text-primary-500">
                  {typeFilter.size}
                </span>
              ) : null}
            </button>

            {filterOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-primary-500/10 bg-white p-2 shadow-xl shadow-primary-500/5">
                <div className="flex items-center justify-between px-2.5 py-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-500/45">
                    Content type
                  </span>
                  {typeFilter.size > 0 ? (
                    <button
                      type="button"
                      onClick={() => setTypeFilter(new Set())}
                      className="text-[11px] font-medium text-error-700 hover:text-error-700/70"
                    >
                      Reset
                    </button>
                  ) : null}
                </div>
                <ul>
                  {tabTypes.map((t) => {
                    const checked = typeFilter.has(t);
                    return (
                      <li key={t}>
                        <button
                          type="button"
                          onClick={() => toggleType(t)}
                          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-primary-500 transition-colors hover:bg-primary-500/5"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                              checked
                                ? "border-error-600 bg-error-500"
                                : "border-primary-500/25"
                            }`}
                          >
                            {checked ? (
                              <CheckIcon className="h-3 w-3 text-primary-500" />
                            ) : null}
                          </span>
                          {TYPE_LABELS[t]}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>

          <span className="hidden md:block h-6 w-px bg-primary-500/15" />

          <button
            type="button"
            className="inline-flex shrink-0 items-center rounded-round bg-error-500 px-5 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
          >
            Find Post
          </button>
        </div>
      </div>

      {/* Body — grid for Publications/Research, row list for Reports. */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-base text-primary-500/55">
          {query
            ? `No ${TABS.find((t) => t.key === tab)?.label.toLowerCase()} match “${query}”.`
            : "Nothing here yet."}
        </p>
      ) : isReports ? (
        <div data-reveal-stagger>
          {filtered.map((post, i) => (
            <ReportRow key={`${post.title}-${i}`} post={post} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-5 gap-y-10 md:gap-y-14">
          {filtered.map((post, i) => (
            <PublicationCard key={`${post.title}-${i}`} post={post} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportRow({ post }: { post: Publication }) {
  return (
    <article className="flex items-start gap-5 md:gap-10 border-b border-primary-500/10 py-7 first:pt-0">
      <span className="shrink-0 w-10 md:w-14 pt-1 font-display text-base md:text-lg font-semibold text-error-700">
        {post.year ?? ""}
      </span>

      <div className="min-w-0 flex-1">
        {post.typeLabel ? (
          <p className="text-sm font-medium text-primary-500/55">
            {post.typeLabel}
          </p>
        ) : null}
        <h3 className="mt-1.5 font-display text-xl md:text-[1.75rem] font-bold leading-snug tracking-[-0.01em] text-primary-500">
          {post.title}
        </h3>
        <p className="mt-2 max-w-prose text-sm md:text-base text-primary-500/60 leading-relaxed">
          {post.excerpt}
        </p>
      </div>

      {/* Placeholder — gating wires to the portal later. */}
      <button
        type="button"
        title="Request access (coming soon)"
        className="mt-1 shrink-0 inline-flex items-center gap-2 rounded-round border border-primary-500/20 bg-white px-4 py-2 text-sm font-medium text-primary-500 transition-colors hover:bg-primary-500/5"
      >
        <LockIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Request Access</span>
      </button>
    </article>
  );
}

function PublicationCard({
  post,
  lang,
}: {
  post: Publication;
  lang: string;
}) {
  const href = `/${lang}/blog${post.slug ? `/${post.slug}` : ""}`;
  const size = post.size ?? "small";
  const isWide = size === "wide";

  return (
    <Link
      href={href}
      className={`group flex flex-col focus-visible:outline-none ${SPAN[size]}`}
    >
      <div
        className={`relative w-full overflow-hidden rounded-2xl lg:rounded-3xl bg-primary-500 ${ASPECT[size]}`}
      >
        {post.imageSrc ? (
          <Image
            src={post.imageSrc}
            alt={post.imageAlt ?? ""}
            fill
            sizes={isWide ? "100vw" : "(min-width: 1024px) 50vw, 100vw"}
            className="object-cover transition-transform duration-500 ease-(--ease-premium) group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
          >
            <Logo iconOnly size={isWide ? 160 : 110} className="text-white/10" />
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-primary-500/50">
        {post.date} by{" "}
        <span className="text-primary-500/75">{post.author}</span>
      </p>

      {!isWide ? (
        <>
          <h3 className="mt-3 font-display text-xl md:text-2xl font-bold text-primary-500 leading-snug tracking-[-0.01em]">
            {post.title}
          </h3>
          <p className="mt-3 max-w-prose text-sm md:text-base text-primary-500/70 leading-relaxed">
            {post.excerpt}
          </p>
        </>
      ) : null}
    </Link>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
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
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
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
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
