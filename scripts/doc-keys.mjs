#!/usr/bin/env node
/**
 * Orphan-field helper for the WYSIWYG rollout cleanup.
 *
 *   List top-level keys of every doc of a type:
 *     node --env-file=.env.local scripts/doc-keys.mjs --dataset=staging --type=contactPage
 *
 *   Unset orphan keys (data present but absent from schema):
 *     node --env-file=.env.local scripts/doc-keys.mjs --dataset=staging --type=contactPage \
 *          --unset=oldField,anotherOld --apply
 *
 * Default is DRY (prints what it would unset). System keys (_id/_type/_rev/…)
 * are always ignored.
 */
import { createClient } from "@sanity/client";

const argv = process.argv.slice(2);
const getArg = (name) => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  const eq = hit.indexOf("=");
  return eq === -1 ? true : hit.slice(eq + 1);
};

const APPLY = getArg("apply") === true;
const type = getArg("type");
const unsetArg = getArg("unset");
const unsetKeys =
  typeof unsetArg === "string"
    ? unsetArg.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

const projectId =
  process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  getArg("dataset") ||
  process.env.SANITY_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET;
const token =
  process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN;

if (!type) {
  console.error("Pass --type=<documentType>");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const docs = await client.fetch(`*[_type == $type]`, { type });
console.log(`\n${type}: ${docs.length} doc(s) in ${dataset}\n`);

for (const doc of docs) {
  const keys = Object.keys(doc).filter((k) => !k.startsWith("_"));
  console.log(`• ${doc._id}`);
  console.log(`   keys: ${keys.join(", ")}`);
  const present = unsetKeys.filter((k) => k in doc);
  if (unsetKeys.length) {
    console.log(
      `   orphans to unset present here: ${present.length ? present.join(", ") : "(none)"}`,
    );
    if (present.length && APPLY) {
      await client.patch(doc._id).unset(present).commit({ visibility: "async" });
      console.log(`   ✓ unset ${present.join(", ")}`);
    }
  }
}
console.log(APPLY ? "\nAPPLIED.\n" : "\n(dry — pass --apply to unset)\n");
