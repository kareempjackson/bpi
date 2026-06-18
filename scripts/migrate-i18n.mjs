#!/usr/bin/env node
/**
 * ──────────────────────────────────────────────────────────────────────────
 * ONE-TIME i18n data migration
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Wraps existing (legacy, single-language English) content into the shape the
 * `sanity-plugin-internationalized-array` plugin stores on disk, so current
 * data survives the field-level i18n schema change.
 *
 * Legacy value  ──►  internationalized-array wrapper
 *   string  -> [{ _key:'en', _type:'internationalizedArrayStringValue',       language:'en', value:<oldString>     }]
 *   text    -> [{ _key:'en', _type:'internationalizedArrayTextValue',         language:'en', value:<oldString>     }]
 *   p-text  -> [{ _key:'en', _type:'internationalizedArrayPortableTextValue', language:'en', value:<oldBlockArray> }]
 *
 * The plugin stores BOTH `language:'en'` and `_key:'en'` on every item, so we
 * set both. Already-migrated values (an array whose items carry a `language`
 * key) are skipped — the script is idempotent and safe to re-run.
 *
 * USAGE
 *   # Preview (default — nothing is written):
 *   node scripts/migrate-i18n.mjs --dataset=staging
 *
 *   # Actually patch:
 *   node scripts/migrate-i18n.mjs --dataset=staging --apply
 *
 * Run it ONCE PER DATASET — i.e. against `staging` AND again against
 * `production`. It is idempotent, but there is no reason to re-run.
 *
 * ENV (read from process.env / your shell or .env):
 *   SANITY_PROJECT_ID | NEXT_PUBLIC_SANITY_PROJECT_ID   (required)
 *   SANITY_DATASET    | NEXT_PUBLIC_SANITY_DATASET       (or --dataset=...)
 *   SANITY_API_WRITE_TOKEN | SANITY_WRITE_TOKEN          (required, write token)
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
  fail(
    "Missing dataset. Pass --dataset=staging (or set SANITY_DATASET / NEXT_PUBLIC_SANITY_DATASET).",
  );
if (!token)
  fail(
    "Missing write token. Set SANITY_API_WRITE_TOKEN (or SANITY_WRITE_TOKEN). A read token is NOT enough.",
  );

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// ───────────────────────────────────────────────── value-type identifiers ──
// These map to the plugin's `fieldTypes: ["string", "text", portableText]`.
const VALUE_TYPE = {
  string: "internationalizedArrayStringValue",
  text: "internationalizedArrayTextValue",
  portableText: "internationalizedArrayPortableTextValue",
};

/**
 * The localized field map.
 *
 * Each document `_type` lists its localized field PATHS. A path is a dotted
 * string; an array hop is written as a `[]` segment, e.g.
 *   "heroSlides[].headline"   -> map over heroSlides, wrap each .headline
 *   "menuLinks[].subItems[].label" -> two array hops, then wrap .label
 *
 * The leaf's wrapper kind is one of: "string" | "text" | "portableText".
 *
 * Derived by reading the migrated schema under sanity/schemaTypes — every
 * field now typed `internationalizedArrayString` / `...Text` /
 * `...PortableText` (directly, or via a shared object: cta, leader, stat,
 * sectorNode, pillar, priorityCard, missionCard, navLink, socialLink,
 * menuLink, menuSubLink, contactRow, jobSection, imageWithAlt.alt, statCard,
 * metricsTable, pageLink has none).
 */

// Shared object → its localized leaf paths (relative to the object root).
// Used to expand paths that point at an array/field of one of these objects.
const OBJ = {
  cta: [["label", "string"]],
  imageWithAlt: [["alt", "string"]],
  navLink: [["label", "string"]],
  socialLink: [["label", "string"]],
  menuSubLink: [["label", "string"]],
  menuLink: [
    ["label", "string"],
    ["subItems[].label", "string"], // subItems are menuSubLink
  ],
  leader: [
    ["name", "string"],
    ["role", "string"],
    ["bio", "portableText"],
    ["image.alt", "string"], // nested imageWithAlt
  ],
  stat: [
    ["value", "string"],
    ["description", "text"],
  ],
  pillar: [
    ["eyebrow", "string"],
    ["description", "text"],
    ["image.alt", "string"],
  ],
  priorityCard: [
    ["title", "string"],
    ["description", "text"],
    ["image.alt", "string"],
  ],
  missionCard: [
    ["title", "string"],
    ["description", "text"],
    ["eyebrow", "string"],
    ["image.alt", "string"],
  ],
  sectorNode: [
    ["title", "string"],
    ["description", "text"],
    ["media.image.alt", "string"], // media is an inline object w/ imageWithAlt
    ["media.videoPoster.alt", "string"],
  ],
  contactRow: [
    ["label", "string"],
    ["value", "string"],
    ["copyValue", "string"],
  ],
  jobSection: [
    ["title", "string"],
    ["content", "portableText"],
  ],
};

