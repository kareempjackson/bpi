import { defineField, defineType } from "sanity";

import { i18nValue } from "../../previewI18n";

/**
 * A heading + intro over a responsive grid of colour cards (title pinned top,
 * body anchored bottom), reusing the shared `investorCard` object type. Colour
 * is per-card so a row can alternate on brand. Framed by the Zone. No block
 * variant — the visual range comes from the per-card background + column count.
 */
export const cardGridBlock = defineType({
  name: "cardGridBlock",
  title: "Card grid",
  type: "object",
  fields: [
    defineField({
      name: "enabled",
      title: "Show this section",
      description: "Turn the block off without deleting it.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "internationalizedArrayPortableText",
    }),
    defineField({
      name: "columns",
      title: "Columns",
      description: "Cards per row on large screens (2–4).",
      type: "number",
      options: { list: [2, 3, 4] },
      initialValue: 3,
    }),
    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      of: [{ type: "investorCard" }],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { title: "heading", cards: "cards" },
    prepare: ({ title, cards }) => ({
      title: i18nValue(title) || "Card grid",
      subtitle: `Cards — ${cards?.length ?? 0} items`,
    }),
  },
});
