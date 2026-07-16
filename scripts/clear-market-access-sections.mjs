/**
 * Clears every content section on the Market Access sector document, leaving
 * only the header/hero. Used to reset market-access to a clean slate before
 * rebuilding its sections one by one.
 *
 * - Turns every section toggle off (showOverview/Capabilities/Stats/Quote/Motion).
 * - Unsets the seeded content for those sections + the bottom page sections.
 * - Leaves all Header fields (layout, colour profile, hero CTAs) untouched.
 *
 * Reversible: `node --env-file=.env.local scripts/seed-sectors.mjs` re-seeds the
 * original content (note: that also resets the header profile).
 *
 * Patches every doc matching slug `market-access` (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/clear-market-access-sections.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/clear-market-access-sections.mjs",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// Every section toggle off.
const TOGGLES_OFF = {
  showOverview: false,
  showCapabilities: false,
  showStats: false,
  showQuote: false,
  showMotion: false,
};

// The seeded content for those sections + the bottom modular page sections.
const UNSET = [
  "overviewHeading",
  "overviewBody",
  "capabilitiesHeading",
  "capabilities",
  "statsHeading",
  "stats",
  "quoteEyebrow",
  "quoteHeading",
  "quoteLead",
  "quoteText",
  "quoteAttribution",
  "quoteRole",
  "quotePortrait",
  "motionHeading",
  "motionTone",
  "motionCta",
  "motionImage",
  "motionItems",
  "pageSections",
];

async function run() {
  const ids = await client.fetch(
    `*[_type == "sector" && slug.current == "market-access"]._id`,
  );

  if (!ids.length) {
    console.error("No sector with slug 'market-access' found.");
    process.exit(1);
  }

  console.log(
    `Clearing sections on ${ids.length} market-access doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) {
    tx.patch(id, (p) => p.set(TOGGLES_OFF).unset(UNSET));
  }
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done. Page now renders the header only.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
