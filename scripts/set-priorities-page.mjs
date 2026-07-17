/**
 * Seeds the Priorities page singleton (`prioritiesPage`). The page code already
 * reads every field below via PRIORITIES_PAGE_QUERY — but the document was
 * never created, so the page fell back to hardcoded defaults and Studio showed
 * an empty "Priorities page". This writes those same defaults into the CMS so
 * nothing changes visually, but everything becomes editable in Studio.
 *
 * NOT seeded:
 *  - The numbered strategic-priorities list: real `priority` documents already
 *    exist (4 of them) and take precedence in the page, so the doc's own
 *    `priorities` array is intentionally left empty.
 *  - Images (heroImage / prioritiesImage): they render once an editor uploads
 *    one; until then the page falls back to the Home page's imagery.
 *
 * Re-running resets these fields to the copy below — it does not merge. Uploaded
 * images live in fields this never touches, so they survive a re-run.
 *
 * Run:   node --env-file=.env.local scripts/set-priorities-page.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-priorities-page.mjs",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

/** Wrap a plain English string as an internationalizedArrayString value. */
const str = (value) => [
  { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value },
];

/** Wrap a plain English string as an internationalizedArrayText value. */
const text = (value) => [
  { _key: "en", _type: "internationalizedArrayTextValue", language: "en", value },
];

/** An impact stat row (big number + label). */
const stat = (key, value, description) => ({
  _key: key,
  _type: "stat",
  value: str(value),
  description: text(description),
});

const FIELDS = {
  seoTitle: str("Strategic Priorities — BPI"),
  seoDescription: text(
    "Our strategic priorities are designed to accelerate industry growth, improve healthcare outcomes, and position Barbados as a leading pharmaceutical hub in the Caribbean.",
  ),

  // ── Hero ──
  heroBody: text(
    "BPI is focused on four strategic priorities. Each one a deliberate step toward a Caribbean that manufactures, distributes, and regulates its own medicines.",
  ),
  heroHeadlineLine1: str("Strategic"),
  heroHeadlineLine2: str("Priorities"),
  heroCta: { _type: "cta", label: str("Partner With BPI"), href: "/contact" },

  // ── Impact stats ──
  statsIntro: text(
    "Our commitment to excellence is reflected in the impact we continue to create across the pharmaceutical sector.",
  ),
  statsHeading: str("Advancing Pharmaceutical Excellence"),
  stats: [
    stat("s1", "25+", "Strategic Partnerships"),
    stat("s2", "50+", "Training & Initiatives"),
    stat("s3", "100+", "Professionals Trained"),
    stat("s4", "10+", "Innovative Projects"),
    stat("s5", "5+", "Market Collaborations"),
  ],

  // ── Strategic priorities ──
  // `priorities` (the doc's own numbered list) is intentionally omitted: real
  // `priority` documents exist and take precedence in the page.
  prioritiesHeading: str("Strategic Priorities"),
  prioritiesIntro: text(
    "BPI is focused on four strategic priorities. Each one a deliberate step toward a Caribbean that manufactures, distributes, and regulates its own medicines.",
  ),
  prioritiesCta: { _type: "cta", label: str("Partner With BPI"), href: "/contact" },

  // ── Why BPI (closing) ──
  closingEyebrow: str("What We Are Building"),
  closingHeadlineLine1: str("Why BPI"),
  closingHeadlineLine2: str("Political + Investment"),
  closingBody: text(
    "BPI is how a small island secures its own health sovereignty, reducing dependence on imported medicine and protecting the country from the next shipping disruption or export ban. For investors, it’s a state-backed partner and equity co-investor that de-risks land, regulatory pathways, financing, and market entry into a fast-diversifying global pharmaceutical industry.",
  ),
  closingCta: { _type: "cta", label: str("Partner With BPI"), href: "/impact" },

  // ── Latest from BPI ──
  latestHeading: str("Latest from BPI"),
  latestShowCount: 3,
};

// createIfNotExists makes the singleton on first run; the patch then applies the
// copy above (including to a doc that already exists, which createIfNotExists
// alone would skip).
await client.createIfNotExists({ _id: "prioritiesPage", _type: "prioritiesPage" });
const result = await client.patch("prioritiesPage").set(FIELDS).commit();
console.log(`✓ ${dataset}: wrote ${result._id}`);
