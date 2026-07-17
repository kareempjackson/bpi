/**
 * Populates the "In practice" section on the Investment & Financing sector
 * document with the approved copy + buttons. Real, editable CMS data —
 * everything here can be changed in Studio → Sector → In practice.
 *
 * The image is left empty: the page falls back to a Home/sector photo until an
 * editor uploads the real finance/partnership shot.
 *
 * Patches every doc matching slug `investment-financing` (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/set-investment-financing-practice.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-investment-financing-practice.mjs",
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
  "BPI is creating the mechanisms to attract blended finance, innovation funding, and risk capital that can accelerate pharmaceutical sector growth.";

// Two supporting paragraphs, separated by a blank line (the page splits on it).
const BODY = [
  "This means actively engaging a network of development banks, private banks, foundations, and other funders to finance the sector's growth, including joint financing on select projects with development finance institutions such as Afreximbank, the African Development Bank, and the European Investment Bank.",
  "A joint effort between the EU, Guyana, and Barbados, aligned with the EU-LAC Global Gateway Investment Agenda, is supporting national and regional investment and research for health resilience in the Caribbean, backed by a €3 million grant across all consortium partners.",
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
    `*[_type == "sector" && slug.current == "investment-financing"]._id`,
  );

  if (!ids.length) {
    console.error("No sector with slug 'investment-financing' found.");
    process.exit(1);
  }

  console.log(
    `Setting "In practice" on ${ids.length} investment-financing doc(s) in ${projectId}/${dataset}…`,
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
