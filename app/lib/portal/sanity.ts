import "server-only";
import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, writeToken } from "@/sanity/env";

/**
 * Server-only Sanity client for portal AUTH reads (user lookup by email/id).
 *
 * `useCdn: false` is deliberate: it must NOT serve a stale cache, otherwise a
 * user disabled in Studio could keep getting in until the CDN expires. The
 * write token (if present) lets it read in private datasets too; it's harmless
 * for the default public dataset.
 *
 * Portal *content* (pages/resources) is read through the regular draft-aware
 * `loadQuery` so it benefits from caching + visual editing — only auth-critical
 * reads go through here.
 */
export function getPortalClient() {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: writeToken,
    perspective: "published",
  });
}
