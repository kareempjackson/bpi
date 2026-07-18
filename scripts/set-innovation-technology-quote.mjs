/**
 * Seeds the "How It's Funded" quote-spotlight section on the Innovation &
 * Technology sector document, as real (editable) CMS data — heading, lead,
 * a "Partner With BPI" button, the pull-quote, and its attribution (portrait +
 * socials fall back to the Home leader / defaults until edited).
 *
 * Same fields any editor can change in Studio → Sector → Quote. Re-runnable.
 *
 * Run:   node --env-file=.env.local scripts/set-innovation-technology-quote.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-innovation-technology-quote.mjs",
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

const str = (value) => [
  { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value },
];
const text = (value) => [
  { _key: "en", _type: "internationalizedArrayTextValue", language: "en", value },
];

const QUOTE = {
  showQuote: true,
  quoteHeading: str("How It's Funded"),
  quoteLead: text(
    "Barbados backs this with real incentives for private R&D investment, including a 50% R&D tax credit, a 25% Productivity & Innovation Credit, and a 4.5% Patent Box on qualifying IP income, alongside public and EU funding for shared infrastructure too specialized for any single company to build alone.",
  ),
  quoteCta: {
    _type: "cta",
    label: str("Partner With BPI"),
    href: "/contact",
  },
  quoteText: text(
    "By partnering directly with the Government of Barbados and with support from the European Union, we are applying our global talent-sourcing and incubation model to a real-world public health challenge in an underrepresented population.",
  ),
  quoteAttribution: str("Leisel Juman"),
  quoteRole: str("CEO, BioMed X"),
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
    `Seeding "How It's Funded" quote on ${ids.length} innovation-technology doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(QUOTE));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done. The quote section now renders on the page.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
