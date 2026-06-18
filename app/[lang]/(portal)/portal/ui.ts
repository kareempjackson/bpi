// Shared brand-styled class helpers for the portal UI. Plain functions/strings
// (no "use client"), so they're importable from both server and client
// components. Mirrors the site's design language: navy `primary-500` text, BPI
// green `error-500` pill buttons, mint `error-25` surfaces, Albert Sans display.

const PILL_BASE =
  "inline-flex items-center justify-center gap-2 rounded-round font-semibold text-sm px-5 py-2.5 transition-all duration-300 ease-[var(--ease-premium)] active:scale-[0.98] motion-reduce:transform-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500/40";

export function pillClass(
  variant: "primary" | "secondary" = "primary",
  extra = "",
): string {
  const styles =
    variant === "primary"
      ? "bg-error-500 text-primary-500 hover:bg-error-400"
      : "border border-primary-500/20 bg-transparent text-primary-500 hover:bg-primary-500/5 hover:border-primary-500/40";
  return `${PILL_BASE} ${styles} ${extra}`;
}

export const fieldClass =
  "w-full rounded-sm border border-primary-500/15 bg-white px-3.5 py-2.5 text-sm text-primary-500 placeholder:text-primary-500/40 outline-none transition focus:border-primary-500/50 focus:ring-2 focus:ring-error-500/40";

export const labelClass = "text-sm font-medium text-primary-500/80";

export const cardClass =
  "rounded-lg border border-primary-500/10 bg-white";
