/**
 * Seeds the About page's "The need for change" section into Sanity so it becomes
 * editable in Studio. This block used to be hardcoded in the page component; the
 * page now reads `needHeading` / `needIntro` / `needStatement` / `needClosing`
 * and falls back to the same copy below when they're empty. This writes those
 * defaults into the CMS so nothing changes visually, but everything becomes
 * WYSIWYG-editable.
 *
 * Heading is a plain string; the three body fields are Portable Text (WYSIWYG).
 *
 * Re-running resets these four fields to the copy below — it does not merge.
 *
 * Run:   node --env-file=.env.local scripts/set-about-need-for-change.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-about-need-for-change.mjs",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

/** Wrap a plain English string as an internationalizedArrayString value. */
const str = (value) => [
  { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value },
];

/**
 * Wrap plain English paragraph(s) as an internationalizedArrayPortableText
 * value. Each string becomes one `normal` Portable Text block (deterministic
 * keys — the workflow env blocks Math.random/Date.now).
 */
const pt = (...paragraphs) => {
  const blocks = paragraphs.map((text, i) => ({
    _type: "block",
    _key: `b${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `b${i}s0`, text, marks: [] }],
  }));
  return [
    {
      _key: "en",
      _type: "internationalizedArrayPortableTextValue",
      language: "en",
      value: blocks,
    },
  ];
};

const FIELDS = {
  needHeading: str("The need for change"),
  needIntro: pt(
    "In 2020, the COVID-19 pandemic exposed what small island states already knew: when global supply chains fracture, the Caribbean waits longest and receives least. Barbados imported almost every medicine its population needed.",
  ),
  needStatement: pt(
    "That dependency cost the country during the pandemic, and it continues to cost it today.",
  ),
  needClosing: pt(
    "Barbados Pharmaceutical Inc. was established in 2023 by the Government of Barbados, operating under the Ministry of Health and Wellness, to address that structural vulnerability directly. BPI's mandate is to develop the pharmaceutical ecosystem needed to attract investment, build local manufacturing capacity, and position Barbados as a production and distribution hub for CARICOM and beyond.",
  ),
};

await client.createIfNotExists({ _id: "aboutPage", _type: "aboutPage" });
const result = await client.patch("aboutPage").set(FIELDS).commit();
console.log(`✓ ${dataset}: wrote need-for-change fields to ${result._id}`);
