// Client-safe locale constants + helpers. NOTE: no "server-only" here so
// these can be imported from client components (LanguageToggle, LocaleLink).
// `dictionaries.ts` (server-only) re-exports these.

export const locales = ["en", "es", "fr", "pt", "nl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Display labels for the language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  pt: "Português",
  nl: "Nederlands",
};

/** Type guard narrowing an arbitrary string to a supported Locale. */
export function hasLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Read a locale from a route param value, falling back to the default. */
export function toLocale(value: string | string[] | undefined): Locale {
  const v = Array.isArray(value) ? value[0] : value;
  return hasLocale(v) ? v : defaultLocale;
}

/**
 * Prefix an internal href with the active locale. External URLs, in-page
 * anchors (`#…`), and mailto/tel/absolute URLs are returned untouched.
 * Already-prefixed paths (`/es/…`) are normalized to the given locale.
 */
export function localizedHref(lang: string, href: string): string {
  if (!href || !href.startsWith("/")) return href;
  const segments = href.split("/"); // ["", "maybeLocale", ...rest]
  if (hasLocale(segments[1])) {
    segments[1] = lang;
    return segments.join("/") || "/";
  }
  return `/${lang}${href === "/" ? "" : href}`;
}
