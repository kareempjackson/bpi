#!/usr/bin/env node
/**
 * ──────────────────────────────────────────────────────────────────────────
 * "In practice" statement → single WYSIWYG  (practiceStatement rollout)
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Consolidates a priority's legacy plain-text statement fields
 *   practiceStatementLead      (internationalizedArrayText)
 *   practiceStatementHighlight (internationalizedArrayString — the blue phrase)
 *   practiceStatementTrail     (internationalizedArrayText)
 * into ONE rich-text field
 *   practiceStatement          (internationalizedArrayPortableText)
 * preserving the exact wording, per language.
 *
 * Conversion (FORMAT-ONLY — never alters words):
 *   • Lead splits on blank lines (`\n\n`) → one "normal" block each.
 *   • Highlight becomes a final block: the phrase carries the `accent` mark
 *     (rendered blue by <PortableTextBody>), followed by the trail (if any).
 *   • The legacy `practiceBody` is intentionally NOT merged — on the one doc
 *     that has it, it duplicates the lead. Review/re-add in Studio if needed.
 *   • Keys are DETERMINISTIC (index-based) so re-runs are reproducible.
 *
 * IDEMPOTENT: any priority that already has `practiceStatement` is skipped.
 * Safe to re-run. The legacy fields are left in place (the page falls back to
 * them only when practiceStatement is empty); clear them by hand once happy.
 *
 * USAGE
 *   # Preview (default — nothing is written):
 *   node --env-file=.env.local scripts/migrate-practice-statement.mjs
 *
 *   # Actually patch:
 *   node --env-file=.env.local scripts/migrate-practice-statement.mjs --apply
 *
 *   # Target a dataset explicitly (defaults to NEXT_PUBLIC_SANITY_DATASET):
 *   node --env-file=.env.local scripts/migrate-practice-statement.mjs \
 *        --dataset=production --apply
 */
import { createClient } from "@sanity/client";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const datasetArg = args.find((a) => a.startsWith("--dataset="));

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  (datasetArg && datasetArg.split("=")[1]) ||
  process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, (NEXT_PUBLIC_SANITY_DATASET or --dataset=), SANITY_API_WRITE_TOKEN.",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

/** Index legacy i18n array items by language → string value. */
function byLang(items) {
  const map = new Map();
  for (const it of items ?? []) {
    if (it?.language && typeof it.value === "string") map.set(it.language, it.value);
  }
  return map;
}

/** Build the Portable Text block array for one language. */
function buildBlocks(lead, highlight, trail, langKey) {
  const blocks = [];
  const paras = (lead ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  paras.forEach((text, i) => {
    blocks.push({
      _key: `${langKey}b${i}`,
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [{ _key: `${langKey}b${i}s0`, _type: "span", marks: [], text }],
    });
  });

  const hl = (highlight ?? "").trim();
  const tr = (trail ?? "").trim();
  if (hl || tr) {
    const i = paras.length;
    const children = [];
    if (hl) {
      children.push({
        _key: `${langKey}b${i}s0`,
        _type: "span",
        marks: ["accent"],
        text: hl,
      });
    }
    if (tr) {
      children.push({
        _key: `${langKey}b${i}s1`,
        _type: "span",
        marks: [],
        text: hl ? ` ${tr}` : tr,
      });
    }
    blocks.push({
      _key: `${langKey}b${i}`,
      _type: "block",
      style: "normal",
      markDefs: [],
      children,
    });
  }

  return blocks;
}

async function run() {
  const docs = await client.fetch(
    `*[_type == "priority" && !defined(practiceStatement) && (defined(practiceStatementLead) || defined(practiceStatementHighlight) || defined(practiceStatementTrail))]{
      _id, "slug": slug.current,
      practiceStatementLead, practiceStatementHighlight, practiceStatementTrail
    }`,
  );

  if (!docs.length) {
    console.log(`Nothing to migrate in "${dataset}" (all priorities already have practiceStatement).`);
    return;
  }

  console.log(
    `${APPLY ? "Applying" : "Preview"} — ${docs.length} priorit${docs.length === 1 ? "y" : "ies"} in "${dataset}":\n`,
  );

  const tx = client.transaction();

  for (const doc of docs) {
    const leads = byLang(doc.practiceStatementLead);
    const highs = byLang(doc.practiceStatementHighlight);
    const trails = byLang(doc.practiceStatementTrail);
    const langs = new Set([...leads.keys(), ...highs.keys(), ...trails.keys()]);

    const value = [];
    for (const lang of langs) {
      const blocks = buildBlocks(
        leads.get(lang),
        highs.get(lang),
        trails.get(lang),
        lang,
      );
      if (blocks.length) {
        value.push({
          _key: lang,
          _type: "internationalizedArrayPortableTextValue",
          language: lang,
          value: blocks,
        });
      }
    }

    if (!value.length) {
      console.log(`  · ${doc.slug} — no usable content, skipped`);
      continue;
    }

    const langList = value.map((v) => v.language).join(", ");
    console.log(
      `  ✓ ${doc.slug} — ${value.length} language(s): ${langList}, ${value[0].value.length} block(s)`,
    );
    if (APPLY) tx.patch(doc._id, (p) => p.set({ practiceStatement: value }));
  }

  if (APPLY) {
    await tx.commit();
    console.log("\nDone — patched.");
  } else {
    console.log("\nPreview only. Re-run with --apply to write.");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