// Helper: prefix an array of [path, kind] with `base[].` (an array hop).
const arrayOf = (base, objName) =>
  OBJ[objName].map(([p, k]) => [`${base}[].${p}`, k]);
// Helper: prefix object leaves with `base.` (a single field hop).
const fieldOf = (base, objName) =>
  OBJ[objName].map(([p, k]) => [`${base}.${p}`, k]);

const FIELD_MAP = {
  // ─────────────────────────────────────────────────────────────── homePage ──
  homePage: [
    ["seoTitle", "string"],
    ["seoDescription", "text"],
    ["heroHeadline", "string"],
    ["heroBody", "text"],
    ...fieldOf("heroBackground.image", "imageWithAlt"),
    ["heroSlides[].headline", "string"],
    ["heroSlides[].body", "text"],
    // heroSlides[].background.image + thumbnail are inline imageWithAlt objects:
    ["heroSlides[].background.image.alt", "string"],
    ["heroSlides[].thumbnail.alt", "string"],
    ["heroFeature.label", "string"],
    ["heroFeature.eyebrow", "string"],
    ["heroFeature.poster.alt", "string"],
    ["leaderQuote", "text"],
    ["leaderBody", "text"],
    ["leaderName", "string"],
    ["leaderTitle", "string"],
    ["leaderOrg", "string"],
    ["leaderQuoteImage.alt", "string"],
    ["leaderPortraitImage.alt", "string"],
    ...arrayOf("leaderSocials", "socialLink"),
    ["architectureHeading", "string"],
    ["architectureDescription", "text"],
    ...arrayOf("architectureItems", "priorityCard"),
    ["sectorsHeading", "string"],
    ["sectorsBody", "text"],
    ...arrayOf("sectorsNodes", "sectorNode"),
    ["whyQuote", "text"],
    ["whyAttribution", "string"],
    ["whyBody", "text"],
    ...fieldOf("whyCta", "cta"),
    ["whyImage.alt", "string"],
    ["initiativesEyebrow", "string"],
    ["initiativesHeading", "string"],
    ["initiativesDefaultImage.alt", "string"],
    ["blogHeading", "string"],
    ["careersEyebrow", "string"],
    ["careersHeading", "string"],
    ["careersLead", "text"],
    ["careersBody", "text"],
    ["careersImage.alt", "string"],
    ...fieldOf("careersPrimaryCta", "cta"),
    ...fieldOf("careersSecondaryCta", "cta"),
    ["buildingHeadlineLine1", "string"],
    ["buildingHeadlineLine2", "string"],
    ["buildingImage.alt", "string"],
    ...fieldOf("buildingPrimaryCta", "cta"),
    ...fieldOf("buildingSecondaryCta", "cta"),
  ].filter(Boolean),

  // ─────────────────────────────────────────────────────────────── aboutPage ──
  aboutPage: [
    ["seoTitle", "string"],
    ["seoDescription", "text"],
    ["heroImage.alt", "string"],
    ["heroHeadline", "text"],
    ["heroSubheading", "text"],
    ...fieldOf("heroCta", "cta"),
    ["visionHeading", "string"],
    ["visionDescription", "text"],
    ...fieldOf("visionPrimaryCta", "cta"),
    ...fieldOf("visionSecondaryCta", "cta"),
    ...arrayOf("pillars", "pillar"),
    ["differenceEyebrow", "string"],
    ["differenceHeading", "text"],
    ["differenceBody", "text"],
    ["differenceTagline", "text"],
    ["missionHeading", "string"],
    ["missionDescription", "text"],
    ...arrayOf("missionCards", "missionCard"),
    ["statsHeading", "string"],
    ["statsDescription", "text"],
    ...arrayOf("stats", "stat"),
    ["bannerImage.alt", "string"],
    ["initiativesEyebrow", "string"],
    ["initiativesHeading", "string"],
    ["leadershipHeading", "string"],
    ["leadershipDescription", "text"],
    ...arrayOf("leaders", "leader"),
    ["leadershipContactHeading", "string"],
    ["leadershipContactDescription", "text"],
    ...fieldOf("leadershipContactPrimaryCta", "cta"),
    ...fieldOf("leadershipContactSecondaryCta", "cta"),
  ],

  // ──────────────────────────────────────────────────────── initiativesPage ──
  initiativesPage: [
    ["seoTitle", "string"],
    ["seoDescription", "text"],
    ["heroImage.alt", "string"],
    ["heroHeadline", "string"],
    ["heroBody", "text"],
    ...fieldOf("heroPrimaryCta", "cta"),
    ...fieldOf("heroSecondaryCta", "cta"),
    ["workInMotionHeading", "string"],
    ["workInMotionBody", "text"],
    ...fieldOf("workInMotionPrimaryCta", "cta"),
    ...fieldOf("workInMotionSecondaryCta", "cta"),
    ["motionStoriesHeading", "string"],
    ["otherWorksEyebrow", "string"],
    ["otherWorksHeading", "string"],
    ["otherWorksBody", "text"],
    ["otherWorksBlueTitle", "string"],
    ["otherWorksBlueBody", "text"],
    ...fieldOf("otherWorksBlueCta", "cta"),
    ["otherWorksGreenTitle", "string"],
    ["otherWorksGreenBody", "text"],
    ...arrayOf("otherWorksTopRightImages", "imageWithAlt"),
    ["otherWorksBottomLeftImage.alt", "string"],
    ["buildingFutureHeading", "string"],
    ["buildingFutureBody", "text"],
    ["buildingFutureStats[].value", "string"],
    ["buildingFutureStats[].body", "text"],
  ],

  // ────────────────────────────────────────────────────────────── initiative ──
  initiative: [
    ["title", "string"],
    ["subtitle", "string"],
    ["excerpt", "text"],
    ["coverImage.alt", "string"],
    ["body", "portableText"],
  ],

  // ───────────────────────────────────────────────────────────── careersPage ──
  careersPage: [
    ["seoTitle", "string"],
    ["seoDescription", "text"],
    ["heroHeadlineLine1", "string"],
    ["heroDescription", "text"],
    ["heroImage.alt", "string"],
    ["whyHeading", "string"],
    ["whyIntro", "text"],
    ["whyImage.alt", "string"],
    ["whySections[].heading", "string"],
    ["whySections[].body", "text"],
    ["whyBulletsHeading", "string"],
    ["jobsHeading", "string"],
    ["jobsDescription", "text"],
    ["jobsSearchPlaceholder", "string"],
    ["jobsFindButtonLabel", "string"],
    ["equalOpportunityParagraph1", "text"],
    ["equalOpportunityParagraph2", "text"],
  ],

  // ─────────────────────────────────────────────────────────────────── job ──
  job: [
    ["title", "string"],
    ["location", "string"],
    ["schedule", "string"],
    ["summary", "text"],
    ["longSummary", "text"],
    ["description", "text"],
    ...arrayOf("sections", "jobSection"),
  ],

  // ───────────────────────────────────────────────────────────── contactPage ──
  contactPage: [
    ["seoTitle", "string"],
    ["seoDescription", "text"],
    ["heroHeading", "string"],
    ["heroImage.alt", "string"],
    ...arrayOf("contactRows", "contactRow"),
    ["formHeading", "string"],
    ["formDescription", "text"],
    ["formSubmitLabel", "string"],
    ["formImage.alt", "string"],
  ],

  // ──────────────────────────────────────────────────────────────── blogPage ──
  blogPage: [
    ["heading", "string"],
    ["intro", "text"],
    ["seoTitle", "string"],
    ["seoDescription", "text"],
  ],

  // ──────────────────────────────────────────────────────────────────── post ──
  post: [
    ["title", "string"],
    ["excerpt", "text"],
    ["coverImage.alt", "string"],
    ["initiativeEyebrow", "string"],
    ["body", "portableText"],
    ["attachments[].label", "string"],
  ],

  // ───────────────────────────────────────────────────────────────────── tag ──
  tag: [["title", "string"]],

  // ─────────────────────────────────────────────────────────────────── event ──
  event: [
    ["title", "string"],
    ["summary", "text"],
    ["description", "portableText"],
    ["image.alt", "string"],
    ["venueName", "string"],
    ["venueAddress", "text"],
    ["tickets[].name", "string"],
  ],

  // ──────────────────────────────────────────────────────────────── portalPage ──
  portalPage: [
    ["title", "string"],
    ["summary", "text"],
    ["body", "portableText"],
  ],

  // ──────────────────────────────────────────────────────────── portalResource ──
  portalResource: [
    ["title", "string"],
    ["description", "text"],
  ],

  // ─────────────────────────────────────────────────────────────── siteSettings ──
  siteSettings: [
    ...arrayOf("navLinks", "navLink"),
    ...arrayOf("menuLinks", "menuLink"),
    ...arrayOf("menuLegalLinks", "navLink"),
    ...arrayOf("menuSocialLinks", "socialLink"),
    ["footerTagline", "string"],
    ["footerNavGroups[].title", "string"],
    ["footerNavGroups[].links[].label", "string"],
    ...arrayOf("footerLegalLinks", "navLink"),
    ["footerPartnersLabel", "string"],
    ["footerRights", "string"],
  ],
};

