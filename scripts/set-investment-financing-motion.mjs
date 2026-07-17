/**
 * Adds the "In Motion" section + the Careers and Call-to-action page sections
 * to the Investment & Financing sector document, as real (editable) CMS data.
 *
 * - In Motion: light tone (navy text on the pale-blue canvas, convergence
 *   graphic on the right), reusing BPI's three live initiatives — all capital
 *   projects, so they fit the investment/financing story.
 * - Careers + Call-to-action: the standard closing blocks, set to the "blue"
 *   tone so they match this page's colour profile.
 *
 * Patches every doc matching slug `investment-financing` (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/set-investment-financing-motion.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-investment-financing-motion.mjs",
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
const cta = (label, href) => ({ _type: "cta", label: str(label), href });

// ── In Motion ────────────────────────────────────────────────────────────────
const MOTION_ITEMS = [
  {
    title: "PAHO Regional Supply Hub",
    body: "positioning Barbados as a distribution anchor for essential medicines and medical devices to more than 40 countries across the Caribbean and Latin America",
  },
  {
    title: "Neopharm QC Laboratory",
    body: "in active discussion with Neopharm Labs, a 30-year Canadian industry leader, to establish a pharmaceutical quality control testing laboratory in Barbados",
  },
  {
    title: "EU PharmaNext",
    body: "establishing an Investment Promotion and Business Development Office in BioPark Charleroi, Belgium, to connect European research, trade, and investment networks to Barbados",
  },
];

// ── Closing blocks ───────────────────────────────────────────────────────────
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
    `*[_type == "sector" && slug.current == "investment-financing"]._id`,
  );

  if (!ids.length) {
    console.error("No sector with slug 'investment-financing' found.");
    process.exit(1);
  }

  console.log(
    `Adding In Motion + Careers + CTA to ${ids.length} investment-financing doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  // unset any stale motionCta/motionImage from the old seed so the header shows just "In Motion".
  for (const id of ids) tx.patch(id, (p) => p.set(PATCH).unset(["motionCta", "motionImage"]));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
