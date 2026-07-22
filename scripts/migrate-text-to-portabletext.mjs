#!/usr/bin/env node
/**
 * ──────────────────────────────────────────────────────────────────────────
 * PROSE → PORTABLE TEXT migration  (WYSIWYG rollout)
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Converts plain-text i18n fields (`internationalizedArrayText`) into
 * Portable Text i18n fields (`internationalizedArrayPortableText`) IN PLACE,
 * preserving the exact wording. Run this AFTER (or alongside) flipping the
 * matching schema field types.
 *
 * Each stored item currently looks like:
 *   { _key:"en", _type:"internationalizedArrayTextValue", language:"en",
 *     value:"<plain string>" }
 * and becomes:
 *   { _key:"en", _type:"internationalizedArrayPortableTextValue",
 *     language:"en", value:[ <portable text blocks> ] }
 *
 * Conversion rules (FORMAT-ONLY — never alters words):
 *   • Split the string on blank lines (`\n\n`) into paragraphs → one `block`
 *     (style "normal") each.
 *   • Parse the legacy `**bold**` convention into spans with `marks:["strong"]`.
 *   • Keys are DETERMINISTIC (index-based) so re-runs are reproducible and no
 *     blocked Math.random/Date.now is used.
 *
 * IDEMPOTENT: any item whose `value` is already an array is skipped; null /
 * empty values are skipped. Safe to re-run — a second run reports 0 changes.
 *
 * USAGE
 *   # Preview (default — nothing is written):
 *   node --env-file=.env.local scripts/migrate-text-to-portabletext.mjs \
 *        --dataset=staging --types=prioritiesPage
 *
 *   # Actually patch:
 *   node --env-file=.env.local scripts/migrate-text-to-portabletext.mjs \
 *        --dataset=staging --types=prioritiesPage --apply
 *
 * ENV (read from .env.local via --env-file):
 *   SANITY_PROJECT_ID | NEXT_PUBLIC_SANITY_PROJECT_ID   (required)
 *   SANITY_DATASET    | NEXT_PUBLIC_SANITY_DATASET       (or --dataset=...)
 *   SANITY_API_WRITE_TOKEN | SANITY_WRITE_TOKEN          (required for --apply)
 *
 * apiVersion is pinned to 2024-01-01.
 * ──────────────────────────────────────────────────────────────────────────
 */

import { createClient } from "@sanity/client";

// ─────────────────────────────────────────────────────────────────── args ──
const argv = process.argv.slice(2);
const getArg = (name) => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  const eq = hit.indexOf("=");
  return eq === -1 ? true : hit.slice(eq + 1);
};

const APPLY = getArg("apply") === true;
const DRY_RUN = !APPLY; // default true; only --apply writes.
const BATCH_SIZE = Number(getArg("batch") || 50);
const typesArg = getArg("types");
const TYPE_FILTER =
  typeof typesArg === "string"
    ? typesArg
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : null; // null → every type in FIELD_MAP

// ────────────────────────────────────────────────────────────────── config ──
const projectId =
  process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  getArg("dataset") ||
  process.env.SANITY_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET;
const token =
  process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN;

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!projectId)
  fail(
    "Missing project id. Set SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID.",
  );
if (!dataset)
  fail("Missing dataset. Pass --dataset=staging (or set SANITY_DATASET).");
if (!token && APPLY)
  fail(
    "Missing write token. Set SANITY_API_WRITE_TOKEN (or SANITY_WRITE_TOKEN). A read token is NOT enough for --apply.",
  );

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// The item `_type` a portable-text i18n field stores per language (matches the
// plugin's generated `internationalizedArrayPortableTextValue`).
const PT_VALUE_TYPE = "internationalizedArrayPortableTextValue";

/**
 * DECLARATIVE FIELD MAP — which plain-text i18n fields to convert per document
 * type. Add more types/fields here as the WYSIWYG rollout widens; the engine
 * below is generic over top-level i18n text fields.
 *
 * Pilot scope: the 4 prose fields on the `prioritiesPage` singleton.
 * (`closingBody` is legacy/orphan data — kept here so its wording converts too,
 * though the field has no current schema definition or render site.)
 */
