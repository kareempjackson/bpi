/**
 * Populates the "In practice" section on the Market Access sector document
 * with the approved copy + buttons. Real, editable CMS data — everything here
 * can be changed in Studio → Sector → In practice.
 *
 * The image is left empty: the page falls back to a Home/sector photo until an
 * editor uploads the real container/logistics shot.
 *
 * Patches every doc matching slug `market-access` (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/set-market-access-practice.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-market-access-practice.mjs",
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

// English i18n wrappers — match the internationalized-array shape.
const str = (value) => [
  { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value },
];
const text = (value) => [
  { _key: "en", _type: "internationalizedArrayTextValue", language: "en", value },
];

const LEAD =
  "BPI is accelerating a coordinated regional framework that expands South-South trade and positions Barbados as a central hub for pharmaceutical market connectivity across the Caribbean, Latin America, and Africa.";

// Two supporting paragraphs, separated by a blank line (the page splits on it).
const BODY = [
  "The clearest example in motion: a pharmaceutical trade route between Barbados and Nigeria that opens reciprocal market entry, giving CARICOM and LATAM access to Nigerian producers, and ECOWAS and AfCFTA access to Barbados-based manufacturers. It's designed as a working proof of concept for South-South trade, institutionally backed by the BPI–PVAC partnership MOU and a Ministry of Health MOU between Barbados and Nigeria.",
  "The ambition behind this work is regional in scale: bridging trade corridors between Africa, the Caribbean, and Latin America, leveraging both AfCFTA and CARICOM frameworks to reach an estimated 1.8 billion people across these regions.",
].join("\n\n");

const PRACTICE = {
  showPractice: true,
  practiceHeading: str("What This Looks Like In Practice"),
  practiceLead: text(LEAD),
  practiceBody: text(BODY),
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
    `*[_type == "sector" && slug.current == "market-access"]._id`,
  );

  if (!ids.length) {
    console.error("No sector with slug 'market-access' found.");
    process.exit(1);
  }

  console.log(
    `Setting "In practice" on ${ids.length} market-access doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(PRACTICE));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
