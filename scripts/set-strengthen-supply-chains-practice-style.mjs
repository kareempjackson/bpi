/**
 * Configures the "practice detail" section on the "Strengthen Regional Supply
 * Chains" priority: "Compact bold" heading style (30px/700 black Avenir Next,
 * vs. the default large navy display) and a wide body column (~768px). Editable
 * in Studio → Priority → Practice detail.
 *
 * Run:   node --env-file=.env.local scripts/set-strengthen-supply-chains-practice-style.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-strengthen-supply-chains-practice-style.mjs",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const SLUG = "strengthen-regional-supply-chains";

async function run() {
  const ids = await client.fetch(
    `*[_type == "priority" && slug.current == $slug]._id`,
    { slug: SLUG },
  );

  if (!ids.length) {
    console.error(`No priority with slug '${SLUG}' found.`);
    process.exit(1);
  }

  console.log(
    `Setting practiceDetailHeadingStyle="compactBold" + wide body on ${ids.length} doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids)
    tx.patch(id, (p) =>
      p.set({
        practiceDetailHeadingStyle: "compactBold",
        practiceDetailWideBody: true,
      }),
    );
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
