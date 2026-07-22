/**
 * Brand design tokens — the single source of truth for the editable brand
 * layer. The Sanity `brandSettings` singleton builds its fields from these,
 * the runtime `<BrandTheme>` injector maps stored values onto CSS variables,
 * and the GROQ projection reads them back. Keep this file the one place the
 * token list lives so the schema, the injector, and the query never drift.
 *
 * Each token names the intermediate `--brand-*` CSS variable it drives. In
 * `app/globals.css` the corresponding Tailwind v4 `@theme` entry (and a few
 * semantic type classes) reference that variable with the current value as
 * the fallback — so when nothing is injected the site looks exactly as it
 * does today, and an injected override wins with no rebuild.
 */

/** A named brand colour role. `cssVar` is what globals.css references. */
export type ColorRole = {
  key: string;
  label: string;
  description?: string;
  cssVar: string;
  /** Current value — also the globals.css fallback and the schema initialValue. */
  default: string;
};

/**
 * Colour roles. Note the code's Tailwind ramps are semantically inverted
 * (`error-*` is the mint/green, `warning-*` is teal, `primary-*` is navy);
 * these roles relabel them to real brand names for editors. Each drives the
 * base stop of its ramp (and the matching `--color-base-*`).
 */
export const COLOR_ROLES: ColorRole[] = [
  {
    key: "ink",
    label: "Ink / Navy",
    description: "Primary text and dark UI. Drives the navy ramp.",
    cssVar: "--brand-ink",
    default: "#000036",
  },
  {
    key: "accentGreen",
    label: "Accent — Green (mint)",
    description: "The signature BPI mint. Drives the green ramp.",
    cssVar: "--brand-accent-green",
    default: "#06FE83",
  },
  {
    key: "accentTeal",
    label: "Accent — Teal",
    description: "Brand teal/blue. Drives the teal ramp.",
    cssVar: "--brand-accent-teal",
    default: "#0870AD",
  },
  {
    key: "surfaceLight",
    label: "Surface — Light green",
    description: "The site-wide page background tint.",
    cssVar: "--brand-surface-light",
    default: "#EAFBF1",
  },
  {
    key: "surfaceBlue",
    label: "Surface — Pale blue",
    description: "Light section-panel tint.",
    cssVar: "--brand-surface-blue",
    default: "#CAF1FF",
  },
  {
    key: "bandDark",
    label: "Band — Deep green",
    description: "Near-black deep green for dark section bands.",
    cssVar: "--brand-band-dark",
    default: "#01190D",
  },
  {
    key: "white",
    label: "White",
    cssVar: "--brand-white",
    default: "#FFFFFF",
  },
  {
    key: "black",
    label: "Black",
    cssVar: "--brand-black",
    default: "#000000",
  },
];

/** Which loaded font family a text style uses. */
export type TypeFont = "display" | "sans";

/** A named, editable typography style (e.g. H1, Body, Eyebrow). */
export type TypeStyle = {
  key: string;
  label: string;
  description?: string;
  /** CSS-var prefix; the injector emits `${prefix}-font`, `-size`, etc. */
  cssPrefix: string;
  default: {
    font: TypeFont;
    size: string;
    lineHeight: string;
    letterSpacing: string;
    weight: string;
    transform: "none" | "uppercase";
    /** italic is fixed in the type class (quote); not editor-controlled. */
    italic?: boolean;
  };
};

/**
 * The named brand text styles. Defaults mirror the recurring on-brand
 * utility clusters found across the components today, so the semantic
 * `.type-*` classes render identically before any edit.
 */
