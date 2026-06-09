import { draftMode } from "next/headers";
import type { QueryParams } from "next-sanity";

import { client } from "./client";
import { sanityFetch as liveFetch } from "./live";

// Time-based backstop. Content is busted instantly on publish via the
// `/api/revalidate` webhook (revalidateTag), but if a webhook is ever missed
// (Sanity outage, deploy gap) nothing stays stale longer than this.
const FALLBACK_REVALIDATE = 3600; // 1 hour

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
  initiative: "initiative",
  initiativesPage: "initiativesPage",
  aboutPage: "aboutPage",
  contactPage: "contactPage",
  careersPage: "careersPage",
  job: "job",
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

  if (isDraft) {
    const { data } = await liveFetch({ query, params, stega });
    return data as T;
  }

  return client.fetch<T>(query, params, {
    next: { tags, revalidate: FALLBACK_REVALIDATE },
  });
}
