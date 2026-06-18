import { NextResponse } from "next/server";

import { loadQuery, TAG } from "../../../sanity/lib/fetch";
import { SEARCH_QUERY } from "../../../sanity/lib/queries";
import { toLocale } from "../../../app/lib/locale";

export const runtime = "nodejs";
// Reads vary by query + locale, so don't statically cache the route itself —
// the underlying Sanity reads are still tagged + revalidated by loadQuery.
export const dynamic = "force-dynamic";

export type SearchResult = {
  _id: string;
  type: "post" | "initiative" | "event" | "job";
  title: string | null;
  description: string | null;
  href: string;
};

type SearchResponse = {
  posts: SearchResult[];
  initiatives: SearchResult[];
  events: SearchResult[];
  jobs: SearchResult[];
};

const MAX_QUERY_LENGTH = 80;

/**
 * Turn raw user input into a safe GROQ `match` pattern. We keep letters,
 * numbers and whitespace (Unicode-aware, so accented characters survive) and
 * drop everything else — this strips GROQ's own wildcard/operator characters,
 * so a query can't alter the match semantics. Each remaining token gets a `*`
 * suffix for prefix matching as the user types ("phar" -> "phar*").
 */
function toMatchPattern(raw: string): string | null {
  const tokens = raw
    .normalize("NFC")
    .slice(0, MAX_QUERY_LENGTH)
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return null;
  return tokens.map((t) => `${t}*`).join(" ");
}

const EMPTY: SearchResponse = {
  posts: [],
  initiatives: [],
  events: [],
  jobs: [],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = toMatchPattern(searchParams.get("q") ?? "");
  const lang = toLocale(searchParams.get("lang") ?? undefined);

  if (!q) {
    return NextResponse.json(EMPTY);
  }

  const data = await loadQuery<SearchResponse>(SEARCH_QUERY, {
    params: { q, lang },
    tags: [TAG.post, TAG.initiative, TAG.event, TAG.job],
  });

  return NextResponse.json(data ?? EMPTY);
}