const FIELD_MAP = {
  prioritiesPage: ["heroBody", "statsIntro", "prioritiesIntro", "closingBody"],
  contactPage: ["formDescription"],
  blogPage: ["intro"],
  sectorsPage: ["heroBody", "sixIntro"],
  partnersPage: ["heroBody"],
  job: ["description", "longSummary"], // summary EXCLUDED — SEO meta + search string.
  portalResource: ["description"],
  impactPage: ["heroBody", "whyBody", "whyQuote"],
  careersPage: [
    "heroDescription",
    "whyIntro",
    "applyBody",
    "jobsDescription",
    "equalOpportunityParagraph1",
    "equalOpportunityParagraph2",
  ],
  aboutPage: [
    "visionDescription",
    "missionDescription",
    "statsDescription",
    "leadershipDescription",
    "leadershipContactDescription",
  ],
  // NOTE (homePage): leaderBody (renders as an H2) and careersLead (renders as
  // an H3) stay PLAIN — they're heading lockups, not prose. heroBody (animated
  // hero slide) and sectorsBody (dynamic per-sector colour) ARE converted; their
  // render sites keep the animation/colour and route text through PortableTextBody.
  homePage: [
    "architectureDescription",
    "whyBody",
    "careersBody",
    "heroBody",
    "leaderQuote",
    "sectorsBody",
    "whyQuote",
  ],
  // featuredStatBody IS converted — the RuleNote wrapper was changed <p> → <div>
  // so a Portable Text block nests validly.
  initiativesPage: [
    "heroBody",
    "workInMotionBody",
    "otherWorksBody",
    "otherWorksBlueBody",
    "otherWorksGreenBody",
    "buildingFutureBody",
    "featuredStatBody",
  ],
  // ── Wave 2 ────────────────────────────────────────────────────────────────
  // investorsPage prose bodies/intros/leads. EXCLUDED (stay plain): heroTagline
  // (italic tagline), tractionHeading (italic heading), all quote fields,
  // seoDescription. Card/note bodies live on investorCard/investorNote objects.
  // ── Batch 3: initiative detail template ─────────────────────────────────
  // CONVERTED prose bodies/quotes. LEFT PLAIN (not listed): currentStatusLead,
  // outlookBody, quoteText, roadmapStatement (display/two-tone lockups);
  // whatThisIsBody (bespoke first-paragraph lead styling); whyBarbadosBody,
  // developmentsBody, nextStepsBody (newline-split bullet lists); excerpt (also
  // used as SEO meta + header subtitle string); headerSubtitle (pixel-spec hero).
  initiative: [
    "quoteSupporting",
    "whyMattersBody",
    "impactBody",
    "ecosystemBody",
    "currentStatusBody",
    "financingBody",
    "financingQuote",
    "relevanceBody",
  ],
  // priority detail — top-level prose. LEFT PLAIN: heroHeadlineLead/Trail,
  // practiceStatementLead/Trail, practiceTabsStatement, subtitle (lockups);
  // nested points/practiceTabsItems/motionItems bodies + practiceTabs bullets
  // stay plain text (render-tolerant; inline-object arrays lack stable _types).
  priority: [
    "overviewBody",
    "practiceBody",
    "practiceDetailBody",
    "practiceTabsLead",
    "practiceTabsTrail",
    "quoteLead",
    "quoteText",
  ],
  // sector detail — top-level prose. LEFT PLAIN: subtitle, practiceCreatesStatement,
  // highlightStatement (lockups); nested capabilities/practiceCards/practiceList/
  // operationalList/motionItems/beingBuilt bodies + subtitle stay plain text.
  sector: [
    "overviewBody",
    "practiceBody",
    "practiceLead",
    "highlightBody",
    "quoteLead",
    "quoteText",
  ],
  investorsPage: [
    "opportunityBody",
    "opportunityCardLead",
    "whyIntro",
    "whyClosing",
    "howIntro",
    "howBody",
    "sitesBody",
    "sitesNote",
    "incentivesLead",
    "bridgeBody",
    "marketLead",
    "marketClosing",
    "whyNowBody",
    "deeperBody",
  ],
};

