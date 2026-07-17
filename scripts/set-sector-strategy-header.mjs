/**
 * Configures the "Barbados Pharma Sector Strategy" initiative detail-page header
 * to use the Type 2 layout (split title — "Barbados Pharma" on top, subtitle and
 * button under it, "Sector Strategy" hung to the bottom right of the column,
 * beside a square image), with the approved hero copy. Real, editable CMS data —
 * everything here can be changed in Studio → Initiative → Detail page header.
 *
 * Clears the empty `headerImage` / `headerSecondaryCta` shells Studio leaves
 * behind. The headerImage one matters: an asset-less shell still wins the
 * `headerImage ?? coverImage` coalesce in page.tsx, so the hero silently drops
 * to the Home building photo instead of this initiative's cover. Unsetting it
 * lets the documented cover fallback actually run.
 *
 * The mock's team photo isn't in the dataset, so the square slot shows the
 * cover until an editor uploads the real shot in Studio.
 *
 * Run:   node --env-file=.env.local scripts/set-sector-strategy-header.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-sector-strategy-header.mjs",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const str = (value) => [
  { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value },
];
const text = (value) => [
  { _key: "en", _type: "internationalizedArrayTextValue", language: "en", value },
];

const SLUG = "barbados-pharma-sector-strategy";

const HEADER = {
  headerType: "type2",
  headerTitle: str("Barbados Pharma"),
  headerTitleTail: str("Sector Strategy"),
  headerSubtitle: text(
    "A blueprint for transforming Barbados into a globally credible pharmaceutical hub.",
  ),
  headerPrimaryCta: {
    _type: "cta",
    label: str("Partner With BPI"),
    href: "/contact",
  },
};

async function run() {
  const ids = await client.fetch(
    `*[_type == "initiative" && slug.current == $slug]._id`,
    { slug: SLUG },
  );

  if (!ids.length) {
    console.error(`No initiative with slug '${SLUG}' found.`);
    process.exit(1);
  }

  console.log(
    `Applying Type 2 header to ${ids.length} Sector Strategy doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids)
    tx.patch(id, (p) =>
      p.set(HEADER).unset(["headerImage", "headerSecondaryCta"]),
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
