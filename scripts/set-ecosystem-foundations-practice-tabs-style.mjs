/**
 * Sets the "practice tabs" heading style to "Compact bold" — the 26px/700 black
 * Avenir Next heading with the last word ("Practice") hung on its own line — on
 * the priorities that show that section (showPracticeTabs = true). Editable in
 * Studio → Priority → Practice tabs → Heading style.
 *
 * Run:   node --env-file=.env.local scripts/set-ecosystem-foundations-practice-tabs-style.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-ecosystem-foundations-practice-tabs-style.mjs",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const SLUGS = [
  "build-the-ecosystem-foundations",
  "strengthen-regional-supply-chains",
];

async function run() {
  const ids = await client.fetch(
    `*[_type == "priority" && slug.current in $slugs]._id`,
    { slugs: SLUGS },
  );

  if (!ids.length) {
    console.error(`No priorities with slugs ${SLUGS.join(", ")} found.`);
    process.exit(1);
  }

  console.log(
    `Setting practiceTabsHeadingStyle="compactBold" on ${ids.length} doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids)
    tx.patch(id, (p) => p.set({ practiceTabsHeadingStyle: "compactBold" }));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