// ─────────────────────────────────────────────────────── wrap / detect ──────

/** True when `v` is already a plugin-wrapped array (items carry `language`). */
function isAlreadyWrapped(v) {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        "language" in item,
    )
  );
}

/** Build the single English wrapper item for a legacy value. */
function wrap(kind, legacyValue) {
  return [
    {
      _key: "en",
      _type: VALUE_TYPE[kind],
      language: "en",
      value: legacyValue,
    },
  ];
}

/**
 * Resolve a dotted/`[]` path against `doc`, yielding { setPath, value } for
 * every concrete leaf (array hops expand to one entry per index). `setPath`
 * is the concrete sanity patch path (with numeric indices for arrays).
 */
function resolveLeaves(node, segments, prefix) {
  // segments: array of { key, isArray }
  if (node == null) return [];
  if (segments.length === 0) {
    return [{ setPath: prefix, value: node }];
  }
  const [seg, ...rest] = segments;
  const child = node[seg.key];
  if (child == null) return [];
  const here = prefix ? `${prefix}.${seg.key}` : seg.key;
  if (seg.isArray) {
    if (!Array.isArray(child)) return [];
    const out = [];
    child.forEach((el, i) => {
      out.push(...resolveLeaves(el, rest, `${here}[${i}]`));
    });
    return out;
  }
  return resolveLeaves(child, rest, here);
}

