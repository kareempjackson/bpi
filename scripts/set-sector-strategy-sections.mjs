/**
 * Populates the two "Barbados Pharma Sector Strategy" detail-page sections under
 * the Type 2 header, per the design mock:
 *
 *   1. Strategic Aim       — "What This Is" retitled, `stackedLead` layout
 *                            (heading above the body, body set as a large
 *                            statement), no Key Metrics row.
 *   2. Development Process — "Key Developments" retitled, `imageBelow` layout
 *                            (heading left, bullets + button right, wide image
 *                            under the pair).
 *
 * Real, editable CMS data — every heading, bullet and toggle here can be changed
 * in Studio → Initiative. Bullets are one per line; paragraphs are separated by
 * a blank line.
 *
 * The mock's surgical-suite photo isn't in the dataset, so the wide image slot
 * falls back to the Home building photo until an editor uploads the real shot.
 *
 * Run:   node --env-file=.env.local scripts/set-sector-strategy-sections.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-sector-strategy-sections.mjs",
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

const SECTIONS = {
  // ── 1. Strategic Aim (white band) ──
  showWhatThisIs: true,
  whatThisIsLayout: "stackedLead",
  whatThisIsHeading: str("Strategic Aim"),
  whatThisIsBody: text(
    "The Barbados Pharma Sector Strategy is a sector-transformative action plan structured across 11 technical chapters, combining multisectoral authorship with technical oversight to deliver a roadmap for building a globally credible pharmaceutical ecosystem in Barbados and beyond.",
  ),

  // ── 2. Development Process (pale-blue band, wide image below the pair) ──
  showDevelopments: true,
  developmentsLayout: "imageBelow",
  developmentsHeading: str("Development Process"),
  developmentsBody: text(
    [
      "Strategy approach defined and outlined (April 2025)",
      "Global and local stakeholder consultations conducted with iterative refinement (March 2025 – February 2026)",
      "Formal WHO/PAHO ecosystem assessment completed to inform the evidence base (December 2025)",
      "A multisectoral, high-level Expert Advisory Committee convened by the Senior Minister of Health to guide development (December 2025)",
      "Full strategy draft completed with multisectoral partner input (March 2026)",
    ].join("\n"),
  ),
  developmentsCta: {
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
    `Applying Sector Strategy sections to ${ids.length} doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  // No Key Metrics in the mock — clear any that were authored so the row can't
  // appear under the Strategic Aim paragraph.
  for (const id of ids) tx.patch(id, (p) => p.set(SECTIONS).unset(["keyMetrics"]));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