export const TYPE_STYLES: TypeStyle[] = [
  {
    key: "display",
    label: "Display / Hero",
    cssPrefix: "--brand-display",
    default: { font: "display", size: "3.75rem", lineHeight: "1.02", letterSpacing: "-0.03em", weight: "600", transform: "none" },
  },
  {
    key: "h1",
    label: "Heading 1",
    cssPrefix: "--brand-h1",
    default: { font: "display", size: "2.25rem", lineHeight: "1.05", letterSpacing: "-0.02em", weight: "700", transform: "none" },
  },
  {
    key: "h2",
    label: "Heading 2",
    cssPrefix: "--brand-h2",
    default: { font: "display", size: "1.875rem", lineHeight: "1.15", letterSpacing: "-0.02em", weight: "600", transform: "none" },
  },
  {
    key: "h3",
    label: "Heading 3",
    cssPrefix: "--brand-h3",
    default: { font: "display", size: "1.5rem", lineHeight: "1.3", letterSpacing: "-0.015em", weight: "600", transform: "none" },
  },
  {
    key: "cardHeading",
    label: "Card heading",
    cssPrefix: "--brand-card-heading",
    default: { font: "display", size: "1.125rem", lineHeight: "1.2", letterSpacing: "-0.01em", weight: "700", transform: "none" },
  },
  {
    key: "eyebrow",
    label: "Eyebrow / Kicker",
    cssPrefix: "--brand-eyebrow",
    default: { font: "sans", size: "0.8125rem", lineHeight: "1.4", letterSpacing: "0.18em", weight: "600", transform: "uppercase" },
  },
  {
    key: "lead",
    label: "Lead / Intro",
    cssPrefix: "--brand-lead",
    default: { font: "sans", size: "1.25rem", lineHeight: "1.6", letterSpacing: "0em", weight: "400", transform: "none" },
  },
  {
    key: "body",
    label: "Body",
    cssPrefix: "--brand-body",
    default: { font: "sans", size: "1.125rem", lineHeight: "1.75", letterSpacing: "0em", weight: "400", transform: "none" },
  },
  {
    key: "bodySmall",
    label: "Body — Small",
    cssPrefix: "--brand-body-sm",
    default: { font: "sans", size: "1rem", lineHeight: "1.6", letterSpacing: "0em", weight: "400", transform: "none" },
  },
  {
    key: "quote",
    label: "Quote / Pull-quote",
    cssPrefix: "--brand-quote",
    default: { font: "display", size: "1.5rem", lineHeight: "1.35", letterSpacing: "-0.01em", weight: "400", transform: "none", italic: true },
  },
  {
    key: "caption",
    label: "Caption",
    cssPrefix: "--brand-caption",
    default: { font: "sans", size: "0.875rem", lineHeight: "1.5", letterSpacing: "0em", weight: "400", transform: "none" },
  },
  {
    key: "label",
    label: "Label / Button",
    cssPrefix: "--brand-label",
    default: { font: "sans", size: "0.875rem", lineHeight: "1.2", letterSpacing: "0em", weight: "600", transform: "none" },
  },
];

/** An editable layout token (radius / spacing / container width). */
export type LayoutToken = {
  key: string;
  label: string;
  cssVar: string;
  default: string;
};

export const LAYOUT_TOKENS: LayoutToken[] = [
  { key: "radiusSm", label: "Radius — small", cssVar: "--brand-radius-sm", default: "12px" },
  { key: "radiusLg", label: "Radius — large", cssVar: "--brand-radius-lg", default: "24px" },
  { key: "radiusRound", label: "Radius — round", cssVar: "--brand-radius-round", default: "60px" },
  { key: "gutter", label: "Gutter", cssVar: "--brand-gutter", default: "24px" },
  { key: "gutterSm", label: "Gutter — small", cssVar: "--brand-gutter-sm", default: "12px" },
  { key: "margin", label: "Page margin", cssVar: "--brand-margin", default: "120px" },
  { key: "column", label: "Column", cssVar: "--brand-column", default: "84px" },
  { key: "container", label: "Container width", cssVar: "--brand-container", default: "130rem" },
];

/** Map a stored `font` choice to the CSS font-family variable it uses. */
export const FONT_VAR: Record<TypeFont, string> = {
  display: "var(--font-display)",
  sans: "var(--font-sans)",
};
