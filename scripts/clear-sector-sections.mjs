/**
 * Clears every content section on a sector document, leaving only the
 * header/hero. Used to reset a sector to a clean slate before rebuilding its
 * sections one by one.
 *
 * - Turns every section toggle off (Overview/Practice/Capabilities/Stats/Quote/Motion).
 * - Unsets the seeded content for those sections + the bottom page sections.
 * - Leaves all Header fields (layout, colour profile, hero CTAs, subtitle) untouched.
 *
 * Patches every doc matching the given slug (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/clear-sector-sections.mjs <slug>
 * e.g.   node --env-file=.env.local scripts/clear-sector-sections.mjs workforce
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

const slug = process.argv[2];

if (!slug) {
  console.error(
    "Missing slug. Usage: node --env-file=.env.local scripts/clear-sector-sections.mjs <slug>",
  );
  process.exit(1);
}

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.",
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
  showPractice: false,
  showCapabilities: false,
  showStats: false,
  showQuote: false,
  showMotion: false,
};

// The seeded content for those sections + the bottom modular page sections.
const UNSET = [
  "overviewHeading",
  "overviewBody",
  "practiceHeading",
  "practiceLead",
  "practiceBody",
  "practicePrimaryCta",
  "practiceSecondaryCta",
  "practiceImage",
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
    `*[_type == "sector" && slug.current == $slug]._id`,
    { slug },
  );

  if (!ids.length) {
    console.error(`No sector with slug '${slug}' found.`);
    process.exit(1);
  }

  console.log(
    `Clearing sections on ${ids.length} '${slug}' doc(s) in ${projectId}/${dataset}…`,
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