/**
 * DECLARATIVE OBJECT FIELD MAP — prose fields living on reusable *object* types
 * (cards, page-builder blocks) that are nested INSIDE document arrays
 * (`pageSections[]`, `missionCards[]`, `nodes[]`, …), wherever they occur.
 *
 * The top-level `FIELD_MAP` engine only reaches a document's own fields; these
 * are converted by a second, recursive pass (`Pass B`) that deep-walks every
 * document and converts any matching object node it finds — regardless of how
 * deeply nested. Idempotent + wording-guarded, exactly like the top-level pass.
 *
 * Scope a nested conversion with `--types=<objectType>` (e.g. `--types=stat`).
 */
const OBJECT_FIELD_MAP = {
  // ── Batch 1: shared card + page-builder-block bodies ──────────────────────
  pillar: ["description"],
  missionCard: ["description"],
  priorityCard: ["description"],
  sectorNode: ["description"],
  carouselBlock: ["intro"],
  quoteBlock: ["quote"],
  investorQuote: ["quote"],
  heroSlide: ["body"], // homePage.heroSlides[] featured-slide body.
  phaseCard: ["body"], // initiative.phases[] phase-card body.
  trajectoryBlock: ["body"], // impactPage.trajectoryBlocks[] block body.
  // EXCLUDED — confirmed at render site, NOT prose (leave plain):
  //  • stat.description — a tiny stat-tile caption rendered in <span>; also
  //    consumed as a plain-string `label` and React `key` (priorities/page.tsx),
  //    so a Portable Text array would throw "objects are not valid as a child".
  //  • careersSection.lead — rendered as an <h3> heading lockup (font-bold
  //    display), not a paragraph; the block's paragraph `body` is already PT.
};

// ─────────────────────────────────────────────────── string → portable text ──

/** Parse `**bold**` runs in one paragraph into deterministic-keyed spans. */
function paragraphToSpans(paragraph, blockKey) {
  const spans = [];
  let idx = 0;
  for (const part of paragraph.split(/(\*\*[^*]+\*\*)/g)) {
    if (part === "") continue; // split can yield empty boundary strings
    const bold = /^\*\*([^*]+)\*\*$/.exec(part);
    spans.push({
      _type: "span",
      _key: `${blockKey}s${idx}`,
      text: bold ? bold[1] : part,
      marks: bold ? ["strong"] : [],
    });
    idx += 1;
  }
  // A trimmed, non-empty paragraph always yields ≥1 span, but guard anyway.
  if (spans.length === 0) {
    spans.push({ _type: "span", _key: `${blockKey}s0`, text: "", marks: [] });
  }
  return spans;
}

/** Convert a plain string into a Portable Text block array (deterministic). */
function stringToPortableText(text) {
  const paragraphs = String(text)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  // Fall back to the whole (trimmed) string if there were no blank-line breaks.
  const source = paragraphs.length ? paragraphs : [String(text).trim()];
  return source.map((p, i) => {
    const blockKey = `b${i}`;
    return {
      _type: "block",
      _key: blockKey,
      style: "normal",
      markDefs: [],
      children: paragraphToSpans(p, blockKey),
    };
  });
}

/** Flatten a block array back to plain text — used to prove no wording change. */
function blocksToPlainText(blocks) {
  return blocks
    .map((b) => (b.children || []).map((c) => c.text || "").join(""))
    .join("\n\n");
}

/** Original plain string, normalized the same way, for the equality check. */
function normalizeOriginal(text) {
  const paragraphs = String(text)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const joined = (paragraphs.length ? paragraphs : [String(text).trim()]).join(
    "\n\n",
  );
  // Strip the `**` bold markers so it matches the rendered span text.
  return joined.replace(/\*\*([^*]+)\*\*/g, "$1");
}

