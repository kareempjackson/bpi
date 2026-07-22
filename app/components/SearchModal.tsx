"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter, useParams } from "next/navigation";

import Logo from "./Logo";
import { localizedHref, toLocale } from "@/app/lib/locale";
import type { SearchResult } from "@/app/api/search/route";

type SearchResponse = {
  posts: SearchResult[];
  initiatives: SearchResult[];
  events: SearchResult[];
  jobs: SearchResult[];
};

type GroupKey = keyof SearchResponse;
type Filter = "all" | GroupKey;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

// Order + labels for the grouped results. Keys match the API response, and the
// order here drives both the sidebar filters and the flattened keyboard nav.
const GROUPS: { key: GroupKey; label: string }[] = [
  { key: "initiatives", label: "Initiatives" },
  { key: "posts", label: "News & Insights" },
  { key: "events", label: "Events" },
  { key: "jobs", label: "Careers" },
];

// Per-result-type label shown on each card (mirrors the group labels).
const TYPE_LABEL: Record<SearchResult["type"], string> = {
  initiative: "Initiative",
  post: "News & Insights",
  event: "Event",
  job: "Careers",
};

const DEBOUNCE_MS = 180;

// Ask the Sanity CDN for a right-sized, format-optimised thumbnail rather than
// shipping the full-resolution original into every card.
function thumb(url: string | null): string | null {
  if (!url) return null;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}w=680&h=440&fit=crop&auto=format`;
}

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Small inline glyph per sidebar filter — keeps the nav visually scannable.
function CategoryIcon({ name }: { name: Filter }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-[18px] w-[18px] shrink-0",
    "aria-hidden": true,
  };
  switch (name) {
    case "all":
      return (
        <svg {...common}>
          <path d="M4 5h16M4 12h16M4 19h10" />
        </svg>
      );
    case "initiatives":
      return (
        <svg {...common}>
          <path d="M12 2v20M12 4l7 3-7 3" />
        </svg>
      );
    case "posts":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );
    case "events":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    case "jobs":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    default:
      return null;
  }
}

export default function SearchModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const params = useParams();
  const lang = toLocale(params?.lang as string | undefined);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  // Drives the enter/exit transition. Mount closed, then flip on the next frame
  // so the open animation runs from the start (mirrors Menu).
  const [entered, setEntered] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  // Tracks the latest request so a slow earlier response can't overwrite a
  // newer one (out-of-order responses while typing fast).
  const requestId = useRef(0);

  const trimmed = query.trim();

  // Per-group + total counts, used to label the sidebar filters.
  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: 0,
      initiatives: 0,
      posts: 0,
      events: 0,
      jobs: 0,
    };
    if (!results) return c;
    for (const g of GROUPS) {
      c[g.key] = results[g.key].length;
      c.all += results[g.key].length;
    }
    return c;
  }, [results]);

  // The results currently visible under the active filter, flattened for the
  // grid + keyboard nav.
  const visibleResults = useMemo<SearchResult[]>(() => {
    if (!results) return [];
    if (filter === "all") return GROUPS.flatMap((g) => results[g.key]);
    return results[filter];
  }, [results, filter]);

  const hasResults = visibleResults.length > 0;

  // Run the enter/exit animation off `isOpen`. On open, flip `entered` after a
  // double rAF so the transition starts from the closed state.
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setEntered(true)),
      );
      return () => cancelAnimationFrame(raf);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntered(false);
  }, [isOpen]);

  // Lock body scroll + focus the input while open.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(id);
    };
  }, [isOpen]);

  // Debounced live search. (Transient state resets on reopen because the
  // launcher remounts this component with a fresh key — no reset effect.)
  useEffect(() => {
    if (!isOpen || trimmed.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    const currentId = ++requestId.current;
    const controller = new AbortController();
    const handle = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&lang=${lang}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        const data = (await res.json()) as SearchResponse;
        // Ignore stale responses that resolve after a newer keystroke.
        if (currentId !== requestId.current) return;
        setResults(data);
        setActiveIndex(0);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        if (currentId === requestId.current) setResults(null);
      } finally {
        if (currentId === requestId.current) setIsLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [trimmed, lang, isOpen]);

  const go = useCallback(
    (href: string) => {
      onClose();
      router.push(localizedHref(lang, href));
    },
    [onClose, router, lang],
  );

  const selectFilter = useCallback((next: Filter) => {
    setFilter(next);
    setActiveIndex(0);
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (!hasResults) return;
      // Two-across grid: Left/Right step, Up/Down jump a row.
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % visibleResults.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + visibleResults.length) % visibleResults.length,
        );
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 2, visibleResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 2, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = visibleResults[activeIndex];
        if (target) go(target.href);
      }
    },
    [hasResults, visibleResults, activeIndex, go, onClose],
  );

  if (typeof document === "undefined") return null;

  const filters: Filter[] = ["all", ...GROUPS.map((g) => g.key)];
  const filterLabel = (f: Filter) =>
    f === "all" ? "Everything" : GROUPS.find((g) => g.key === f)!.label;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search the site"
      onKeyDown={onKeyDown}
      className={`fixed inset-0 z-60 flex transition-opacity duration-300 ease-[var(--ease-premium)] motion-reduce:transition-none ${
        entered ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Dark backdrop — the page shows faintly behind the floating panel. */}
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-error-950/70 backdrop-blur-md"
      />

      {/* Floating mint panel. */}
      <div
        className={`absolute inset-2 flex flex-col overflow-hidden rounded-[28px] bg-error-25 shadow-[0_40px_120px_-30px_rgba(1,25,13,0.6)] transition-all duration-300 ease-[var(--ease-premium)] motion-reduce:transition-none sm:inset-4 md:inset-6 lg:rounded-[36px] ${
          entered ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.985]"
        }`}
      >
        {/* Top bar — brand mark, search pill, close. */}
        <div className="flex shrink-0 items-center gap-3 px-4 py-4 sm:gap-5 sm:px-7 sm:py-5">
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error-950 text-error-500 sm:flex">
            <Logo iconOnly size={15} aria-label="BPI" />
          </span>

          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-white px-5 py-3 shadow-[0_2px_20px_-8px_rgba(1,25,13,0.25)] ring-1 ring-error-950/[0.04] focus-within:ring-2 focus-within:ring-error-500/40">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 shrink-0 text-error-950/35"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search query"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-transparent text-base font-light text-primary-500 placeholder:text-error-950/35 focus:outline-none sm:text-[17px]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="shrink-0 text-error-950/30 transition-colors hover:text-error-950/60"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-error-950/55 transition-colors hover:bg-error-950/[0.06] hover:text-error-950"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Body — sidebar + results. */}
        <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-3 sm:gap-4 sm:px-6 sm:pb-6 md:flex-row">
          {/* Category sidebar / mobile filter chips. */}
          <nav
            aria-label="Filter results"
            className="flex shrink-0 gap-1.5 overflow-x-auto pb-1 md:w-56 md:flex-col md:gap-1 md:overflow-visible md:pb-0"
          >
            {filters.map((f) => {
              const active = filter === f;
              const count = counts[f];
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => selectFilter(f)}
                  className={`group flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-left text-sm font-medium transition-colors md:rounded-2xl ${
                    active
                      ? "bg-white text-primary-500 shadow-[0_2px_16px_-6px_rgba(1,25,13,0.25)]"
                      : "text-error-950/60 hover:bg-white/50 hover:text-error-950"
                  }`}
                >
                  <span
                    className={active ? "text-error-600" : "text-error-950/45"}
                  >
                    <CategoryIcon name={f} />
                  </span>
                  <span className="whitespace-nowrap">{filterLabel(f)}</span>
                  {count > 0 ? (
                    <span
                      className={`ml-auto hidden rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums md:inline ${
                        active
                          ? "bg-error-500/15 text-error-700"
                          : "bg-error-950/[0.05] text-error-950/45"
                      }`}
                    >
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Results surface. */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[22px] bg-white/40 px-3 py-3 sm:px-5 sm:py-5">
            {trimmed.length === 0 ? (
              <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-error-500/12 text-error-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </span>
                <p className="text-[15px] font-medium text-primary-500">
                  Search across BPI
                </p>
                <p className="max-w-xs text-sm text-error-950/45">
                  Find initiatives, news &amp; insights, events and career
                  opportunities.
                </p>
              </div>
            ) : !hasResults && !isLoading ? (
              <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
                <p className="text-[15px] font-medium text-primary-500">
                  No results for “{trimmed}”
                </p>
                <p className="text-sm text-error-950/45">
                  Try a different term or clear the current filter.
                </p>
              </div>
            ) : (
              <>
                {isLoading && !hasResults ? (
                  <p className="px-1 pb-3 text-xs text-error-950/40">
                    Searching…
                  </p>
                ) : (
                  <p className="px-1 pb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-error-950/35">
                    {visibleResults.length}{" "}
                    {visibleResults.length === 1 ? "result" : "results"}
                    {filter !== "all" ? ` in ${filterLabel(filter)}` : ""}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-3">
                  {visibleResults.map((item, idx) => {
                    const active = idx === activeIndex;
                    const img = thumb(item.image);
                    const date = fmtDate(item.date);
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => go(item.href)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`group flex flex-col overflow-hidden rounded-2xl bg-white text-left transition-all duration-200 ease-[var(--ease-premium)] motion-reduce:transition-none ${
                          active
                            ? "-translate-y-0.5 shadow-[0_20px_40px_-18px_rgba(1,25,13,0.4)] ring-2 ring-error-500"
                            : "shadow-[0_2px_16px_-10px_rgba(1,25,13,0.3)] ring-1 ring-error-950/[0.04] hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-20px_rgba(1,25,13,0.35)]"
                        }`}
                      >
                        {/* Thumbnail. */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-error-100">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-[1.04] motion-reduce:transform-none"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-error-200 to-error-500/40 text-error-900/60">
                              <CategoryIcon
                                name={
                                  (GROUPS.find(
                                    (g) =>
                                      g.key.replace(/s$/, "") === item.type,
                                  )?.key ?? "posts") as Filter
                                }
                              />
                            </div>
                          )}
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-error-950/60 backdrop-blur-sm">
                            {TYPE_LABEL[item.type]}
                          </span>
                        </div>

                        {/* Copy. */}
                        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                          {date ? (
                            <span className="text-[11px] font-medium text-error-950/40">
                              {date}
                            </span>
                          ) : null}
                          <h4 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-primary-500">
                            {item.title ?? "Untitled"}
                          </h4>
                          {item.description ? (
                            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-error-950/50">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
