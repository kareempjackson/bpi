/**
 * Adds the "In Motion" section + the Careers and Call-to-action page sections
 * to the Research & Development sector document, as real (editable) CMS data.
 * Page order after this: Header → Highlight → In Motion → Careers → CTA.
 *
 * - In Motion: light tone (navy text on the pale-blue canvas, convergence
 *   graphic on the right), with three live R&D initiatives drawn from the
 *   sector's real partnership work.
 * - Careers + Call-to-action: the standard closing blocks, "blue" tone to match
 *   this page's colour profile (identical copy to market-access / workforce).
 *
 * Patches every doc matching slug `research-development` (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/set-research-development-sections.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-research-development-sections.mjs",
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

// ── In Motion ────────────────────────────────────────────────────────────────
const MOTION_ITEMS = [
  {
    title: "BPI–AMA Diagnostics Manufacturing",
    body: "Viriom and AMA are collaborating on technology transfer to establish local manufacturing and distribution of rapid diagnostic test kits for African and Caribbean markets.",
  },
  {
    title: "Ghana Plant Medicine Partnership",
    body: "A research partnership with Ghana's Centre for Plant Medicine Research on herbal medicines regulation and research.",
  },
  {
    title: "International Clinical & Regulatory Network",
    body: "Linking Barbados' clinical networks with Nigeria's National Clinical Trials Consortium, with BioPharma Excellence in Germany advising on regulatory pathways and clinical development for biologics.",
  },
];

// ── Closing blocks (blue tone) ───────────────────────────────────────────────
const CAREERS = {
  _type: "careersSection",
  _key: "careers-1",
  enabled: true,
  eyebrow: str("Join the team"),
  heading: str("Help build the architecture of care"),
  lead: text(
    "We are assembling the people who will make Caribbean pharmaceutical sovereignty real.",
  ),
  body: text(
    "From manufacturing and quality control to regulatory affairs and partnerships, BPI is hiring across the disciplines that turn dependence into capacity.",
  ),
  primaryCta: cta("See open roles", "/careers"),
  secondaryCta: cta("Contact BPI", "/contact"),
  tone: "blue",
};

const CALL_TO_ACTION = {
  _type: "ctaSection",
  _key: "cta-1",
  enabled: true,
  heading: str("Ready to build with us?"),
  body: text(
    "Whether you are an investor, manufacturer, or partner, BPI can open a direct route into the Caribbean pharmaceutical market. Let's talk about where you fit.",
  ),
  primaryCta: cta("Become an Investor", "/investors"),
  secondaryCta: cta("Contact BPI", "/contact"),
  tone: "blue",
};

const PATCH = {
  showMotion: true,
  motionHeading: str("In Motion"),
  motionTone: "light",
  motionItems: MOTION_ITEMS.map((it, i) => ({
    _type: "motionItem",
    _key: `motion-${i}`,
    title: str(it.title),
    body: text(it.body),
  })),
  pageSections: [CAREERS, CALL_TO_ACTION],
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
    `Adding In Motion + Careers + CTA to ${ids.length} research-development doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  // Light tone uses the convergence graphic — clear any stale motion CTA/image.
  for (const id of ids) {
    tx.patch(id, (p) => p.set(PATCH).unset(["motionCta", "motionImage"]));
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
