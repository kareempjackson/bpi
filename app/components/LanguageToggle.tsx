"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";

import {
  localizedHref,
  toLocale,
  locales,
  LOCALE_LABELS,
  type Locale,
} from "@/app/lib/locale";

/**
 * Language switcher used in both the sticky top nav and the home hero's
 * embedded nav. Self-contained — it reads the active locale, path, and
 * router from Next navigation hooks, so it can be dropped in anywhere with
 * no props. Text colour is inherited (`currentColor`) so it adapts to the
 * surrounding nav theme; the dropdown panel is always light.
 */
export default function LanguageToggle({
  className = "",
}: {
  className?: string;
}) {
  const pathname = usePathname() ?? "/";
  const params = useParams();
  const router = useRouter();
  const current = toLocale(params?.lang as string | string[] | undefined);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const choose = (next: Locale) => {
    setOpen(false);
    if (next === current) return;
    // Persist the choice so the proxy honors it on later un-prefixed visits,
    // then navigate to the same page under the new locale.
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax`;
    router.push(localizedHref(next, pathname));
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={`relative inline-block font-sans text-[12px] font-semibold uppercase leading-[16.8px] tracking-[-0.24px] text-center align-middle ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="group inline-flex items-center gap-1.5 py-1 px-0.5 transition-opacity duration-200 ease-[var(--ease-premium)] hover:opacity-70 focus-visible:outline-none focus-visible:opacity-100"
      >
        <span>{current.toUpperCase()}</span>
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-3 h-3 transition-transform duration-200 ease-[var(--ease-premium)] ${
            open ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden
        >
          <path d="m3 4.5 3 3 3-3" />
        </svg>
      </button>

      <div
        className={`absolute right-0 mt-3 min-w-44 origin-top-right transition-all duration-400 ease-[var(--ease-premium)] motion-reduce:transition-none ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-[0.98] -translate-y-1 pointer-events-none"
        }`}
      >
        <ul
          role="listbox"
          aria-label="Languages"
          className="overflow-hidden rounded-xl border border-primary-500/8 bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_-24px_rgba(0,0,54,0.25)] text-primary-500 py-1.5"
        >
          {locales.map((code) => {
            const selected = code === current;
            return (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(code)}
                  className="group/lang relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-200 hover:bg-primary-500/4 focus-visible:bg-primary-500/4 focus-visible:outline-none"
                >
                  <span className="font-semibold tracking-[0.12em] text-[10.5px] w-7 shrink-0">
                    {code.toUpperCase()}
                  </span>
                  <span
                    className={`normal-case tracking-[0.005em] text-[13px] transition-colors duration-200 ${
                      selected ? "text-primary-500" : "text-primary-500/45"
                    }`}
                  >
                    {LOCALE_LABELS[code]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
