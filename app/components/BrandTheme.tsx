import {
  COLOR_ROLES,
  FONT_VAR,
  LAYOUT_TOKENS,
  TYPE_STYLES,
  type TypeFont,
} from "@/sanity/lib/brandTokens";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { BRAND_SETTINGS_QUERY } from "@/sanity/lib/queries";

/** Shape of one stored typography style (see objects/typeStyle.ts). */
type StoredTypeStyle = {
  font?: TypeFont;
  size?: string;
  lineHeight?: string;
  letterSpacing?: string;
  weight?: string;
  transform?: string;
};

type BrandSettings = {
  colors?: Record<string, string | undefined> | null;
  typography?: Record<string, StoredTypeStyle | undefined> | null;
  layout?: Record<string, string | undefined> | null;
} | null;

/**
 * Strip anything that could break out of a CSS declaration. Values come from
 * trusted editors, but this is injected into a raw <style>, so we defensively
 * drop the characters that could terminate the declaration/block or open a
 * tag, and cap the length.
 */
function css(value: string | undefined | null): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[<>{};\\]/g, "").trim();
  return cleaned ? cleaned.slice(0, 120) : null;
}

/** Build a single `--var: value;` line, or "" when the value is empty. */
function decl(name: string, value: string | null): string {
  return value ? `${name}:${value};` : "";
}

/**
 * Injects the editable brand tokens from the Sanity `brandSettings` singleton
 * as a `:root` block, overriding the `--brand-*` fallbacks baked into
 * globals.css. Emits only the tokens that are set, so anything left blank
 * falls back to the shipped default. Rendered near the top of <body> in the
 * root layout so the whole tree is themed.
 */
export default async function BrandTheme() {
  const data = await loadQuery<BrandSettings>(BRAND_SETTINGS_QUERY, {
    tags: [TAG.brandSettings],
  });
  if (!data) return null;

  const lines: string[] = [];

  // Colours → --brand-<role>
  for (const role of COLOR_ROLES) {
    lines.push(decl(role.cssVar, css(data.colors?.[role.key])));
  }

  // Typography → --brand-<style>-{font,size,leading,tracking,weight,transform}
  for (const style of TYPE_STYLES) {
    const s = data.typography?.[style.key];
    if (!s) continue;
    const fontVar =
      s.font === "display" || s.font === "sans" ? FONT_VAR[s.font] : null;
    lines.push(decl(`${style.cssPrefix}-font`, fontVar));
    lines.push(decl(`${style.cssPrefix}-size`, css(s.size)));
    lines.push(decl(`${style.cssPrefix}-leading`, css(s.lineHeight)));
    lines.push(decl(`${style.cssPrefix}-tracking`, css(s.letterSpacing)));
    lines.push(decl(`${style.cssPrefix}-weight`, css(s.weight)));
    lines.push(decl(`${style.cssPrefix}-transform`, css(s.transform)));
  }

  // Layout → --brand-<token>
  for (const token of LAYOUT_TOKENS) {
    lines.push(decl(token.cssVar, css(data.layout?.[token.key])));
  }

  const body = lines.filter(Boolean).join("");
  if (!body) return null;

  return (
    <style dangerouslySetInnerHTML={{ __html: `:root{${body}}` }} />
  );
}
