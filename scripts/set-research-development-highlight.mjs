/**
 * Populates the "Highlight" section on the Research & Development sector
 * document with the approved mockup copy. Real, editable CMS data — everything
 * here can be changed in Studio → Sector → Highlight.
 *
 * The image is left empty: the page falls back to a Home/sector photo until an
 * editor uploads the real shot.
 *
 * Patches every doc matching slug `research-development` (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/set-research-development-highlight.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-research-development-highlight.mjs",
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

const BODY =
  "BPI is building a world-class biotech R&D cluster aligned with regional priorities, strengthening clinical trial readiness and cross-regional scientific collaboration. Under the BPI-AMA manufacturing initiative, Viriom and AMA are collaborating on technology transfer to establish local manufacturing and distribution of rapid diagnostic test kits, responding to regional public health priorities and positioning AMA at the forefront of HIV treatment and diagnostics delivery across African and Caribbean markets.";

const STATEMENT =
  "BPI is also building a network of international research partnerships: with Ghana's Centre for Plant Medicine Research on herbal medicines regulation and research, with BioPharma Excellence in Germany on regulatory pathways and clinical development advisory for biologics, and by linking Barbados' clinical networks with Nigeria's National Clinical Trials Consortium.";

const HIGHLIGHT = {
  showHighlight: true,
  highlightHeading: str("What This Looks Like In Practice"),
  highlightBody: text(BODY),
  highlightStatement: text(STATEMENT),
};

async function run() {
  const ids = await client.fetch(
    `*[_type == "sector" && slug.current == "research-development"]._id`,
  );

  if (!ids.length) {
    console.error("No sector with slug 'research-development' found.");
    process.exit(1);
  }

  console.log(
    `Setting "Highlight" on ${ids.length} research-development doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(HIGHLIGHT));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
