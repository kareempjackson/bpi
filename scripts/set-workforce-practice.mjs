/**
 * Populates the "In practice" section on the Workforce & Talent Development
 * sector document with the approved copy: lead, a "Programs Underway" bullet
 * list, a "What This Creates" closing statement, and the two buttons. No image
 * (the closing statement takes the bottom slot). Real, editable CMS data.
 *
 * Patches every doc matching slug `workforce` (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/set-workforce-practice.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-workforce-practice.mjs",
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
const cta = (label, href) => ({ _type: "cta", label: str(label), href });

const LEAD =
  "BPI is mobilizing a world-class, future-ready talent ecosystem, positioning Barbados as a regional leader in sustainable pharmaceutical production. This means preparing the next generation of scientists, technicians, engineers, regulators, and industry professionals through workforce planning, strategic partnerships, and training programs designed to create sustainable employment while building the skills a competitive, resilient pharmaceutical ecosystem requires.";

// Bold term + description. The section joins them with " – ".
const LIST = [
  {
    term: "EMPOWER Digital Manufacturing Academy",
    body: "a partnership with Empower Swiss SARL building Caribbean pharmaceutical workforce capabilities through digital training and manufacturing academies, drawing on health workforce strengthening tools deployed across 30+ countries. Includes a learning management system and virtual labs for scalable Caribbean access, workforce mapping to align credentialing with the manufacturing value chain, and a five-year MOU currently in development.",
  },
  {
    term: "Barbados–Nigeria pharmaceutical skills pathway",
    body: "training across GMP, quality control, sterile manufacturing, and regulatory practice, developed alongside the AMA manufacturing initiative.",
  },
];

const CREATES_STATEMENT =
  "The BPI–AMA manufacturing initiative alone is projected to create 150 direct jobs within the facility over time, with a residual supporting workforce as the project sets up and expands.";

const PRACTICE = {
  showPractice: true,
  practiceHeading: str("What This Looks Like In Practice"),
  practiceLead: text(LEAD),
  practiceListHeading: str("Programs Underway"),
  practiceList: LIST.map((it, i) => ({
    _type: "practiceListItem",
    _key: `practice-item-${i}`,
    term: str(it.term),
    body: text(it.body),
  })),
  practiceCreatesLabel: str("What This Creates"),
  practiceCreatesStatement: text(CREATES_STATEMENT),
  practicePrimaryCta: cta("Partner With BPI", "/contact"),
  practiceSecondaryCta: cta("Contact us", "/contact"),
};

async function run() {
  const ids = await client.fetch(
    `*[_type == "sector" && slug.current == "workforce"]._id`,
  );

  if (!ids.length) {
    console.error("No sector with slug 'workforce' found.");
    process.exit(1);
  }

  console.log(
    `Setting "In practice" on ${ids.length} workforce doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  // Clear any stale body/image so only the new structure shows.
  for (const id of ids) {
    tx.patch(id, (p) => p.set(PRACTICE).unset(["practiceBody", "practiceImage"]));
  }
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
