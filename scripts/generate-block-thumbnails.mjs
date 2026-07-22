import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * Generate block/foundation thumbnails for the page-builder by screenshotting
 * every `[data-block]` container on the hidden /styleguide route. Output goes
 * to public/static/blocks/<data-block>.png, wired into the Studio insert menu,
 * the variant pickers, and the Design Library gallery.
 *
 * Prereqs: a running site (default http://localhost:3000) and Playwright.
 *   Playwright is optional/dev-only — install once with:
 *     npm i -D playwright && npx playwright install chromium
 *
 * Run: node scripts/generate-block-thumbnails.mjs
 *   BASE_URL=https://staging.barbadospharmainc.org node scripts/generate-block-thumbnails.mjs
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LANG = process.env.LANG_PREFIX || "en";
const URL = `${BASE_URL}/${LANG}/styleguide`;

const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "static",
  "blocks",
);

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "Playwright is not installed. This dev-only step needs it:\n" +
      "  npm i -D playwright && npx playwright install chromium\n" +
      "Then re-run: node scripts/generate-block-thumbnails.mjs",
  );
  process.exit(1);
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Capturing block thumbnails from ${URL}`);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  try {
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });
  } catch (err) {
    console.error(
      `Could not load ${URL}. Is the site running? (${err.message})`,
    );
    await browser.close();
    process.exit(1);
  }

  const handles = await page.$$("[data-block]");
  console.log(`Found ${handles.length} block targets.`);

  let count = 0;
  for (const handle of handles) {
    const name = await handle.getAttribute("data-block");
    if (!name) continue;
    try {
      await handle.scrollIntoViewIfNeeded();
      await handle.screenshot({ path: join(OUT_DIR, `${name}.png`) });
      count += 1;
      console.log(`  ✓ ${name}.png`);
    } catch (err) {
      console.warn(`  ⚠ skipped ${name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`Done — ${count} thumbnails written to public/static/blocks/.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
