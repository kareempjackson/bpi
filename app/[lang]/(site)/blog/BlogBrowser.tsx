"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import CtaLink from "@/app/components/CtaLink";
import BlogCard from "./BlogCard";
import BlogDatePicker, { type DateRange, ymd } from "./BlogDatePicker";
import {
  type BlogFeatured,
  type BlogPostCard,
  type BlogTag,
  CONTENT_TYPES,
  type ContentType,
  postHref,
} from "./types";

const PAGE_SIZE = 6;

type Props = {
  heading?: string;
  intro?: string;
  featured?: BlogFeatured | null;
  posts: BlogPostCard[];
  tags: BlogTag[];
};

export default function BlogBrowser({
  heading = "Gems for BPI",
  intro,
  featured,
  posts,
  tags,
}: Props) {
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<Set<ContentType>>(new Set());
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  // Applied date-range filter (null = no date filter).
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Days that have at least one post — drives the calendar dots.
  const postDates = useMemo(() => {
    const s = new Set<string>();
    for (const p of posts) {
      if (p.publishedAt) {
        const d = new Date(p.publishedAt);
        if (!Number.isNaN(d.getTime())) s.add(ymd(d));
      }
    }
    return s;
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rangeStart =
      dateRange?.start != null
        ? new Date(dateRange.start).setHours(0, 0, 0, 0)
        : null;
    const rangeEnd =
      dateRange?.start != null
        ? new Date(dateRange.end ?? dateRange.start).setHours(23, 59, 59, 999)
        : null;
    return posts.filter((p) => {
      if (types.size > 0 && !types.has(p.contentType)) return false;
      if (activeTags.size > 0 && !p.tags.some((t) => activeTags.has(t.slug)))
        return false;
      if (rangeStart != null && rangeEnd != null) {
        const t = p.publishedAt ? Date.parse(p.publishedAt) : NaN;
        if (Number.isNaN(t) || t < rangeStart || t > rangeEnd) return false;
      }
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.excerpt?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [posts, query, types, activeTags, dateRange]);

  const shown = filtered.slice(0, visible);

  // Split into render groups: runs of standard cards (laid out as a 2-column
  // masonry) separated by full-width `wide` feature cards, so a feature tile
  // breaks the masonry and spans the full grid width — matching the design.
  const groups = useMemo(() => {
    const out: (
      | { wide: true; post: BlogPostCard }
      | { wide: false; posts: BlogPostCard[] }
    )[] = [];
    for (const p of shown) {
      if (p.wide) {
        out.push({ wide: true, post: p });
        continue;
      }
      const last = out[out.length - 1];
      if (last && last.wide === false) last.posts.push(p);
      else out.push({ wide: false, posts: [p] });
    }
    return out;
  }, [shown]);

  function toggleType(t: ContentType) {
    setVisible(PAGE_SIZE);
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }
  function toggleTag(slug: string) {
    setVisible(PAGE_SIZE);
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }
  function applyDateRange(range: DateRange) {
    // `start === null` means the "All time" preset → clear the filter.
    setDateRange(range.start ? range : null);
    setPickerOpen(false);
    setVisible(PAGE_SIZE);
  }
  function reset() {
    setQuery("");
    setTypes(new Set());
    setActiveTags(new Set());
    setDateRange(null);
    setVisible(PAGE_SIZE);
  }

  const dateLabel = dateRange?.start
    ? dateRange.end && dateRange.end.getTime() !== dateRange.start.getTime()
      ? `${dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${dateRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Date";

  return (
    <div>
      {featured ? <FeaturedHero featured={featured} /> : null}

      {posts.length > 0 ? (
        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-[26rem_1fr] gap-8 lg:gap-12">
          {/* Filter sidebar (left) */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {heading ? (
              <h2 className="font-display text-display-xs md:text-display-sm font-bold text-primary-500 leading-[1.05] tracking-[-0.02em]">
                {heading}
              </h2>
            ) : null}
            {intro ? (
              <p className="mt-3 text-sm text-primary-500/65 leading-relaxed">
                {intro}
              </p>
            ) : null}

            {/* Search + Date + Find Post — one tight row */}
            <div className="mt-6 flex items-center gap-2.5">
              <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-round border border-primary-500/15 bg-white px-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-primary-500/45 shrink-0"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setVisible(PAGE_SIZE);
                  }}
                  placeholder="Search"
                  aria-label="Search the blog"
                  className="min-w-0 flex-1 bg-transparent outline-none text-sm text-primary-500 placeholder:text-primary-500/45"
                />
              </label>

              {/* Date — opens the range picker. */}
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={pickerOpen}
                className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-round border px-3.5 text-sm transition-colors duration-200 ease-out ${
                  dateRange?.start
                    ? "border-primary-500 bg-primary-500/5 text-primary-500"
                    : "border-primary-500/20 text-primary-500/70 hover:border-primary-500/45"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 shrink-0"
                  aria-hidden
                >
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                  <circle cx="9" cy="8" r="2" fill="currentColor" stroke="none" />
                  <circle cx="15" cy="16" r="2" fill="currentColor" stroke="none" />
                </svg>
                {dateLabel}
              </button>

              <span aria-hidden className="h-6 w-px shrink-0 bg-primary-500/15" />

              <button
                type="button"
                onClick={() => setVisible(PAGE_SIZE)}
                className="inline-flex h-11 shrink-0 items-center rounded-round bg-error-500 px-5 text-sm font-bold text-primary-500 transition-colors duration-200 ease-out hover:bg-error-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
              >
                Find Post
              </button>
            </div>

            {/* Filter pills — content types + tags, radio-circle style. */}
            <div className="mt-5 flex flex-wrap gap-2">
              {CONTENT_TYPES.map((c) => (
                <FilterPill
                  key={c.key}
                  label={c.label}
                  active={types.has(c.key)}
                  onClick={() => toggleType(c.key)}
                />
              ))}
              {tags.map((t) => (
                <FilterPill
                  key={t.slug}
                  label={t.title}
                  active={activeTags.has(t.slug)}
                  onClick={() => toggleTag(t.slug)}
                />
              ))}
            </div>

            {/* Reset All */}
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex h-11 items-center rounded-round border-2 border-primary-500 px-6 text-sm font-bold text-primary-500 transition-colors duration-200 ease-out hover:bg-primary-500/5"
            >
              Reset All
            </button>
          </aside>

          {/* Card grid (right): masonry runs broken by full-width feature tiles. */}
          <div>
            {shown.length > 0 ? (
              <div className="flex flex-col gap-6 lg:gap-8">
                {groups.map((g, i) =>
                  g.wide ? (
                    <BlogCard key={g.post.id} post={g.post} wide />
                  ) : (
                    <div
                      key={i}
                      className="columns-1 sm:columns-2 gap-6 lg:gap-8"
                    >
                      {g.posts.map((p) => (
                        <BlogCard key={p.id} post={p} />
                      ))}
                    </div>
                  )
                )}
              </div>
            ) : posts.length > 0 ? (
              // Posts exist but the current search/filters exclude them all.
              <p className="text-sm text-primary-500/70">
                Nothing matches those filters yet.
              </p>
            ) : null}

            {visible < filtered.length ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="rounded-round border border-primary-500/35 px-7 py-2.5 text-sm font-medium text-primary-500 transition-all duration-200 ease-out hover:bg-primary-500/5"
                >
                  View More
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {pickerOpen ? (
        <BlogDatePicker
          postDates={postDates}
          value={dateRange ?? { start: null, end: null }}
          onApply={applyDateRange}
          onCancel={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-round border px-3 py-1.5 text-sm transition-colors duration-200 ease-out ${
        active
          ? "border-primary-500 bg-error-500/15 text-primary-500"
          : "border-primary-500/20 text-primary-500/85 hover:border-primary-500/45 hover:bg-primary-500/5"
      }`}
    >
      <span
        aria-hidden
        className={`relative grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors ${
          active ? "border-primary-500" : "border-primary-500/40"
        }`}
      >
        {active ? (
          <span className="size-2 rounded-full bg-primary-500" />
        ) : null}
      </span>
      {label}
    </button>
  );
}

function FeaturedHero({ featured }: { featured: BlogFeatured }) {
  const poster =
    featured.media?.kind === "image"
      ? featured.media.src
      : featured.media?.kind === "video" || featured.media?.kind === "audio"
        ? featured.media.poster
        : undefined;

  return (
    <CtaLink
      href={postHref(featured)}
      className="group relative block overflow-hidden rounded-3xl bg-primary-500 aspect-4/3 sm:aspect-video lg:aspect-21/9 focus-visible:outline-none"
    >
      {poster ? (
        <Image
          src={poster}
          alt={featured.media && "alt" in featured.media ? featured.media.alt ?? "" : ""}
          fill
          sizes="100vw"
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/15" />

      <div className="relative flex h-full flex-col justify-between p-6 md:p-8 lg:p-10">
        <span className="inline-flex w-fit items-center rounded-round bg-error-500 px-4 py-1.5 text-xs font-semibold text-primary-500">
          Featured Post
        </span>
        <div className="max-w-2xl">
          <h2 className="font-display text-display-xs md:text-display-sm lg:text-display-md font-bold text-white leading-[1.05] tracking-[-0.02em]">
            {featured.title}
          </h2>
          {featured.excerpt ? (
            <p className="mt-3 max-w-xl text-sm md:text-base text-white/75 leading-relaxed line-clamp-2">
              {featured.excerpt}
            </p>
          ) : null}
          <span className="mt-5 inline-flex items-center gap-2 rounded-round bg-error-500 px-5 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-[var(--ease-premium)] group-hover:bg-error-400">
            View Article
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </div>
      </div>
    </CtaLink>
  );
}