/**
 * Convert one internationalized-array field's items (string → Portable Text),
 * preserving wording. Returns the same array reference when nothing changed
 * (idempotent), otherwise a new array. `label` is used only for error context.
 * Aborts the whole run on any wording mismatch. Shared by both passes.
 */
function convertI18nArray(arr, label) {
  if (!Array.isArray(arr) || arr.length === 0) return { nextArr: arr, items: 0 };
  let items = 0;
  const nextArr = arr.map((item) => {
    if (!item || typeof item !== "object") return item;
    if (Array.isArray(item.value)) return item; // already converted
    if (item.value == null || item.value === "") return item; // empty

    const blocks = stringToPortableText(item.value);

    // Safety: the flattened result must equal the original wording.
    const before = normalizeOriginal(item.value);
    const after = blocksToPlainText(blocks);
    if (before !== after) {
      fail(
        `WORDING MISMATCH on ${label} [${item.language}] — refusing to write.\n` +
          `  before: ${JSON.stringify(before)}\n  after:  ${JSON.stringify(after)}`,
      );
    }

    items += 1;
    return { ...item, _type: PT_VALUE_TYPE, value: blocks };
  });
  return { nextArr: items > 0 ? nextArr : arr, items };
}

// ─────────────────────────────────────────────────────────────── main ──────

