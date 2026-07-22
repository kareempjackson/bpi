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
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";
import HamburgerMenu from "./HamburgerMenu";
import { EASE, DUR } from "./motion/tokens";
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
  // Opens the site menu (hosted by the launcher) from the modal's menu button.
  // When omitted, the menu button isn't rendered.
  onOpenMenu?: () => void;
  onMenuHover?: () => void;
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

export default function SearchModal({
  isOpen,
  onClose,
  onOpenMenu,
  onMenuHover,
}: Props) {
  const router = useRouter();
  const params = useParams();
  const lang = toLocale(params?.lang as string | undefined);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");

  const inputRef = useRef<HTMLInputElement>(null);
  // Tracks the latest request so a slow earlier response can't overwrite a
  // newer one (out-of-order responses while typing fast).
  const requestId = useRef(0);

  // Honours the OS "reduce motion" setting — collapses the staged open into a
  // plain fade (no clip unfurl, no rise).
  const reduce = useReducedMotion();

  // Sleek 3-beat open, memoised so typing (which re-renders) never recreates
  // the variant objects — new identities can re-fire the entrance and flicker.
  //   1. backdrop + mint surface fade in together
  //   2. the search pill unfurls left→right from the magnifier icon
  //   3. everything after the bar rises in as one cohesive group
  // The whole overlay fades out as a single unit on close (seam-free exit).
  const M = useMemo(() => {
    const ease = EASE.premium;
    const rmDur = 0.18;
    return {
      root: {
        hidden: {},
        visible: {},
        exit: { opacity: 0, transition: { duration: 0.24, ease } },
      },
      fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: DUR.base, ease } },
      },
      bar: {
        hidden: reduce
          ? { opacity: 0 }
          : { opacity: 0, clipPath: "inset(0 100% 0 0 round 9999px)" },
        visible: {
          opacity: 1,
          clipPath: "inset(0 0% 0 0 round 9999px)",
          transition: reduce
            ? { duration: rmDur }
            : { delay: 0.1, duration: 0.45, ease },
        },
      },
      rise: {
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: reduce
            ? { duration: rmDur }
            : { delay: 0.3, duration: 0.4, ease },
        },
      },
    };
  }, [reduce]);

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

  // Lock body scroll + focus the input while open. Focus lands ~when the bar
  // finishes unfurling (immediate under reduced motion) so the caret arrives on
  // the cinematic beat rather than before the pill has drawn.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(
      () => inputRef.current?.focus(),
      reduce ? 60 : 520,
    );
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(id);
    };
  }, [isOpen, reduce]);

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
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search the site"
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-60 flex"
          variants={M.root}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Dark backdrop — the page shows faintly behind the floating panel. */}
          <motion.button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            tabIndex={-1}
            className="absolute inset-0 cursor-default bg-error-950/70"
            variants={M.fade}
          />

          {/* Panel clip region — kept transparent during the bar roll-out so the
              white search pill reads as floating on the dark backdrop; the mint
              surface fades in behind it a beat later. */}
          <div className="absolute inset-2 flex flex-col overflow-hidden rounded-[28px] sm:inset-4 md:inset-6 lg:rounded-[36px]">
            {/* Mint surface — fades in/out with the backdrop. */}
            <motion.div
              aria-hidden
              variants={M.fade}
              className="absolute inset-0 bg-[#C1FFE0]"
            />

            {/* Top bar — brand mark, full-width search, language + menu. */}
            <div className="relative z-10 flex shrink-0 items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 sm:py-3.5">
              <motion.span
                variants={M.rise}
                className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error-950 text-error-500 sm:flex"
              >
                <Logo iconOnly size={15} aria-label="BPI" />
              </motion.span>

              {/* Search pill — rolls out via a left→right clip unfurl. */}
              <motion.div
                variants={M.bar}
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-error-950/10 bg-white px-5 py-2.5 focus-within:border-error-500/50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 shrink-0 text-error-950/35"
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
                  className="w-full bg-transparent text-sm font-light text-primary-500 placeholder:text-error-950/35 focus:outline-none sm:text-[15px]"
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
              </motion.div>

              {/* Language + menu — the same chrome as the site header. */}
              <motion.div
                variants={M.rise}
                className="ml-auto flex shrink-0 items-center gap-2 text-error-950 sm:gap-3"
              >
                <LanguageToggle className="inline-block" />
                {onOpenMenu ? (
                  <HamburgerMenu
                    size={120}
                    aria-label="Open menu"
                    onClick={onOpenMenu}
                    onMouseEnter={onMenuHover}
                    onFocus={onMenuHover}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close search"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-error-950/55 transition-colors hover:bg-error-950/[0.06] hover:text-error-950"
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
                )}
              </motion.div>
            </div>

        {/* Body — sidebar + results. Rises in as one cohesive group. */}
        <motion.div
          variants={M.rise}
          className="relative z-10 flex min-h-0 flex-1 flex-col gap-2 px-3 pb-3 sm:gap-4 sm:px-6 sm:pb-6 md:flex-row"
        >
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
                      ? "bg-white text-primary-500"
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
                    const img = thumb(item.image);
                    const date = fmtDate(item.date);
                    // Show the poster/still if there is one; otherwise fall
                    // back to a muted, looping preview of the video.
                    const showVideo = !img && !!item.video;
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => go(item.href)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left"
                      >
                        {/* Thumbnail. */}
                        <div className="relative aspect-16/10 w-full overflow-hidden bg-error-100">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : showVideo ? (
                            <video
                              src={item.video ?? undefined}
                              muted
                              loop
                              playsInline
                              autoPlay
                              preload="metadata"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-error-100 text-error-900/50">
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
                          <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-error-950/60">
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
        </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
