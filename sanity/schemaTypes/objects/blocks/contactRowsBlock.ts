import { defineField, defineType } from "sanity";

import { i18nValue } from "../../previewI18n";

/**
 * A clean label / value contact grid. Framed by the Zone. Reuses the shared
 * `contactRow` object type (label + value + optional copy value), so existing
 * contact content models straight in. No variants.
 */
export const contactRowsBlock = defineType({
  name: "contactRowsBlock",
  title: "Contact rows",
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
      name: "rows",
      title: "Rows",
      type: "array",
      of: [{ type: "contactRow" }],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { title: "heading", rows: "rows" },
    prepare: ({ title, rows }) => ({
      title: i18nValue(title) || "Contact rows",
      subtitle: `Contact — ${rows?.length ?? 0} rows`,
    }),
  },
});
