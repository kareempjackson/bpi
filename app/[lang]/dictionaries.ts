import "server-only";
import { type Locale } from "@/app/lib/locale";

// Re-export the client-safe locale constants so server code can keep importing
// them from here (the canonical i18n entry point on the server).
export {
  locales,
  defaultLocale,
  hasLocale,
  LOCALE_LABELS,
  type Locale,
} from "@/app/lib/locale";

// Lazily-imported per-locale dictionaries. Only the requested locale's JSON
// is loaded on the server.
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  es: () => import("./dictionaries/es.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  pt: () => import("./dictionaries/pt.json").then((m) => m.default),
  nl: () => import("./dictionaries/nl.json").then((m) => m.default),
} satisfies Record<Locale, () => Promise<unknown>>;

// `en.json` is the canonical shape; every other locale must match it. This is
// a type-only import (erased at runtime), so it doesn't defeat lazy loading.
export type Dictionary = typeof import("./dictionaries/en.json");

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]() as Promise<Dictionary>;
}
