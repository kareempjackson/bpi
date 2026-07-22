import { createClient } from "@sanity/client";

/**
 * Seed the Brand design-system singleton with the values the site currently
 * ships (so creating it causes ZERO visual change — it just makes the
 * document exist and proves the runtime CSS-var pipeline). Uses
 * createIfNotExists so re-runs never clobber editor changes.
 *
 * Canonical source of these defaults is sanity/lib/brandTokens.ts; they are
 * inlined here because this .mjs seeder can't import the TS module.
 *
 * Run: node --env-file=.env.local scripts/set-brand-settings.mjs
 * Target production by overriding NEXT_PUBLIC_SANITY_DATASET=production.
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-brand-settings.mjs",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const ts = (font, size, lineHeight, letterSpacing, weight, transform) => ({
  font,
  size,
  lineHeight,
  letterSpacing,
  weight,
  transform,
});

const DOC = {
  _id: "brandSettings",
  _type: "brandSettings",
  colors: {
    ink: "#000036",
    accentGreen: "#06FE83",
    accentTeal: "#0870AD",
    surfaceLight: "#EAFBF1",
    surfaceBlue: "#CAF1FF",
    bandDark: "#01190D",
    white: "#FFFFFF",
    black: "#000000",
  },
  typography: {
    display: ts("display", "3.75rem", "1.02", "-0.03em", "600", "none"),
    h1: ts("display", "2.25rem", "1.05", "-0.02em", "700", "none"),
    h2: ts("display", "1.875rem", "1.15", "-0.02em", "600", "none"),
    h3: ts("display", "1.5rem", "1.3", "-0.015em", "600", "none"),
    cardHeading: ts("display", "1.125rem", "1.2", "-0.01em", "700", "none"),
    eyebrow: ts("sans", "0.8125rem", "1.4", "0.18em", "600", "uppercase"),
    lead: ts("sans", "1.25rem", "1.6", "0em", "400", "none"),
    body: ts("sans", "1.125rem", "1.75", "0em", "400", "none"),
    bodySmall: ts("sans", "1rem", "1.6", "0em", "400", "none"),
    quote: ts("display", "1.5rem", "1.35", "-0.01em", "400", "none"),
    caption: ts("sans", "0.875rem", "1.5", "0em", "400", "none"),
    label: ts("sans", "0.875rem", "1.2", "0em", "600", "none"),
  },
  layout: {
    radiusSm: "12px",
    radiusLg: "24px",
    radiusRound: "60px",
    gutter: "24px",
    gutterSm: "12px",
    margin: "120px",
    column: "84px",
    container: "130rem",
  },
};

async function run() {
  console.log(`Seeding brandSettings on ${projectId}/${dataset} …`);
  await client.createIfNotExists(DOC);
  console.log("  ✓ brandSettings ensured (defaults; no visual change).");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