async function run() {
  console.log("──────────────────────────────────────────────");
  console.log(
    ` prose → portable text  (project=${projectId} dataset=${dataset})`,
  );
  console.log(` mode: ${DRY_RUN ? "DRY-RUN (no writes)" : "APPLY (writing!)"}`);
  console.log(
    ` types: ${TYPE_FILTER ? TYPE_FILTER.join(", ") : "ALL in field map"}`,
  );
  console.log("──────────────────────────────────────────────\n");

  const allTypes = Object.keys(FIELD_MAP);
  const allObjectTypes = Object.keys(OBJECT_FIELD_MAP);
  if (TYPE_FILTER) {
    for (const t of TYPE_FILTER) {
      if (!allTypes.includes(t) && !allObjectTypes.includes(t)) {
        console.warn(`   ! "${t}" is in neither field map — skipping.`);
      }
    }
  }
  const types = TYPE_FILTER
    ? TYPE_FILTER.filter((t) => allTypes.includes(t))
    : allTypes;
  const objectTypes = TYPE_FILTER
    ? TYPE_FILTER.filter((t) => allObjectTypes.includes(t))
    : allObjectTypes;

  const grandTotals = { docs: 0, fields: 0, items: 0 };
  let pending = []; // { id, sets:{ path: newArray } }

  async function flush() {
    if (!pending.length) return;
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const slice = pending.slice(i, i + BATCH_SIZE);
      const tx = client.transaction();
      for (const { id, sets } of slice) tx.patch(id, (p) => p.set(sets));
      await tx.commit({ visibility: "async" });
      console.log(`   …committed ${slice.length} doc(s)`);
    }
    pending = [];
  }

  for (const type of types) {
    const fields = FIELD_MAP[type];
    const docs = await client.fetch(`*[_type == $type]`, { type });
    let docsChanged = 0;
    let fieldsChanged = 0;

    for (const doc of docs) {
      const sets = {};
      for (const field of fields) {
        const arr = doc[field];
        if (!Array.isArray(arr) || arr.length === 0) continue; // null/empty

        const { nextArr, items } = convertI18nArray(
          arr,
          `${type}/${doc._id}.${field}`,
        );

        if (items > 0) {
          grandTotals.items += items;
          sets[field] = nextArr;
          fieldsChanged += 1;
          if (DRY_RUN) {
            const sample = arr.find((i) => typeof i?.value === "string");
            const preview = sample ? String(sample.value).slice(0, 80) : "";
            console.log(
              `   [dry] ${type}/${doc._id} · ${field} → ${stringToPortableText(sample.value).length} block(s)  "${preview}${preview.length >= 80 ? "…" : ""}"`,
            );
          }
        }
      }

      if (Object.keys(sets).length > 0) {
        docsChanged += 1;
        if (!DRY_RUN) pending.push({ id: doc._id, sets });
      }
    }

    console.log(
      `\n• ${type}: ${docs.length} doc(s) scanned → ${docsChanged} to change, ${fieldsChanged} field(s)`,
    );
    grandTotals.docs += docsChanged;
    grandTotals.fields += fieldsChanged;
    if (!DRY_RUN) await flush();
  }

  // ── Pass B: prose fields on nested *object* types ─────────────────────────
  // Deep-walk every document and convert any matched object node's prose field
  // wherever it occurs (pageSections[], missionCards[], nodes[], …). Patches
  // only the changed TOP-LEVEL key of each doc — disjoint from Pass A's fields,
  // so the two passes never collide. Same idempotency + wording guard.
  if (objectTypes.length > 0) {
    const activeSet = new Set(objectTypes);
    const allDocs = await client.fetch(
      `*[!(_type in ["sanity.imageAsset", "sanity.fileAsset"])]`,
    );

    /** Return a new node when a descendant changed, else the same reference. */
    function mapNode(node, path, counter) {
      if (Array.isArray(node)) {
        let changed = false;
        const out = node.map((child, i) => {
          const next = mapNode(child, `${path}[${i}]`, counter);
          if (next !== child) changed = true;
          return next;
        });
        return changed ? out : node;
      }
      if (!node || typeof node !== "object") return node;

      let out = node;

      // 1) Convert this node's own matched prose fields.
      const fields = OBJECT_FIELD_MAP[node._type];
      if (fields && activeSet.has(node._type)) {
        for (const field of fields) {
          const arr = node[field];
          if (!Array.isArray(arr) || arr.length === 0) continue;
          const { nextArr, items } = convertI18nArray(
            arr,
            `${node._type}${path ? ` @ ${path}` : ""}.${field}`,
          );
          if (items > 0) {
            if (out === node) out = { ...node };
            out[field] = nextArr;
            counter.items += items;
            counter.fields += 1;
            if (DRY_RUN) {
              const sample = arr.find((i) => typeof i?.value === "string");
              const preview = sample ? String(sample.value).slice(0, 80) : "";
              console.log(
                `   [dry] ${node._type}.${field} → "${preview}${preview.length >= 80 ? "…" : ""}"`,
              );
            }
          }
        }
      }

      // 2) Recurse into every child so deeper nodes are reached too.
      const base = out;
      for (const key of Object.keys(base)) {
        if (key === "_type" || key === "_key") continue;
        const value = base[key];
        const next = mapNode(value, path ? `${path}.${key}` : key, counter);
        if (next !== value) {
          if (out === base) out = { ...base };
          out[key] = next;
        }
      }
      return out;
    }

    let nestedDocsChanged = 0;
    for (const doc of allDocs) {
      const counter = { items: 0, fields: 0 };
      const sets = {};
      for (const key of Object.keys(doc)) {
        if (key.startsWith("_")) continue; // never patch system keys
        const value = doc[key];
        const next = mapNode(value, key, counter);
        if (next !== value) sets[key] = next;
      }
      if (Object.keys(sets).length > 0) {
        nestedDocsChanged += 1;
        grandTotals.docs += 1;
        grandTotals.fields += counter.fields;
        grandTotals.items += counter.items;
        if (!DRY_RUN) pending.push({ id: doc._id, sets });
      }
    }
    console.log(
      `\n• nested objects [${objectTypes.join(", ")}]: ${allDocs.length} doc(s) scanned → ${nestedDocsChanged} to change`,
    );
    if (!DRY_RUN) await flush();
  }

  console.log("\n──────────────────────────────────────────────");
  console.log(
    ` SUMMARY: ${grandTotals.docs} doc(s), ${grandTotals.fields} field(s), ${grandTotals.items} item(s) ${
      DRY_RUN ? "WOULD change" : "changed"
    }.`,
  );
  if (DRY_RUN && grandTotals.fields > 0) {
    console.log(" Re-run with --apply to write.");
  }
  console.log("──────────────────────────────────────────────\n");
}

run().catch((err) => {
  console.error("\n✗ Migration failed:");
  console.error(err);
  process.exit(1);
});