/** Parse "a[].b.c[].d" into [{key:'a',isArray:true},{key:'b'},...]. */
function parsePath(path) {
  return path.split(".").map((raw) => {
    const isArray = raw.endsWith("[]");
    return { key: isArray ? raw.slice(0, -2) : raw, isArray };
  });
}

// ─────────────────────────────────────────────────────────────── main ──────

async function run() {
  console.log("──────────────────────────────────────────────");
  console.log(` i18n migration  (project=${projectId} dataset=${dataset})`);
  console.log(` mode: ${DRY_RUN ? "DRY-RUN (no writes)" : "APPLY (writing!)"}`);
  console.log("──────────────────────────────────────────────\n");

  const types = Object.keys(FIELD_MAP);
  const grandTotals = { docs: 0, fields: 0 };
  // Accumulate patches across all types, flush in batches.
  let pending = []; // { id, sets:{path:value} }

  async function flush() {
    if (!pending.length) return;
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const slice = pending.slice(i, i + BATCH_SIZE);
      const tx = client.transaction();
      for (const { id, sets } of slice) {
        tx.patch(id, (p) => p.set(sets));
      }
      await tx.commit({ visibility: "async" });
      console.log(`   …committed ${slice.length} docs`);
    }
    pending = [];
  }

  for (const type of types) {
    const fields = FIELD_MAP[type];
    // Fetch every doc (drafts included) of this type.
    const docs = await client.fetch(`*[_type == $type]`, { type });
    let docsChanged = 0;
    let fieldsChanged = 0;

    for (const doc of docs) {
      const sets = {};
      for (const [path, kind] of fields) {
        const segments = parsePath(path);
        const leaves = resolveLeaves(doc, segments, "");
        for (const { setPath, value } of leaves) {
          if (value == null) continue; // skip null/undefined
          if (isAlreadyWrapped(value)) continue; // idempotent
          sets[setPath] = wrap(kind, value);
          fieldsChanged += 1;
        }
      }
      if (Object.keys(sets).length > 0) {
        docsChanged += 1;
        if (DRY_RUN) {
          console.log(
            `   [dry] ${type}/${doc._id} — ${Object.keys(sets).length} field(s):`,
          );
          for (const p of Object.keys(sets)) console.log(`         · ${p}`);
        } else {
          pending.push({ id: doc._id, sets });
        }
      }
    }

    if (docsChanged > 0 || docs.length > 0) {
      console.log(
        `\n• ${type}: ${docs.length} doc(s) scanned → ${docsChanged} to change, ${fieldsChanged} field(s)`,
      );
    }
    grandTotals.docs += docsChanged;
    grandTotals.fields += fieldsChanged;
    if (!DRY_RUN) await flush();
  }

  console.log("\n──────────────────────────────────────────────");
  console.log(
    ` SUMMARY: ${grandTotals.docs} doc(s), ${grandTotals.fields} field(s) ${
      DRY_RUN ? "WOULD change" : "changed"
    }.`,
  );
  if (DRY_RUN) {
    console.log(" Re-run with --apply to write. (Once per dataset.)");
  }
  console.log("──────────────────────────────────────────────\n");
}

run().catch((err) => {
  console.error("\n✗ Migration failed:");
  console.error(err);
  process.exit(1);
});
