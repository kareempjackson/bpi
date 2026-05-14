import { defineLive } from "next-sanity/live";

import { client } from "./client";
import { readToken } from "../env";

export const { sanityFetch, SanityLive } = defineLive({
  client,
  // Token is required for the Studio's Presentation tool to read drafts.
  // It's bound to the server bundle via env.ts (no NEXT_PUBLIC_ prefix).
  serverToken: readToken,
  browserToken: readToken,
});
