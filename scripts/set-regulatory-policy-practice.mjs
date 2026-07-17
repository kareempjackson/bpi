/**
 * Populates the "In practice" section on the Regulatory Development & Policy
 * sector document with the approved copy, buttons, and the three toned cards
 * (Milestones / International Partnerships / What's Next). Real, editable CMS
 * data — everything here can be changed in Studio → Sector → In practice.
 *
 * The cards take the bottom slot, so no fallback image renders.
 *
 * Patches every doc matching slug `regulatory-policy` (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/set-regulatory-policy-practice.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-regulatory-policy-practice.mjs",
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
  "BPI is implementing the phased legal, fiscal, and institutional frameworks that accelerate manufacturing, trade, and regulatory standards across the sector.";

// Two supporting paragraphs, separated by a blank line (the page splits on it).
const BODY = [
  "The Barbados Medical Products Authority (BMPA) Bill passed Parliament on July 1, 2026, establishing a modern, autonomous regulatory authority covering pharmaceuticals, vaccines, and medical devices. Work toward this began in 2023, led by Dr. Maryam Hinds under BPI, as part of the Government's broader streamlining of more than 40 pieces of legislation, positioning Barbados as a credible regional leader in regulatory science across CARICOM, Africa, and LATAM.",
  "BPI is also advancing a regulatory reliance model, drawing on assessments from trusted authorities, including potential collaboration with Nigeria's NAFDAC, a WHO Maturity Level 3 authority, to streamline product registration without compromising oversight.",
].join("\n\n");

const CARDS = [
  {
    tone: "default",
    title: "Milestones",
    body: "With PAHO's technical cooperation, the BMPA process has completed three self-benchmarking sessions (October 2024, July 2025, November 2025), targeting WHO Global Benchmarking Tool Maturity Level 3 by 2028, and developed an Institutional Development Plan using WHO competency frameworks.",
  },
  {
    tone: "blue",
    title: "International Partnerships",
    body: "Rwanda FDA (staff exchange and QMS support), Ghana's Centre for Plant Medicine Research (herbal medicines), the EU/Lithuania & Poland Twinning Programme (marketing authorization, GMP, clinical trials), PAHO/WHO Washington DC (GBT, vigilance, training), the UK's MHRA (scientific advice, vigilance), India's CDSCO and Indian Pharmacopoeia Commission (harmonization), and BioPharma Excellence Germany (regulatory pathways for biologics).",
  },
  {
    tone: "green",
    title: "What's Next",
    body: "Board appointment and governance setup, staff recruitment and transition, and operational rollout across market authorization, GMP, vigilance, laboratory, and clinical trial functions, with a WHO external review targeted for early 2028.",
  },
];

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
  practiceCards: CARDS.map((c, i) => ({
    _type: "practiceCard",
    _key: `card-${i}`,
    tone: c.tone,
    title: str(c.title),
    body: text(c.body),
  })),
};

async function run() {
  const ids = await client.fetch(
    `*[_type == "sector" && slug.current == "regulatory-policy"]._id`,
  );

  if (!ids.length) {
    console.error("No sector with slug 'regulatory-policy' found.");
    process.exit(1);
  }

  console.log(
    `Setting "In practice" + cards on ${ids.length} regulatory-policy doc(s) in ${projectId}/${dataset}…`,
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
