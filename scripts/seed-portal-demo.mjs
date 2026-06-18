/**
 * Seeds demo portal content into Sanity so the investor/partner portal has
 * something to show. Idempotent (fixed _ids + createOrReplace) and safe to
 * re-run. Creates two `portalPage` docs — one investor-tier, one partner-tier
 * — exercising every PortalBody renderer (text, headings, stat cards, metrics
 * table, list, quote).
 *
 * Run:  node --env-file=.env.local scripts/seed-portal-demo.mjs
 * Clean: node --env-file=.env.local scripts/seed-portal-demo.mjs --clean
 *
 * Portal pages have NO R2 dependency, so they render fully with no upload.
 * (Resources/downloads need a real file uploaded in Studio.)
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/seed-portal-demo.mjs",
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

// ── tiny portable-text builders ──────────────────────────────────────────────
let k = 0;
const key = () => `k${(k += 1)}`;

const para = (text) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

const heading = (text, style = "h2") => ({
  _type: "block",
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

const quote = (text) => ({
  _type: "block",
  _key: key(),
  style: "blockquote",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

const bullets = (items) =>
  items.map((text) => ({
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  }));

const stat = (label, value, delta, note) => ({
  _type: "statCard",
  _key: key(),
  label,
  value,
  ...(delta ? { delta } : {}),
  ...(note ? { note } : {}),
});

const table = (caption, columns, rows) => ({
  _type: "metricsTable",
  _key: key(),
  caption,
  columns,
  rows: rows.map((cells) => ({ _type: "row", _key: key(), cells })),
});

// ── demo documents ───────────────────────────────────────────────────────────
const investorUpdate = {
  _id: "portalPageDemoInvestorUpdate",
  _type: "portalPage",
  title: "Q2 2026 Investor Update",
  slug: { _type: "slug", current: "q2-2026-investor-update" },
  audiences: ["investor"],
  order: 1,
  summary:
    "Quarterly performance, manufacturing build-out, and the road to commercialization.",
  body: [
    para(
      "This update covers Barbados Pharmaceutical Inc.'s progress through the second quarter of 2026 — financial performance, pipeline milestones, and what to watch over the next two quarters. Figures are unaudited and provided for current investors only.",
    ),
    heading("Performance at a glance"),
    stat("Revenue (Q2)", "$4.2M", "+18% QoQ", "Driven by contract manufacturing"),
    stat("Gross margin", "61%", "+3 pts", "Yield improvements on Line 2"),
    stat("Cash runway", "19 months", "", "At current burn, pre-raise"),
    para(
      "Operating discipline held through the quarter. The margin expansion reflects higher line yields and a more favorable product mix as the contract-manufacturing book grew.",
    ),
    heading("Pipeline progress"),
    ...bullets([
      "Sterile fill-finish suite validation completed two weeks ahead of schedule.",
      "First commercial supply agreement signed with a regional distributor.",
      "Regulatory dossier for the lead product accepted for review.",
    ]),
    table(
      "Lead programs — status as of quarter end",
      ["Program", "Stage", "Status", "Next milestone"],
      [
        ["BPI-101", "Commercial", "On track", "Scale-up batch — Q3"],
        ["BPI-204", "Validation", "On track", "Stability data — Q3"],
        ["BPI-310", "Tech transfer", "Watch", "Site readiness — Q4"],
      ],
    ),
    heading("Outlook"),
    para(
      "We expect revenue to continue compounding as the manufacturing book fills and the first commercial supply agreement ramps. The priority for Q3 is converting the validated capacity into signed, recurring volume.",
    ),
    quote(
      "Our thesis hasn't changed: build sovereign manufacturing capacity, then fill it with durable, recurring demand.",
    ),
  ],
};

const partnerKit = {
  _id: "portalPageDemoPartnerKit",
  _type: "portalPage",
  title: "Partner Enablement Kit",
  slug: { _type: "slug", current: "partner-enablement-kit" },
  audiences: ["partner"],
  order: 2,
  summary:
    "Everything a distribution or manufacturing partner needs to get started with BPI.",
  body: [
    para(
      "Welcome aboard. This kit orients new distribution and manufacturing partners to how BPI works, who to talk to, and what to expect in the first 90 days.",
    ),
    heading("What you get access to"),
    ...bullets([
      "Product specifications, certificates of analysis, and regulatory documentation.",
      "Co-branded marketing assets and approved messaging.",
      "A named partner-success contact and a shared onboarding plan.",
    ]),
    heading("Onboarding timeline"),
    table(
      "Typical first-90-days plan",
      ["Phase", "Timeline", "Owner"],
      [
        ["Agreement & access", "Week 1", "BPI + Partner"],
        ["Technical onboarding", "Weeks 2–4", "BPI"],
        ["First order & QA", "Weeks 5–8", "Partner"],
        ["Review & scale", "Weeks 9–12", "Joint"],
      ],
    ),
    para(
      "Questions during onboarding go to your partner-success contact first — they'll route anything technical or regulatory to the right team.",
    ),
  ],
};

// ── run ──────────────────────────────────────────────────────────────────────
const ids = [investorUpdate._id, partnerKit._id];
const clean = process.argv.includes("--clean");

console.log(
  `${clean ? "Cleaning" : "Seeding"} demo portal content → project ${projectId}, dataset "${dataset}"`,
);

try {
  if (clean) {
    await client.delete(ids[0]);
    await client.delete(ids[1]);
    console.log("Deleted:", ids.join(", "));
  } else {
    for (const doc of [investorUpdate, partnerKit]) {
      await client.createOrReplace(doc);
      console.log(`Upserted ${doc._id}  →  ${doc.title} [${doc.audiences.join(", ")}]`);
    }
    console.log(
      "\nDone. Sign in via the dev bypass and you'll see both pages (the preview user holds both tiers).",
    );
  }
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exit(1);
}
