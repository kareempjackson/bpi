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

import { localizedHref, toLocale } from "@/app/lib/locale";
import type { SearchResult } from "@/app/api/search/route";

type SearchResponse = {
  posts: SearchResult[];
  initiatives: SearchResult[];
  events: SearchResult[];
  jobs: SearchResult[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

// Order + labels for the grouped result columns. Keys match the API response.
const GROUPS: { key: keyof SearchResponse; label: string }[] = [
  { key: "initiatives", label: "Initiatives" },
  { key: "posts", label: "News & Insights" },
  { key: "events", label: "Events" },
  { key: "jobs", label: "Careers" },
];

const DEBOUNCE_MS = 180;

export default function SearchModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const params = useParams();
  const lang = toLocale(params?.lang as string | undefined);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // Drives the enter/exit transition. Mount in the closed state, then flip on
  // the next frame so the open animation runs from the start (mirrors Menu).
  const [entered, setEntered] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  // Tracks the latest request so a slow earlier response can't overwrite a
  // newer one (out-of-order responses while typing fast).
  const requestId = useRef(0);

  // Flatten the grouped results into a single ordered list for keyboard nav.
  const flatResults = useMemo<SearchResult[]>(() => {
    if (!results) return [];
    return GROUPS.flatMap((g) => results[g.key]);
  }, [results]);

  const hasResults = flatResults.length > 0;
  const trimmed = query.trim();

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

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (!hasResults) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % flatResults.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = flatResults[activeIndex];
        if (target) go(target.href);
      }
    },
    [hasResults, flatResults, activeIndex, go, onClose],
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search the site"
      onKeyDown={onKeyDown}
      className={`fixed inset-0 z-60 flex flex-col bg-error-25 transition-opacity duration-300 ease-[var(--ease-premium)] motion-reduce:transition-none ${
        entered ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Close — top-right of the screen. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close search"
        className="absolute right-5 top-5 z-10 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-error-950/45 transition-colors hover:text-error-950 sm:right-8 sm:top-7"
      >
        Close
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {/* Centred content column. The search bar stays put; results scroll. */}
      <div
        className={`mx-auto flex min-h-0 w-[min(860px,90vw)] flex-1 flex-col pt-[16vh] transition-transform duration-300 ease-[var(--ease-premium)] motion-reduce:transition-none ${
          entered ? "translate-y-0" : "translate-y-2"
        }`}
      >
        {/* Search bar — underline only, no box. */}
        <div className="flex shrink-0 items-center gap-4 border-b border-error-950/15 pb-5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 shrink-0 text-error-950/40 sm:h-7 sm:w-7"
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
            placeholder="Search initiatives, news, events, careers…"
            aria-label="Search query"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-2xl font-light text-primary-500 placeholder:text-error-950/30 focus:outline-none sm:text-3xl"
          />
        </div>

        {/* Results */}
        <div className="-mx-2 flex-1 overflow-y-auto overscroll-contain px-2">
          {trimmed.length === 0 ? (
            <p className="pt-12 text-sm text-error-950/40">
              Start typing to search across the site.
            </p>
          ) : !hasResults && !isLoading ? (
            <p className="pt-12 text-sm text-error-950/40">
              No results for “{trimmed}”.
            </p>
          ) : (
            <div className="pb-[12vh] pt-8">
              {GROUPS.map((group) => {
                const items = results?.[group.key] ?? [];
                if (items.length === 0) return null;
                return (
                  <section key={group.key} className="mb-9 last:mb-0">
                    <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-error-950/35">
                      {group.label}
                    </h3>
                    <ul>
                      {items.map((item) => {
                        const idx = flatResults.indexOf(item);
                        const active = idx === activeIndex;
                        return (
                          <li key={item._id}>
                            <button
                              type="button"
                              onClick={() => go(item.href)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              className={`group flex w-full items-center justify-between gap-6 border-b py-3.5 text-left transition-colors ${
                                active
                                  ? "border-error-950/25"
                                  : "border-error-950/8"
                              }`}
                            >
                              <span className="flex min-w-0 flex-col">
                                <span
                                  className={`truncate text-base font-medium text-primary-500 transition-transform duration-200 ease-[var(--ease-premium)] motion-reduce:transition-none ${
                                    active ? "translate-x-1.5" : ""
                                  }`}
                                >
                                  {item.title ?? "Untitled"}
                                </span>
                                {item.description ? (
                                  <span
                                    className={`mt-0.5 truncate text-sm text-error-950/45 transition-transform duration-200 ease-[var(--ease-premium)] motion-reduce:transition-none ${
                                      active ? "translate-x-1.5" : ""
                                    }`}
                                  >
                                    {item.description}
                                  </span>
                                ) : null}
                              </span>
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`h-5 w-5 shrink-0 text-error-950/40 transition-all duration-200 ease-[var(--ease-premium)] motion-reduce:transition-none group-hover:translate-x-0 group-hover:opacity-100 ${
                                  active
                                    ? "translate-x-0 opacity-100"
                                    : "-translate-x-1.5 opacity-0"
                                }`}
                                aria-hidden
                              >
                                <path d="M5 12h14M13 6l6 6-6 6" />
                              </svg>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
          {isLoading && !hasResults ? (
            <p className="pt-8 text-xs text-error-950/35">Searching…</p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
