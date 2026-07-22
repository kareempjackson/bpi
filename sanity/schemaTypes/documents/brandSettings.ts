import { defineField, defineType } from "sanity";

import { COLOR_ROLES, LAYOUT_TOKENS, TYPE_STYLES } from "../../lib/brandTokens";

/**
 * Brand design system — the editable brand layer. Holds the colour palette,
 * the named typography styles, and the core layout tokens that the whole site
 * is built from. Values are injected at runtime as `:root` CSS variables by
 * `<BrandTheme>` (app/components/BrandTheme.tsx), overriding the `@theme`
 * defaults in globals.css with no rebuild.
 *
 * Fields are generated from the single source of truth in
 * `sanity/lib/brandTokens.ts`, and each is seeded (initialValue) with the
 * value the site currently ships, so a freshly created document matches
 * today's look exactly.
 */
export const brandSettings = defineType({
  name: "brandSettings",
  title: "Brand",
  type: "document",
  groups: [
    { name: "colors", title: "Colours", default: true },
    { name: "typography", title: "Typography" },
    { name: "layout", title: "Layout" },
  ],
  fields: [
    defineField({
      name: "colors",
      title: "Colour palette",
      type: "object",
      group: "colors",
      options: { columns: 2 },
      description:
        "Named brand colours. Editing one restyles every use of that colour across the site.",
      fields: COLOR_ROLES.map((role) =>
        defineField({
          name: role.key,
          title: role.label,
          description: role.description,
          type: "hexColor",
          initialValue: role.default,
        }),
      ),
    }),
    defineField({
      name: "typography",
      title: "Typography styles",
      type: "object",
      group: "typography",
      description:
        "The on-brand text styles. Blocks and rich text reference these by name, so a change here flows everywhere that style is used.",
      fields: TYPE_STYLES.map((style) =>
        defineField({
          name: style.key,
          title: style.label,
          description: style.description,
          type: "typeStyle",
          initialValue: style.default,
        }),
      ),
    }),
    defineField({
      name: "layout",
      title: "Layout tokens",
      type: "object",
      group: "layout",
      options: { columns: 2 },
      description: "Corner radii, spacing/gutters, and the max content width.",
      fields: LAYOUT_TOKENS.map((token) =>
        defineField({
          name: token.key,
          title: token.label,
          type: "string",
          initialValue: token.default,
        }),
      ),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Brand" }),
  },
});
