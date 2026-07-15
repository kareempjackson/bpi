import { draftMode } from "next/headers";
import type { QueryParams } from "next-sanity";

import { client } from "./client";
import { sanityFetch as liveFetch } from "./live";

// Time-based backstop. Content is busted instantly on publish via the
// `/api/revalidate` webhook (revalidateTag), but if a webhook is ever missed
// (Sanity outage, deploy gap) nothing stays stale longer than this.
const FALLBACK_REVALIDATE = 3600; // 1 hour

// In local dev the publish webhook points at the deployed domain, so it never
// reaches localhost — meaning cached reads would otherwise stay frozen for the
// full hour after you edit content in Studio. So locally we skip the Data Cache
// (`revalidate: 0`) and read straight from the live API (`useCdn: false`) so a
// publish shows on the very next page refresh. Prod keeps the cached CDN read.
const isDev = process.env.NODE_ENV === "development";

/**
 * Cache tags, one per Sanity document `_type`. These must match the document
 * type names exactly — the publish webhook (`/api/revalidate`) calls
 * `revalidateTag(body._type)`, so a tag here only busts if it equals the
 * `_type` Sanity sends.
 */
export const TAG = {
  homePage: "homePage",
  siteSettings: "siteSettings",
  post: "post",
  tag: "tag",
  blogPage: "blogPage",
  initiative: "initiative",
  initiativesPage: "initiativesPage",
  aboutPage: "aboutPage",
  contactPage: "contactPage",
  careersPage: "careersPage",
  prioritiesPage: "prioritiesPage",
  priority: "priority",
  sectorsPage: "sectorsPage",
  sector: "sector",
  job: "job",
  event: "event",
  portalPage: "portalPage",
  portalResource: "portalResource",
} as const;

type LoadQueryOptions = {
  params?: QueryParams;
  /** Cache tags so a publish webhook can bust exactly these reads. */
  tags?: string[];
  /** Disable stega for clean strings (e.g. metadata) in preview. */
  stega?: boolean;
};

/**
 * Draft-aware Sanity read.
 *
 * - **Preview (draft mode on):** delegates to the `defineLive` fetch, which
 *   reads the drafts perspective with the read token, stays uncached, and keeps
 *   stega + visual editing wired for the Presentation tool.
 * - **Production (draft mode off):** a published CDN read stored in Next's Data
 *   Cache, tagged for on-demand revalidation and revalidated at most hourly.
 *   Sanity is only hit on a cache miss or after a publish busts the tag — so
 *   bandwidth scales with publish frequency, not traffic.
 */
export async function loadQuery<T>(
  query: string,
  { params = {}, tags = [], stega }: LoadQueryOptions = {},
): Promise<T> {
  const { isEnabled: isDraft } = await draftMode();

  // Every localized query references `$lang`. Default it to "en" so a call
  // site that doesn't pass a locale (or a query that doesn't use it) never
  // trips Sanity's "param referenced but not provided" error; real pages
  // override `lang` with the active route locale.
  const localizedParams = { lang: "en", ...params };

  if (isDraft) {
    const { data } = await liveFetch({ query, params: localizedParams, stega });
    return data as T;
  }

  if (isDev) {
    // Live API + no Data Cache → content edits appear on the next refresh.
    return client
      .withConfig({ useCdn: false })
      .fetch<T>(query, localizedParams, {
        next: { revalidate: 0 },
      });
  }

  return client.fetch<T>(query, localizedParams, {
    next: { tags, revalidate: FALLBACK_REVALIDATE },
  });
}
