/**
 * Seeds the Events page singleton — the copy around the three /events sections
 * ("Upcoming BPI events", "Events we're attending next", "Where we've been").
 * The cards themselves come from `event` and `engagement` documents; this only
 * sets the surrounding headings, intros, and the empty-state message.
 *
 * Everything here is editable in Studio → Events page. Re-running resets these
 * fields to the copy below — it does not merge.
 *
 * Run:   node --env-file=.env.local scripts/set-events-page.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-events-page.mjs",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

/** Wrap a plain English string as an internationalizedArrayString value. */
const str = (value) => [
  {
    _key: "en",
    _type: "internationalizedArrayStringValue",
    language: "en",
    value,
  },
];

/** Wrap a plain English string as an internationalizedArrayText value. */
const text = (value) => [
  {
    _key: "en",
    _type: "internationalizedArrayTextValue",
    language: "en",
    value,
  },
];

/**
 * Wrap a plain English string as an internationalizedArrayPortableText value —
 * the WYSIWYG prose fields. One "normal" block per blank-line-separated
 * paragraph; deterministic keys so re-runs are stable.
 */
const pt = (value) => [
  {
    _key: "en",
    _type: "internationalizedArrayPortableTextValue",
    language: "en",
    value: String(value)
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((paragraph, i) => ({
        _type: "block",
        _key: `b${i}`,
        style: "normal",
        markDefs: [],
        children: [
          { _type: "span", _key: `b${i}s0`, text: paragraph, marks: [] },
        ],
      })),
  },
];

const doc = {
  _id: "eventsPage",
  _type: "eventsPage",
  seoTitle: str("Events — BPI"),
  seoDescription: text(
    "Workshops, conferences, and gatherings hosted by Barbados Pharmaceuticals Inc.",
  ),
  title: str("Events at BPI"),
  upcomingHeading: str("Upcoming BPI events"),
  upcomingIntro: pt(
    "Workshops, conferences, and gatherings we’re hosting. Reserve your place — registration runs through Eventbrite.",
  ),
  attendingHeading: str("Events we’re attending next"),
  attendingIntro: pt(
    "Where to find the BPI team out in the world — the conferences, missions, and workshops we’re heading to next.",
  ),
  attendingEmptyState: pt("Stay tuned — we’ll share where to meet BPI next."),
  pastHeading: str("Where we’ve been"),
  pastIntro: pt(
    "A look back at the gatherings BPI has joined — the rooms where partnerships, policy, and progress take shape.",
  ),
};

client
  .createOrReplace(doc)
  .then(() => console.log(`Seeded Events page into "${dataset}".`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
