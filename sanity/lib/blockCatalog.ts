/**
 * The design-language block catalog — the single source of truth for the
 * page-builder. Everything reads from here so nothing drifts:
 *   1. the Studio array insert-menu groups (categories),
 *   2. the visual variant pickers (per-block variant lists + thumbnails),
 *   3. the Design Library gallery,
 *   4. the /styleguide render list,
 *   5. the thumbnail-generation script.
 *
 * Blocks are added incrementally. A block only appears in the add-section menu
 * (and gets rendered) once `available` is true — i.e. once its schema in
 * `sanity/schemaTypes/objects/blocks/` and its renderer in
 * `app/components/sections/` both exist. Until then it stays catalogued (so the
 * plan/roadmap is visible in the gallery) but not insertable.
 *
 * `surface` and `width` are the block's defaults for the rhythm engine
 * (app/components/sections/Zone.tsx): `surface` seeds background/tone
 * sequencing, `width` picks full-bleed vs contained. Individual blocks can
 * still resolve a different surface at render time from their brand-colour
 * choice.
 */

export type BlockSurface = "light" | "white" | "dark" | "brand";
export type BlockWidth = "full" | "contained" | "narrow";

export type BlockVariant = {
  value: string;
  title: string;
};

export type CatalogCategory =
  | "foundations"
  | "heroes"
  | "content"
  | "cards"
  | "stats"
  | "quotes"
  | "media"
  | "lists"
  | "interactive"
  | "cta"
  | "people";

export type CatalogBlock = {
  /** Sanity object `_type`. */
  type: string;
  title: string;
  description: string;
  category: CatalogCategory;
  /** True once the schema + renderer exist; gates insertion + rendering. */
  available: boolean;
  variants?: BlockVariant[];
  surface: BlockSurface;
  width: BlockWidth;
};

export const CATEGORY_TITLES: Record<CatalogCategory, string> = {
  foundations: "Foundations",
  heroes: "Heroes & Headers",
  content: "Content & Text",
  cards: "Cards & Grids",
  stats: "Stats & Metrics",
  quotes: "Quotes & Testimonials",
  media: "Media",
  lists: "Lists & Tables",
  interactive: "Interactive",
  cta: "Calls to Action",
  people: "People & Team",
};

/** Category display order (used by the insert menu and the gallery). */
export const CATEGORY_ORDER: CatalogCategory[] = [
  "heroes",
  "content",
  "cards",
  "stats",
  "quotes",
  "media",
  "lists",
  "interactive",
  "cta",
  "people",
];

