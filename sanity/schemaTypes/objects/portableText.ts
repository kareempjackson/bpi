import { defineField } from "sanity";

/**
 * Alias type for rich-text bodies, registered so the internationalized-array
 * plugin can wrap it per-language (→ `internationalizedArrayPortableText`).
 *
 * The plugin rewrites this field's `name` to `value` inside each language
 * item, so the stored shape is:
 *   body: [{ _key, language: "en", value: [<portable text blocks>] }, …]
 *
 * Block + image cover every body on the site (article copy, bios, event
 * descriptions, etc.), so a single shared alias keeps the rich-text config
 * consistent everywhere.
 */
export const portableText = defineField({
  name: "portableText",
  title: "Body",
  type: "array",
  of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
});
