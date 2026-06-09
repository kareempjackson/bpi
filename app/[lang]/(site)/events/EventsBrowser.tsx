"use client";

import { useMemo, useState } from "react";

export type EventItem = {
  id: string;
  title: string;
  /** Display date, e.g. "THU, JUN 18 • 9:00 AM". */
  date: string;
  /** Availability badge, e.g. "Almost Full". */
  status?: string;
  /** Time bucket used by the filter chips. */
  when: "today" | "week" | "month";
  /** Tailwind classes for the placeholder poster gradient. */
  accent: string;
};

type Filter = { key: string; label: string; match?: EventItem["when"] };

const FILTERS: Filter[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today", match: "today" },
  { key: "week", label: "This week", match: "week" },
  { key: "month", label: "This Month", match: "month" },
];

export default function EventsBrowser({ events }: { events: EventItem[] }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const active = FILTERS.find((f) => f.key === filter);
    return events.filter((ev) => {
      if (active?.match && ev.when !== active.match) return false;
      if (!q) return true;
      return ev.title.toLowerCase().includes(q);
    });
  }, [events, filter, query]);

  return (
    <div>
      {/* Filter chips + search + button */}
      <div className="mt-6 lg:mt-8 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={`rounded-round px-5 py-2 text-sm lg:text-base font-medium transition-all duration-200 ease-out ${
                  active
                    ? "bg-primary-500 text-white"
                    : "border border-primary-500/35 text-primary-500 hover:border-primary-500/60 hover:bg-primary-500/5"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex items-center gap-3 lg:ml-auto lg:max-w-md">
          <label className="flex-1 flex items-center gap-2 rounded-round border border-primary-500/15 bg-white px-4 py-2.5">
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
              placeholder="Search"
              aria-label="Search events"
              className="flex-1 bg-transparent outline-none text-sm lg:text-base text-primary-500 placeholder:text-primary-500/50"
            />
          </label>
        </div>

        <button
          type="button"
          className="shrink-0 rounded-round bg-error-500 px-6 py-2.5 text-sm lg:text-base font-semibold text-primary-500 transition-all duration-300 ease-[var(--ease-premium)] hover:bg-error-400 active:scale-[0.98] motion-reduce:transform-none"
        >
          Find Events
        </button>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-8 lg:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8 lg:gap-y-10">
          {filtered.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-primary-500/70">
          No events match your filters yet.
        </p>
      )}
    </div>
  );
}

export function EventCard({
  event,
  featured = false,
}: {
  event: EventItem;
  featured?: boolean;
}) {
  return (
    <article className="group flex flex-col gap-3">
      <div
        className={`relative overflow-hidden rounded-2xl ${event.accent} ${
          featured ? "aspect-video lg:aspect-21/9" : "aspect-4/3"
        }`}
      >
        {featured ? (
          <span className="absolute left-4 top-4 z-10 inline-flex items-center rounded-round bg-error-500/90 px-3.5 py-1.5 text-xs font-semibold text-primary-500 backdrop-blur-sm">
            Feature
          </span>
        ) : null}
        <span
          aria-hidden
          className="absolute inset-0 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-[1.04] motion-reduce:transform-none"
        />
      </div>

      {event.status ? (
        <span className="inline-flex w-fit items-center rounded-round bg-error-200 px-3 py-1 text-xs font-semibold text-primary-500">
          {event.status}
        </span>
      ) : null}

      <p
        className={`text-primary-500/55 ${
          featured ? "text-sm" : "text-xs lg:text-[13px]"
        }`}
      >
        {event.date}
      </p>

      <h3
        className={`font-bold text-primary-500 uppercase leading-snug tracking-[0.01em] ${
          featured ? "text-lg md:text-xl lg:text-2xl max-w-2xl" : "text-xs lg:text-[13px]"
        }`}
      >
        {event.title}
      </h3>
    </article>
  );
}