export const BLOCKS: CatalogBlock[] = [
  // ── Heroes & Headers ──────────────────────────────────────────────
  {
    type: "headerBlock",
    title: "Header / Hero",
    description:
      "A page or section hero — title, subtitle, media, buttons. Pick a layout visually.",
    category: "heroes",
    available: true,
    surface: "dark",
    width: "full",
    // The seven SectorHeader layouts are wired today; more header families
    // (initiative type1–4, etc.) fold in behind the same field later.
    variants: [
      { value: "split", title: "Split" },
      { value: "centered", title: "Centered" },
      { value: "sideBySide", title: "Side by side" },
      { value: "overlay", title: "Overlay" },
      { value: "showcase", title: "Showcase" },
      { value: "spotlight", title: "Spotlight" },
      { value: "masthead", title: "Masthead" },
    ],
  },
  {
    type: "heroSliderBlock",
    title: "Hero slider",
    description: "Multi-slide hero with a looping feature card (the home hero).",
    category: "heroes",
    available: false,
    surface: "dark",
    width: "full",
  },

  // ── Content & Text ────────────────────────────────────────────────
  {
    type: "richTextBlock",
    title: "Rich text",
    description: "A heading and a rich WYSIWYG body. The content workhorse.",
    category: "content",
    available: true,
    surface: "light",
    width: "contained",
  },
  {
    type: "statementSplitBlock",
    title: "Statement split",
    description: "Two-column statement — heading beside body/pull-statement.",
    category: "content",
    available: true,
    surface: "light",
    width: "contained",
  },

  // ── Cards & Grids ─────────────────────────────────────────────────
  {
    type: "cardGridBlock",
    title: "Card grid",
    description:
      "A heading, intro, and a responsive grid of colour cards (per-card brand background, 2–4 columns).",
    category: "cards",
    available: true,
    surface: "light",
    width: "contained",
  },

  // ── Stats & Metrics ───────────────────────────────────────────────
  {
    type: "statsBlock",
    title: "Stats",
    description: "Animated count-up stats, as filled cards or a bare rule-divided row.",
    category: "stats",
    available: true,
    surface: "light",
    width: "contained",
    variants: [
      { value: "filledCards", title: "Filled cards" },
      { value: "bareColumns", title: "Bare columns" },
    ],
  },
  {
    type: "metricsTableBlock",
    title: "Metrics table",
    description: "A structured data table with captioned rows.",
    category: "stats",
    available: false,
    surface: "white",
    width: "contained",
  },

  // ── Quotes & Testimonials ─────────────────────────────────────────
  {
    type: "quoteBlock",
    title: "Quote",
    description:
      "A pull-quote spotlight in its own colour band — eyebrow, quote, attribution, optional portrait.",
    category: "quotes",
    available: true,
    surface: "dark",
    width: "full",
  },

  // ── Media ─────────────────────────────────────────────────────────
  {
    type: "mediaBlock",
    title: "Media",
    description: "A full-bleed image or a banner video with a caption.",
    category: "media",
    available: true,
    surface: "dark",
    width: "full",
    variants: [
      { value: "fullBleedImage", title: "Full-bleed image" },
      { value: "bannerVideo", title: "Banner video" },
    ],
  },

  // ── Lists & Tables ────────────────────────────────────────────────
  {
    type: "listBlock",
    title: "List",
    description: "Label/description rows — as a ruled table, stacked list, or numbered.",
    category: "lists",
    available: true,
    surface: "light",
    width: "contained",
    variants: [
      { value: "ruledRows", title: "Ruled rows" },
      { value: "stackedList", title: "Stacked list" },
      { value: "numberedList", title: "Numbered list" },
    ],
  },
  {
    type: "contactRowsBlock",
    title: "Contact rows",
    description: "Label / value contact rows.",
    category: "lists",
    available: true,
    surface: "light",
    width: "contained",
  },

  // ── Interactive ───────────────────────────────────────────────────
  {
    type: "timelineBlock",
    title: "Timeline",
    description:
      "A heading over an ordered vertical timeline — auto-numbered steps with a label and description.",
    category: "interactive",
    available: true,
    surface: "light",
    width: "contained",
  },
  {
    type: "tabsBlock",
    title: "Tabs",
    description:
      "A heading over a keyboard-accessible tab strip; each tab reveals a rich body panel.",
    category: "interactive",
    available: true,
    surface: "light",
    width: "contained",
  },
  {
    type: "carouselBlock",
    title: "Carousel",
    description:
      "A heading, intro, and a horizontal scroll-snap track of image cards with prev/next controls.",
    category: "interactive",
    available: true,
    surface: "light",
    width: "contained",
  },
  {
    type: "interactiveListBlock",
    title: "Interactive list",
    description: "Hover/auto-cycling rows (initiatives, priorities index, in-motion).",
    category: "interactive",
    available: false,
    surface: "light",
    width: "contained",
    variants: [
      { value: "initiatives", title: "Initiatives" },
      { value: "prioritiesIndex", title: "Priorities index" },
      { value: "motion", title: "In motion" },
    ],
  },
  {
    // Stays bespoke/per-page: the sectors molecule + convergence graphics are
    // hand-tuned SVG with baked geometry, not worth genericizing into a block.
    // Kept catalogued (available:false) so the roadmap shows it, never inserted.
    type: "diagramBlock",
    title: "Diagram",
    description: "The sectors molecule or convergence graphic (advanced, fixed geometry).",
    category: "interactive",
    available: false,
    surface: "dark",
    width: "full",
    variants: [
      { value: "sectorsMolecule", title: "Sectors molecule" },
      { value: "convergence", title: "Convergence" },
    ],
  },

  // ── Calls to Action ───────────────────────────────────────────────
  // These reuse the existing `ctaSection` / `careersSection` object types and
  // their BuildingSection / CareersSection renderers, so they work on current
  // pages with no schema duplication or content migration.
  {
    type: "ctaSection",
    title: "Call to action",
    description: "Headline, body, two buttons and media in a colour band.",
    category: "cta",
    available: true,
    surface: "brand",
    width: "contained",
    variants: [
      { value: "green", title: "Green" },
      { value: "blue", title: "Blue" },
    ],
  },
  {
    type: "careersSection",
    title: "Careers",
    description: "The careers CTA band — eyebrow, heading, lead, body, buttons.",
    category: "cta",
    available: true,
    surface: "brand",
    width: "contained",
    variants: [
      { value: "mint", title: "Mint" },
      { value: "blue", title: "Blue" },
    ],
  },

  // ── People & Team ─────────────────────────────────────────────────
  {
    type: "teamBlock",
    title: "Team",
    description: "A responsive grid of leader portraits — image, name, role, bio.",
    category: "people",
    available: true,
    surface: "light",
    width: "contained",
  },
];

/** Lookup a block's catalog entry by `_type`. */
export function getBlock(type: string): CatalogBlock | undefined {
  return BLOCKS.find((b) => b.type === type);
}

/** Blocks that are built and insertable, in category order. */
export function availableBlocks(): CatalogBlock[] {
  return BLOCKS.filter((b) => b.available);
}

/**
 * Insert-menu groups for a Sanity array `options.insertMenu`, built from the
 * available blocks. Pass the result straight into the array field's options.
 */
export function insertMenuGroups() {
  return CATEGORY_ORDER.filter((cat) =>
    BLOCKS.some((b) => b.available && b.category === cat),
  ).map((cat) => ({
    name: cat,
    title: CATEGORY_TITLES[cat],
    of: BLOCKS.filter((b) => b.available && b.category === cat).map((b) => b.type),
  }));
}

/** Public path to a block/variant thumbnail (generated by the script). */
export function thumbnailPath(type: string, variant?: string): string {
  return `/static/blocks/${type}${variant ? `-${variant}` : ""}.png`;
}
