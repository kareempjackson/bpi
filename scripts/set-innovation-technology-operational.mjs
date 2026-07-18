/**
 * Seeds the "Operational Now" section on the Innovation & Technology sector
 * document, as real (editable) CMS data — a heading, a bulleted list of live
 * programs, and a "Partner With BPI" button (full-width image falls back to a
 * Home photo until an editor uploads a specific one).
 *
 * These are the same fields any editor can change in Studio → Sector →
 * Operational now. Re-runnable (idempotent set()).
 *
 * Patches every document matching slug `innovation-technology` (published + any
 * draft) so the change shows whether or not the doc is currently being edited.
 *
 * Run:   node --env-file=.env.local scripts/set-innovation-technology-operational.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-innovation-technology-operational.mjs",
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

// English i18n wrappers — headings/terms/CTAs stored as `string`, descriptions
// as `text` (see sanity/schemaTypes/documents/sector.ts).
const str = (value) => [
  { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value },
];
const text = (value) => [
  { _key: "en", _type: "internationalizedArrayTextValue", language: "en", value },
];

// Bullet list items get stable _keys so re-runs update in place.
const listItem = (key, term, body) => ({
  _key: key,
  _type: "operationalListItem",
  term: str(term),
  body: text(body),
});

const OPERATIONAL = {
  showOperational: true,
  operationalHeading: str("Operational Now"),
  operationalList: [
    listItem(
      "living-lab",
      "Barbados Living Laboratory (launched February 2025)",
      "a research facility at the Best-dos Santos Public Health Laboratory offering genomic sequencing, molecular diagnostics, and chronic disease research, including work on cancer, rare diseases, and HLA typing for transplants. Supported by BBD $2.5 million in government funding, operating in partnership with PAHO.",
    ),
    listItem(
      "biomed-x",
      "BioMed X Barbados (launched January 2026)",
      "a research partnership between BioMed X and the Government of Barbados, backed by the EU's PharmaNext programme. Its first project applies AI-enabled precision medicine to early diabetic kidney disease in Barbados.",
    ),
  ],
  operationalPrimaryCta: {
    _type: "cta",
    label: str("Partner With BPI"),
    href: "/contact",
  },
};

async function run() {
  const ids = await client.fetch(
    `*[_type == "sector" && slug.current == "innovation-technology"]._id`,
  );

  if (!ids.length) {
    console.error(
      "No sector with slug 'innovation-technology' found. Seed it first: node --env-file=.env.local scripts/seed-sectors.mjs",
    );
    process.exit(1);
  }

  console.log(
    `Seeding "Operational Now" on ${ids.length} innovation-technology doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(OPERATIONAL));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done. The 'Operational Now' section now renders on the page.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
