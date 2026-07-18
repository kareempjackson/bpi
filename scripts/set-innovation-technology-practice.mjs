/**
 * Seeds the "In practice" section ("What This Looks Like In Practice") on the
 * Innovation & Technology sector document, as real (editable) CMS data.
 *
 * These are the same fields any editor can change in Studio → Sector → In
 * practice. This script just populates innovation-technology to match the
 * approved design. Re-runnable (idempotent set()).
 *
 * Patches every document matching slug `innovation-technology` (published + any
 * draft) so the change shows whether or not the doc is currently being edited.
 *
 * Run:   node --env-file=.env.local scripts/set-innovation-technology-practice.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-innovation-technology-practice.mjs",
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

// English i18n wrappers — headings/CTAs stored as `string`, the lead + body as
// `text` (see sanity/schemaTypes/documents/sector.ts).
const str = (value) => [
  { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value },
];
const text = (value) => [
  { _key: "en", _type: "internationalizedArrayTextValue", language: "en", value },
];

const PRACTICE = {
  showPractice: true,
  practiceHeading: str("What This Looks Like In Practice"),
  practiceLead: text(
    "BPI is establishing a regional innovation hub advancing AI-enabled manufacturing, smart supply chains, and digital quality systems, serving as a center of excellence for the wider region.",
  ),
  practiceBody: text(
    "Pharmaceutical innovation requires more than talent and good ideas. It requires research facilities, regulatory clarity, access to patient data, capital, and connectivity to global networks. Barbados is deliberately building these as an interconnected ecosystem, rather than as isolated projects, where researchers, entrepreneurs, manufacturers, and policymakers work together.",
  ),
  practicePrimaryCta: {
    _type: "cta",
    label: str("Partner With BPI"),
    href: "/contact",
  },
  practiceSecondaryCta: {
    _type: "cta",
    label: str("Contact us"),
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
    `Seeding "In practice" on ${ids.length} innovation-technology doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(PRACTICE));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done. The 'In practice' section now renders on the page.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
